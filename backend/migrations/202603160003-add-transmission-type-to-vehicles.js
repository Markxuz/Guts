async function hasColumn(queryInterface, tableName, columnName) {
  const definition = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(definition, columnName);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await hasColumn(queryInterface, "vehicles", "transmission_type"))) {
      await queryInterface.addColumn("vehicles", "transmission_type", {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "Automatic",
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE vehicles
      SET transmission_type = COALESCE(NULLIF(transmission_type, ''), 'Automatic')
    `);
  },
};
