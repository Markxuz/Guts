async function hasColumn(queryInterface, tableName, columnName) {
  const definition = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(definition, columnName);
}

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  if (!(await hasColumn(queryInterface, tableName, columnName))) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, "enrollments", "fee_amount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "enrollments", "discount_amount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "enrollments", "payment_terms", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "enrollments", "payment_reference_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "enrollments", "payment_notes", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
