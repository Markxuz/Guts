const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Enrollment = sequelize.define("Enrollment", {
		student_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		schedule_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		package_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		dl_code_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		client_type: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		is_already_driver: {
			type: DataTypes.BOOLEAN,
			allowNull: true,
			defaultValue: false,
		},
		target_vehicle: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		transmission_type: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		motorcycle_type: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		training_method: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		pdc_type: {
			type: DataTypes.ENUM("beginner", "experience"),
			allowNull: true,
			defaultValue: null,
		},
		enrolling_for: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		score: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		status: {
			type: DataTypes.ENUM("pending", "confirmed", "completed"),
			allowNull: true,
			defaultValue: "pending",
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	});

	return Enrollment;
};
