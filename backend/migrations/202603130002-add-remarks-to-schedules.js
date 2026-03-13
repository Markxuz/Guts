async function hasColumn(queryInterface, tableName, columnName) {
  const definition = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(definition, columnName);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await hasColumn(queryInterface, "schedules", "remarks"))) {
      await queryInterface.addColumn("schedules", "remarks", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
};
