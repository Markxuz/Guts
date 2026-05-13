/**
 * Backfill missing Payment records for imported TDC enrollments.
 * Imported students from OTDC/SafeRoads should have Payment records set to "paid" status.
 * This script creates missing payments for enrollments that don't have any payment record yet.
 * 
 * Usage: node scripts/backfill-imported-payments.js
 */

require("dotenv").config();
const path = require("path");
const { Payment, sequelize } = require(path.join(__dirname, "../models"));

async function backfillImportedPayments() {
  console.log("Starting backfill of imported payments...");

  try {
    // Find all enrollments from imported sources using raw query (without transaction for initial read)
    const importedEnrollments = await sequelize.query(
      `SELECT e.id, e.student_id, e.fee_amount, e.payment_reference_number, e.external_application_ref, e.enrollment_channel, e.created_at
       FROM Enrollments e
       WHERE e.enrollment_channel IN ('otdc', 'saferoads')
       AND NOT EXISTS (SELECT 1 FROM Payments p WHERE p.enrollment_id = e.id)`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log(`Found ${importedEnrollments.length} imported enrollments without payments`);

    let created = 0;

    for (const enrollment of importedEnrollments) {
      const transaction = await sequelize.transaction();

      try {
        // Create a Payment record set to "paid" status
        const feeAmount = enrollment.fee_amount || 999;
        const referenceNumber = enrollment.payment_reference_number || enrollment.external_application_ref || `imported-${enrollment.id}`;

        await Payment.create(
          {
            enrollment_id: enrollment.id,
            amount: feeAmount,
            payment_method: enrollment.enrollment_channel === "otdc" ? "bank_transfer" : "cash",
            payment_status: "paid",
            reference_number: referenceNumber,
            account_number: null,
            created_at: enrollment.created_at,
          },
          { transaction }
        );

        await transaction.commit();
        created += 1;
        if (created % 10 === 0) {
          console.log(`  Created ${created} payments...`);
        }
      } catch (err) {
        await transaction.rollback();
        console.error(`  Error creating payment for enrollment ${enrollment.id}:`, err.message);
      }
    }

    console.log(`\nBackfill complete:`);
    console.log(`  Created: ${created}`);
    console.log(`  Total processed: ${created}`);
    process.exit(0);
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  }
}

// Run the backfill
backfillImportedPayments();
