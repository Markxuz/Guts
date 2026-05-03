"use strict";

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  const table = await queryInterface.describeTable(tableName);
  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, "PromoOffers", "applies_to", {
      type: Sequelize.ENUM("ALL", "TDC", "PDC", "PROMO"),
      allowNull: false,
      defaultValue: "ALL",
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("PromoOffers");
    if (table.applies_to) {
      await queryInterface.removeColumn("PromoOffers", "applies_to");
    }
  },
};
