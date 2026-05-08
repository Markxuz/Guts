const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const VehicleUsage = sequelize.define(
    "VehicleUsage",
    {
      vehicle_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      instructor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      start_odometer: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      end_odometer: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "vehicle_usages",
      timestamps: false,
    }
  );

  return VehicleUsage;
};
