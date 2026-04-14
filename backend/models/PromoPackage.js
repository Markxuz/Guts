const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PromoPackage = sequelize.define(
    "PromoPackage",
    {
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      enrollment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      purchase_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      tdc_deadline: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      pdc_valid_until: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      allow_extension: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      extension_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "promo_packages",
      timestamps: false,
    }
  );

  return PromoPackage;
};
