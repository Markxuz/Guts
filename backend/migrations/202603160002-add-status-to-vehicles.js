async function hasColumn(queryInterface, tableName, columnName) {
  const definition = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(definition, columnName);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await hasColumn(queryInterface, "vehicles", "status"))) {
      await queryInterface.addColumn("vehicles", "status", {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: "Available",
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE vehicles
      SET status = COALESCE(NULLIF(status, ''), 'Available')
    `);
  },
};
