async function hasTable(queryInterface, tableName) {
  try {
    await queryInterface.describeTable(tableName);
    return true;
  } catch {
    return false;
  }
}

async function hasColumn(queryInterface, tableName, columnName) {
  const definition = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(definition, columnName);
}

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
  if (!(await hasTable(queryInterface, tableName))) return;
  if (!(await hasColumn(queryInterface, tableName, columnName))) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, "students", "source_channel", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "walk_in",
    });

    await addColumnIfMissing(queryInterface, "students", "external_source", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "students", "external_student_ref", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "enrollments", "enrollment_channel", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "walk_in",
    });

    await addColumnIfMissing(queryInterface, "enrollments", "external_application_ref", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "schedules", "student_remarks", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "schedules", "instructor_remarks", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const removeIfExists = async (tableName, columnName) => {
      if (!(await hasTable(queryInterface, tableName))) return;
      if (await hasColumn(queryInterface, tableName, columnName)) {
        await queryInterface.removeColumn(tableName, columnName);
      }
    };

    await removeIfExists("schedules", "instructor_remarks");
    await removeIfExists("schedules", "student_remarks");
    await removeIfExists("enrollments", "external_application_ref");
    await removeIfExists("enrollments", "enrollment_channel");
    await removeIfExists("students", "external_student_ref");
    await removeIfExists("students", "external_source");
    await removeIfExists("students", "source_channel");
  },
};
