const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Instructor = sequelize.define("Instructor", {
		name: {
			type: DataTypes.STRING(100),
			allowNull: true,
		},
		license_number: {
			type: DataTypes.STRING(50),
			allowNull: true,
		},
		specialization: {
			type: DataTypes.STRING(50),
			allowNull: true,
		},
		status: {
			type: DataTypes.STRING(30),
			allowNull: true,
			defaultValue: "Active",
			validate: {
				isIn: [["Active", "On Leave"]],
			},
		},
		assigned_vehicle_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		tdc_cert_expiry: {
			type: DataTypes.DATEONLY,
			allowNull: true,
		},
		pdc_cert_expiry: {
			type: DataTypes.DATEONLY,
			allowNull: true,
		},
		certification_file_name: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		phone: {
			type: DataTypes.STRING(20),
			allowNull: true,
			validate: {
				len: [0, 20],
			},
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	});

	return Instructor;
};
