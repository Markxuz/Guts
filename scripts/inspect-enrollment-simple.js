#!/usr/bin/env node
/**
 * Direct DB inspection for enrollment #11
 * Requires mysql2 or similar - uses env vars from .env
 */

const mysql = require('mysql2/promise');

async function main() {
  const enrollmentId = process.argv[2] || 11;
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'guts_app',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'guts_db',
  });

  try {
    console.log(`\n📋 ENROLLMENT #${enrollmentId} DATA\n${'═'.repeat(70)}\n`);

    // Get enrollment data
    const [enrollmentRows] = await connection.query(
      `SELECT * FROM Enrollments WHERE id = ?`,
      [enrollmentId]
    );

    if (enrollmentRows.length === 0) {
      console.error(`❌ Enrollment #${enrollmentId} not found`);
      process.exit(1);
    }

    const enrollment = enrollmentRows[0];
    console.log('📌 ENROLLMENT RECORD:');
    console.log(`  ID: ${enrollment.id}`);
    console.log(`  Student ID: ${enrollment.student_id}`);
    console.log(`  Fee Amount: PHP ${enrollment.fee_amount}`);
    console.log(`  Discount: PHP ${enrollment.discount_amount}`);
    console.log(`  Balance: PHP ${enrollment.balance}`);
    console.log(`  Payment Status: ${enrollment.payment_status}`);
    console.log(`  Payment Terms: ${enrollment.payment_terms}`);

    // Get student data
    const [studentRows] = await connection.query(
      `SELECT id, first_name, last_name, email, phone FROM Students WHERE id = ?`,
      [enrollment.student_id]
    );

    if (studentRows.length > 0) {
      const student = studentRows[0];
      console.log('\n👤 STUDENT RECORD:');
      console.log(`  ID: ${student.id}`);
      console.log(`  Name: ${student.first_name} ${student.last_name}`);
      console.log(`  Email (student.email): "${student.email || 'NULL'}"`);
      console.log(`  Phone: ${student.phone}`);
    }

    // Get student profile data
    const [profileRows] = await connection.query(
      `SELECT id, user_id, gmail_account, house_number, street, barangay, city, province FROM StudentProfiles WHERE user_id = ?`,
      [enrollment.student_id]
    );

    if (profileRows.length > 0) {
      const profile = profileRows[0];
      console.log('\n📝 STUDENT PROFILE RECORD:');
      console.log(`  ID: ${profile.id}`);
      console.log(`  Gmail Account: "${profile.gmail_account || 'NULL'}"`);
      console.log(`  Address Parts:`);
      console.log(`    House: "${profile.house_number || 'NULL'}"`);
      console.log(`    Street: "${profile.street || 'NULL'}"`);
      console.log(`    Barangay: "${profile.barangay || 'NULL'}"`);
      console.log(`    City: "${profile.city || 'NULL'}"`);
      console.log(`    Province: "${profile.province || 'NULL'}"`);
    }

    // Get payments
    const [paymentRows] = await connection.query(
      `SELECT id, enrollment_id, amount, status, payment_date, payment_terms, payment_reference_number, payment_notes, createdAt FROM Payments WHERE enrollment_id = ? ORDER BY createdAt DESC`,
      [enrollmentId]
    );

    console.log(`\n💰 PAYMENTS (${paymentRows.length} records):`);
    if (paymentRows.length > 0) {
      paymentRows.forEach((pmt, idx) => {
        console.log(`\n  Payment ${idx + 1}:`);
        console.log(`    ID: ${pmt.id}`);
        console.log(`    Amount: PHP ${pmt.amount}`);
        console.log(`    Status: ${pmt.status}`);
        console.log(`    Terms: ${pmt.payment_terms}`);
        console.log(`    Date: ${pmt.payment_date}`);
        console.log(`    Reference: ${pmt.payment_reference_number || 'NULL'}`);
        console.log(`    Notes: ${pmt.payment_notes || 'NULL'}`);
        console.log(`    Created: ${pmt.createdAt}`);
      });
    } else {
      console.log('  No payments found.');
    }

    // Calculate totals
    const totalPaid = paymentRows
      .filter(p => p.status === 'completed' || p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Total Payments (completed): PHP ${totalPaid.toFixed(2)}`);
    console.log(`  Current Balance (DB): PHP ${enrollment.balance}`);
    console.log(`  Fee Amount: PHP ${enrollment.fee_amount}`);
    
    const expectedBalance = parseFloat(enrollment.fee_amount || 0) - totalPaid;
    console.log(`  Expected Balance (fee - paid): PHP ${expectedBalance.toFixed(2)}`);
    console.log(`  Match: ${Math.abs(expectedBalance - parseFloat(enrollment.balance || 0)) < 0.01 ? '✓ YES' : '✗ NO'}`);

    console.log('\n' + '═'.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
