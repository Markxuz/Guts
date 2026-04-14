const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Schedule = sequelize.define("Schedule", {
		course_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		instructor_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		care_of_instructor_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		vehicle_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		enrollment_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		student_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		schedule_date: {
			type: DataTypes.DATEONLY,
			allowNull: true,
		},
		start_time: {
			type: DataTypes.TIME,
			allowNull: true,
		},
		end_time: {
			type: DataTypes.TIME,
			allowNull: true,
		},
		slots: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		remarks: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		student_remarks: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		instructor_remarks: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	}, {
		tableName: "schedules",
		timestamps: false,
	});

	return Schedule;
};
