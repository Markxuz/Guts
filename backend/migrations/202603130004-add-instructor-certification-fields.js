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
    await addColumnIfMissing(queryInterface, "instructors", "tdc_cert_expiry", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "instructors", "pdc_cert_expiry", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "instructors", "certification_file_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
};
