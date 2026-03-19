const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ScheduleChangeRequest = sequelize.define(
    "ScheduleChangeRequest",
    {
      schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      enrollment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      requested_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reviewed_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      requested_schedule_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      requested_slot: {
        type: DataTypes.ENUM("morning", "afternoon"),
        allowNull: false,
      },
      request_scope: {
        type: DataTypes.ENUM("single", "both"),
        allowNull: false,
        defaultValue: "single",
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      reviewer_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "schedule_change_requests",
      timestamps: false,
    }
  );

  return ScheduleChangeRequest;
};