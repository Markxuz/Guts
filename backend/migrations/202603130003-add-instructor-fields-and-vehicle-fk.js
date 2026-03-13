module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("instructors", "license_number", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn("instructors", "specialization", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn("instructors", "status", {
      type: Sequelize.STRING(30),
      allowNull: true,
      defaultValue: "Active",
    });

    await queryInterface.addColumn("instructors", "assigned_vehicle_id", {
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
