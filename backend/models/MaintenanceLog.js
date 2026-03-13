const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const MaintenanceLog = sequelize.define("MaintenanceLog", {
		vehicle_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		service_type: {
			type: DataTypes.STRING(120),
			allowNull: false,
		},
		date_of_service: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		next_schedule_date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		maintenance_cost: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: true,
			defaultValue: 0,
		},
		remarks: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: DataTypes.NOW,
		},
	}, {
		tableName: "maintenance_logs",
		timestamps: false,
	});

	return MaintenanceLog;
};
