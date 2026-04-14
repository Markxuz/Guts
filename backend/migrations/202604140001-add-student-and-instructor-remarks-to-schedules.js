module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("schedules");

    if (!Object.prototype.hasOwnProperty.call(table, "student_remarks")) {
      await queryInterface.addColumn("schedules", "student_remarks", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!Object.prototype.hasOwnProperty.call(table, "instructor_remarks")) {
      await queryInterface.addColumn("schedules", "instructor_remarks", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("schedules");

    if (Object.prototype.hasOwnProperty.call(table, "instructor_remarks")) {
      await queryInterface.removeColumn("schedules", "instructor_remarks");
    }

    if (Object.prototype.hasOwnProperty.call(table, "student_remarks")) {
      await queryInterface.removeColumn("schedules", "student_remarks");
    }
  },
};