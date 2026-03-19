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
    await addColumnIfMissing(queryInterface, "instructors", "license_number", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "instructors", "specialization", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "instructors", "status", {
      type: Sequelize.STRING(30),
      allowNull: true,
      defaultValue: "Active",
    });

    await addColumnIfMissing(queryInterface, "instructors", "assigned_vehicle_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "vehicles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
