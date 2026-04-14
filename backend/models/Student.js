const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Student = sequelize.define(
    "Student",
    {
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      middle_name: {
        type: DataTypes.STRING,
      },

      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        unique: true,
      },

      phone: {
        type: DataTypes.STRING,
      },

      source_channel: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "walk_in",
      },

      external_source: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      external_student_ref: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  );

  return Student;
};