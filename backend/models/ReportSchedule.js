const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ReportSchedule = sequelize.define(
    "ReportSchedule",
    {
      recipients: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      frequency: {
        type: DataTypes.ENUM("daily", "weekly", "monthly"),
        allowNull: false,
      },
      file_format: {
        type: DataTypes.ENUM("csv", "excel", "pdf"),
        allowNull: false,
      },
      course: {
        type: DataTypes.ENUM("overall", "tdc", "pdc", "pdc_beginner", "pdc_experience"),
        allowNull: false,
        defaultValue: "overall",
      },
      created_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      next_run_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      last_sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      status: {
        type: DataTypes.ENUM("scheduled", "paused", "completed"),
        allowNull: false,
        defaultValue: "scheduled",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "report_schedules",
      timestamps: false,
    }
  );

  return ReportSchedule;
};