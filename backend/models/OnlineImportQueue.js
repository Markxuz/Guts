const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OnlineImportQueue = sequelize.define(
    "OnlineImportQueue",
    {
      source: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      external_ref: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      raw_payload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      mapped_payload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      import_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "received",
      },
      reviewed_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "online_import_queue",
      timestamps: false,
    }
  );

  return OnlineImportQueue;
};
