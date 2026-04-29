"use strict";

function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  return queryInterface.describeTable(tableName).then((columns) => {
    if (!Object.prototype.hasOwnProperty.call(columns, columnName)) {
      return queryInterface.addColumn(tableName, columnName, definition);
    }

    return null;
  });
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, "enrollments", "tdc_source", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("enrollments", "tdc_source");
  },
};