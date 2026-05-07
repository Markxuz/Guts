#!/usr/bin/env node
/**
 * Inspect enrollment record and related payment/balance data
 * Usage: node scripts/inspect-enrollment.js <enrollmentId>
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Sequelize } = require('sequelize');

async function main() {
  const enrollmentId = process.argv[2] || 11;
  
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Import models
    const models = require('../backend/models');
    
    // Query enrollment with all associations
    const enrollment = await models.Enrollment.findByPk(enrollmentId, {
      include: [
        { model: models.Student, as: 'Student', include: [{ model: models.StudentProfile, as: 'StudentProfile' }] },
        { model: models.StudentProfile, as: 'profile' },
        { model: models.Payment, as: 'payments' },
      ],
    });

    if (!enrollment) {
      console.error(`❌ Enrollment #${enrollmentId} not found`);
      process.exit(1);
    }

    console.log('📋 ENROLLMENT #' + enrollment.id);
    console.log('═'.repeat(60));
    
    // Student info
    console.log('\n👤 STUDENT:');
    console.log(`  Name: ${enrollment.Student?.first_name} ${enrollment.Student?.last_name}`);
    console.log(`  Student ID: ${enrollment.Student?.id}`);
    console.log(`  Email (student.email): "${enrollment.Student?.email || 'N/A'}"`);
    console.log(`  Phone: ${enrollment.Student?.phone || 'N/A'}`);

    // Profile info
    const profile = enrollment.profile || enrollment.Student?.StudentProfile;
    console.log('\n📝 PROFILE:');
    console.log(`  Gmail Account: "${profile?.gmail_account || 'N/A'}"`);
    console.log(`  House Number: "${profile?.house_number || 'N/A'}"`);
    console.log(`  Street: "${profile?.street || 'N/A'}"`);
    console.log(`  Barangay: "${profile?.barangay || 'N/A'}"`);
    console.log(`  City: "${profile?.city || 'N/A'}"`);
    console.log(`  Province: "${profile?.province || 'N/A'}"`);

    // Enrollment balance info
    console.log('\n💰 ENROLLMENT FINANCIALS:');
    console.log(`  Fee Amount: PHP ${enrollment.fee_amount || 'N/A'}`);
    console.log(`  Discount Amount: PHP ${enrollment.discount_amount || 'N/A'}`);
    console.log(`  Balance: PHP ${enrollment.balance || 'N/A'}`);
    console.log(`  Payment Terms: ${enrollment.payment_terms || 'N/A'}`);
    console.log(`  Payment Status: ${enrollment.payment_status || 'N/A'}`);

    // Payments
    console.log('\n📊 PAYMENTS (' + (enrollment.payments?.length || 0) + '):');
    if (enrollment.payments && enrollment.payments.length > 0) {
      enrollment.payments.forEach((pmt, idx) => {
        console.log(`\n  Payment ${idx + 1}:`);
        console.log(`    ID: ${pmt.id}`);
        console.log(`    Amount: PHP ${pmt.amount}`);
        console.log(`    Status: ${pmt.status}`);
        console.log(`    Date: ${pmt.payment_date}`);
        console.log(`    Terms: ${pmt.payment_terms}`);
        console.log(`    Reference: ${pmt.payment_reference_number || 'N/A'}`);
        console.log(`    Notes: ${pmt.payment_notes || 'N/A'}`);
        console.log(`    Created: ${pmt.createdAt}`);
      });
    } else {
      console.log('  No payments recorded.');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n📌 RAW JSON:');
    console.log(JSON.stringify({
      enrollment: enrollment.toJSON ? enrollment.toJSON() : enrollment,
    }, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
