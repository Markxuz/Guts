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
    },
    {
      timestamps: true,
    }
  );

  return Student;
};