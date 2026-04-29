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
    await addColumnIfMissing(queryInterface, "fuel_logs", "odometer_start", {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "fuel_logs", "odometer_end", {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "fuel_logs", "distance_travelled", {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "fuel_logs", "fuel_consumed_liters", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },
};
