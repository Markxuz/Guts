/**
 * Playwright script to debug enrollment flows locally
 * Tests:
 * 1. QR Review modal data loading
 * 2. Desired dates persistence from public form
 * 3. Instructor dropdown loading
 * 4. Payment Status/Balance updates
 * 5. Payment Ledger display
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:8080';
const ADMIN_EMAIL = 'admin@guts.local';
const ADMIN_PASSWORD = 'ChangeMe!Admin123';

async function login(page) {
  console.log('\n📋 STEP 1: Login as Admin');
  const response = await page.request.post(`${BASE_URL}/api/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  console.log(`   - /api/auth/login responded with status ${response.status()}`);

  const body = await response.json();
  console.log(`   - /api/auth/login response body: ${JSON.stringify(body).substring(0, 600)}`);

  await page.addInitScript((auth) => {
    localStorage.setItem('guts_auth', JSON.stringify(auth));
  }, body);
  await page.goto(`${BASE_URL}/`);
  await page.waitForLoadState('networkidle');
  console.log('✅ Logged in');
}

async function testQRReviewModal(page) {
  console.log('\n📋 STEP 2: Test QR Review Modal Data Loading');
  
  // Navigate to Pending QR Enrollments
  await page.goto(`${BASE_URL}/enrollments/qr-pending`);
  await page.waitForSelector('text=Pending QR enrollments', { timeout: 5000 });
  await page.waitForSelector('table tbody tr', { timeout: 10000 });

  // Click Review button from the first queue row
  const reviewButton = page.locator('table tbody tr').first().locator('button:has-text("Review")');
  if (await reviewButton.count()) {
    console.log('   ✓ Review button found');
    await reviewButton.click();
    
    // Wait for modal to open
    await page.waitForSelector('text=Edit Submission', { timeout: 5000 });
    console.log('   ✓ Modal opened');
    
    // Check what data is loaded
    const firstNameInput = page.locator('label').filter({ hasText: 'First Name *' }).locator('input').first();
    const firstNameValue = await firstNameInput.inputValue().catch(() => null);
    console.log(`   - First Name: "${firstNameValue || 'EMPTY'}"`);
    
    const middleNameInput = page.locator('label').filter({ hasText: 'Middle Name' }).locator('input').first();
    const middleNameValue = await middleNameInput.inputValue().catch(() => null);
    if (middleNameValue !== null) {
      console.log(`   - Middle Name: "${middleNameValue || 'EMPTY'}"`);
    } else {
      console.log(`   ✗ Middle Name field NOT FOUND in modal`);
    }

    const lastNameInput = page.locator('label').filter({ hasText: 'Last Name *' }).locator('input').first();
    const lastNameValue = await lastNameInput.inputValue().catch(() => null);
    console.log(`   - Last Name: "${lastNameValue || 'EMPTY'}"`);
    
    const desiredDateInput = page.locator('input[type="date"]').first();
    const desiredDateValue = await desiredDateInput.inputValue().catch(() => null);
    console.log(`   - Desired Date (TDC): "${desiredDateValue || 'EMPTY'}"`);
    
    // Check instructor dropdown
    const instructorSelect = await page.$('select');
    if (instructorSelect) {
      const selectedValue = await instructorSelect.inputValue();
      console.log(`   - Instructor Dropdown: exists (value="${selectedValue || 'empty'}')`);
      
      // Get option count
      const options = await page.$$('select option');
      console.log(`   - Instructor Options Count: ${options.length}`);
    } else {
      console.log(`   ✗ Instructor dropdown NOT FOUND`);
    }
    
    await page.click('button:has-text("Cancel")');
    console.log('   ✓ Modal closed');
  } else {
    console.log('   ✗ Review button NOT FOUND');
  }
}

async function testPaymentStatusBalance(page) {
  console.log('\n📋 STEP 3: Test Payment Status/Balance in Student DB');
  
  // Navigate to Student Database
  await page.goto(`${BASE_URL}/students`);
  await page.waitForSelector('text=Student Database', { timeout: 5000 });
  
  // Look for the student row
  const studentRows = page.locator('table tbody tr').filter({ hasText: 'JOEFREY BUBAN SACAY' });
  const studentCount = await studentRows.count();
  if (studentCount > 0) {
    console.log('   ✓ Student found in list');
    const firstRow = studentRows.nth(0);
    const balanceText = await firstRow.locator('td').nth(8).textContent().catch(() => null);
    const paymentStatusText = await firstRow.locator('td').nth(7).textContent().catch(() => null);
    console.log(`   - Balance: "${(balanceText || '').trim() || 'NOT FOUND'}"`);
    console.log(`   - Payment Status: "${(paymentStatusText || '').trim() || 'NOT FOUND'}"`);
  } else {
    console.log('   ✗ Student NOT FOUND in list');
  }
}

async function testPaymentLedger(page) {
  console.log('\n📋 STEP 4: Test Payment Ledger Display');
  
  // Navigate to Payment Ledger
  await page.goto(`${BASE_URL}/payments`);
  await page.waitForSelector('text=Payment Ledger', { timeout: 5000 });
  
  // Check completed payments count
  const hasCompletedBox = await page.locator('text=COMPLETED PAYMENTS').count();
  if (hasCompletedBox > 0) {
    const box = page.locator('text=COMPLETED PAYMENTS').first();
    const completedCountText = await box.locator('..').locator('text=/\\d+/').first().textContent().catch(() => '0');
    console.log(`   - Completed Payments Count: ${completedCountText.trim()}`);
  } else {
    console.log('   - Completed Payments Count: 0');
  }

  // Check if any ledger entries
  const ledgerEntries = await page.locator('table tbody tr').count();
  console.log(`   - Ledger Entries: ${ledgerEntries}`);

  if (ledgerEntries > 0) {
    const firstStudentName = await page.locator('table tbody tr').first().locator('td').first().textContent().catch(() => null);
    console.log(`   ✓ First Entry Student: "${(firstStudentName || '').trim()}"`);
  } else {
    console.log(`   ✗ No ledger entries found`);
  }
}

async function testPublicFormDesiredDates(page) {
  console.log('\n📋 STEP 5: Test Public Form Desired Dates Persistence');
  console.log('   (This requires knowing the actual QR token - checking schema instead)');
  
  // For now, just check if enrollment has dates in the DB by inspecting the API
  try {
    const response = await page.request.get(`${BASE_URL}/api/enrollments/12`);
    if (response.ok()) {
      const data = await response.json();
      console.log(`   - Enrollment ID: ${data.id}`);
      console.log(`   - TDC Deadline: "${data.tdc_completion_deadline || 'NULL'}"`);
      console.log(`   - PDC Eligibility Date: "${data.pdc_eligibility_date || 'NULL'}"`);
      console.log(`   - Promo Schedule TDC: ${data.promo_schedule?.tdc?.item?.schedule_date ? '✓ exists' : '✗ null'}`);
    }
  } catch (e) {
    console.log(`   ✗ Could not fetch enrollment: ${e.message}`);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await login(page);
    await testQRReviewModal(page);
    await testPaymentStatusBalance(page);
    await testPaymentLedger(page);
    await testPublicFormDesiredDates(page);
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ DEBUG FLOW COMPLETED');
    console.log('='.repeat(70));
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

main();
