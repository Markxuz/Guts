const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Certificate = sequelize.define("Certificate", {
		certificate_number: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		issue_date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		remarks: {
			type: DataTypes.TEXT,
		},
	});

	return Certificate;
};
