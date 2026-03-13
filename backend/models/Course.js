const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Course = sequelize.define("Course", {
    course_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },
  });

  return Course;
};