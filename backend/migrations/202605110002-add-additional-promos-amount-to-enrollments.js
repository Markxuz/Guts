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
    if (!(await hasColumn(queryInterface, "Enrollments", "additional_promos_amount"))) {
      await queryInterface.addColumn("Enrollments", "additional_promos_amount", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      });
    }
  },

  down: async (queryInterface/*, Sequelize*/) => {
    if (await hasColumn(queryInterface, "Enrollments", "additional_promos_amount")) {
      await queryInterface.removeColumn("Enrollments", "additional_promos_amount");
    }
  },
};
