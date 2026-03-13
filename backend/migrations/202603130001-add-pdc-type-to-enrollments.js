async function hasColumn(queryInterface, tableName, columnName) {
  const definition = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(definition, columnName);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await hasColumn(queryInterface, "enrollments", "pdc_type"))) {
      await queryInterface.addColumn("enrollments", "pdc_type", {
        type: Sequelize.ENUM("beginner", "experience"),
        allowNull: true,
        defaultValue: null,
      });
    }
  },
};
