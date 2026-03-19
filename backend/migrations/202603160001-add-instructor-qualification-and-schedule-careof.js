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
    await addColumnIfMissing(queryInterface, "instructors", "tdc_certified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await addColumnIfMissing(queryInterface, "instructors", "pdc_beginner_certified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await addColumnIfMissing(queryInterface, "instructors", "pdc_experience_certified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await addColumnIfMissing(queryInterface, "schedules", "care_of_instructor_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "instructors",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.sequelize.query(`
      UPDATE instructors
      SET
        tdc_certified = CASE
          WHEN LOWER(COALESCE(specialization, '')) LIKE '%tdc%' THEN true
          ELSE COALESCE(tdc_certified, false)
        END,
        pdc_beginner_certified = CASE
          WHEN LOWER(COALESCE(specialization, '')) LIKE '%pdc%' THEN true
          ELSE COALESCE(pdc_beginner_certified, false)
        END,
        pdc_experience_certified = CASE
          WHEN LOWER(COALESCE(specialization, '')) LIKE '%pdc%' THEN true
          ELSE COALESCE(pdc_experience_certified, false)
        END
    `);
  },
};
