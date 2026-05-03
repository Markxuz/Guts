const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const PromoOffer = sequelize.define("PromoOffer", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		status: {
			type: DataTypes.ENUM("active", "inactive"),
			allowNull: false,
			defaultValue: "active",
		},
		applies_to: {
			type: DataTypes.ENUM("ALL", "TDC", "PDC", "PROMO"),
			allowNull: false,
			defaultValue: "ALL",
		},
		fixed_price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true,
		},
		discounted_price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true,
		},
		notes: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	});

	return PromoOffer;
};