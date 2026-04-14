const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PromoEntitlement = sequelize.define(
    "PromoEntitlement",
    {
      promo_package_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      module_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "not_started",
      },
      required_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      completed_sessions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "promo_entitlements",
      timestamps: false,
    }
  );

  return PromoEntitlement;
};
