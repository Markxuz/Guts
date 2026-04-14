const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SessionAttendance = sequelize.define(
    "SessionAttendance",
    {
      enrollment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      module_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      session_no: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      attendance_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "present",
      },
      check_in_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      check_out_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      remarks: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "session_attendance",
      timestamps: false,
    }
  );

  return SessionAttendance;
};
