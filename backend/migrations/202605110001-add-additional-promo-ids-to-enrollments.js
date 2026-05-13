"use strict";

async function hasTable(queryInterface, tableName) {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch {
    return false;
  }
}

async function hasColumn(queryInterface, tableName, columnName) {
  if (!(await hasTable(queryInterface, tableName))) {
    return false;
  }

  const definition = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(definition, columnName);
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (!(await hasColumn(queryInterface, "Enrollments", "additional_promo_offer_ids"))) {
      await queryInterface.addColumn("Enrollments", "additional_promo_offer_ids", {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  down: async (queryInterface/*, Sequelize*/) => {
    if (await hasColumn(queryInterface, "Enrollments", "additional_promo_offer_ids")) {
      await queryInterface.removeColumn("Enrollments", "additional_promo_offer_ids");
    }
  },
};
