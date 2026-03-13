const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const FuelLog = sequelize.define("FuelLog", {
		vehicle_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		liters: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		amount_spent: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
		},
		odometer_reading: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
		},
		logged_at: {
			type: DataTypes.DATEONLY,
			allowNull: true,
			defaultValue: DataTypes.NOW,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: DataTypes.NOW,
		},
	}, {
		tableName: "fuel_logs",
		timestamps: false,
	});

	return FuelLog;
};
