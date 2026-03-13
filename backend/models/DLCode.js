const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const DLCode = sequelize.define("DLCode", {
		code: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		description: {
			type: DataTypes.TEXT,
		},
	}, {
		tableName: "dl_codes",
	});

	return DLCode;
};
