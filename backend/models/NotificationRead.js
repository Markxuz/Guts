const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const NotificationRead = sequelize.define(
    "NotificationRead",
    {
      notification_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      read_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
    }
  );

  return NotificationRead;
};
