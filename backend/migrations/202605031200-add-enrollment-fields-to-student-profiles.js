"use strict";

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  const table = await queryInterface.describeTable(tableName);
  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add enrollment-specific fields to student_profiles table
    await addColumnIfMissing(queryInterface, "student_profiles", "client_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "student_profiles", "promo_offer_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "student_profiles", "enrolling_for", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "student_profiles", "pdc_category", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "student_profiles", "tdc_source", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "student_profiles", "training_method", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "student_profiles", "is_already_driver", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "student_profiles", "target_vehicle", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "student_profiles", "transmission_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "student_profiles", "motorcycle_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("student_profiles");
    const columnsToRemove = [
      "client_type",
      "promo_offer_id",
      "enrolling_for",
      "pdc_category",
      "tdc_source",
      "training_method",
      "is_already_driver",
      "target_vehicle",
      "transmission_type",
      "motorcycle_type",
    ];

    for (const column of columnsToRemove) {
      if (table[column]) {
        await queryInterface.removeColumn("student_profiles", column);
      }
    }
  },
};
