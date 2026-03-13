async function hasColumn(queryInterface, tableName, columnName) {
  const definition = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(definition, columnName);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await hasColumn(queryInterface, "students", "middle_name"))) {
      await queryInterface.addColumn("students", "middle_name", {
        type: Sequelize.STRING,
        allowNull: true,
        after: "first_name",
      });
    }
  },
};
