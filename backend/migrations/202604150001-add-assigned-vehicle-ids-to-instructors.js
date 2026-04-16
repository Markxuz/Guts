async function hasColumn(queryInterface, tableName, columnName) {
  const definition = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(definition, columnName);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await hasColumn(queryInterface, "instructors", "assigned_vehicle_ids"))) {
      await queryInterface.addColumn("instructors", "assigned_vehicle_ids", {
        type: Sequelize.JSON,
        allowNull: true,
      });

      await queryInterface.sequelize.query(`
        UPDATE instructors
        SET assigned_vehicle_ids = JSON_ARRAY(assigned_vehicle_id)
        WHERE assigned_vehicle_id IS NOT NULL
      `);
    }
  },
};
