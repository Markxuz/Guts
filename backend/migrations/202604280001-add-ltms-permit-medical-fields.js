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
    // Add LTMS-related permit fields
    await addColumnIfMissing(queryInterface, "student_profiles", "student_permit_number", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "student_profiles", "student_permit_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "student_profiles", "student_permit_status", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add medical certificate tracking fields
    await addColumnIfMissing(queryInterface, "student_profiles", "medical_certificate_provider", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "student_profiles", "medical_certificate_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },
};
