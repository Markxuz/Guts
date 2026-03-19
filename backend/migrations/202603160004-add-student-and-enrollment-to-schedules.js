module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("schedules");

    if (!Object.prototype.hasOwnProperty.call(table, "enrollment_id")) {
      await queryInterface.addColumn("schedules", "enrollment_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "enrollments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }

    if (!Object.prototype.hasOwnProperty.call(table, "student_id")) {
      await queryInterface.addColumn("schedules", "student_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "students",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("schedules");

    if (Object.prototype.hasOwnProperty.call(table, "student_id")) {
      await queryInterface.removeColumn("schedules", "student_id");
    }

    if (Object.prototype.hasOwnProperty.call(table, "enrollment_id")) {
      await queryInterface.removeColumn("schedules", "enrollment_id");
    }
  },
};
