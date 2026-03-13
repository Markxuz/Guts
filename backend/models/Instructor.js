const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Instructor = sequelize.define("Instructor", {
		name: {
			type: DataTypes.STRING(100),
			allowNull: true,
		},
		phone: {
			type: DataTypes.STRING(20),
			allowNull: true,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	});

	return Instructor;
};
