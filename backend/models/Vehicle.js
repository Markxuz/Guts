const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Vehicle = sequelize.define("Vehicle", {
		vehicle_name: {
			type: DataTypes.STRING(100),
			allowNull: true,
		},
		plate_number: {
			type: DataTypes.STRING(50),
			allowNull: true,
		},
		vehicle_type: {
			type: DataTypes.STRING(50),
			allowNull: true,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	});

	return Vehicle;
};
