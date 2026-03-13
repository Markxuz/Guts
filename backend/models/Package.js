const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Package = sequelize.define("Package", {
		package_name: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true,
		},
	});

	return Package;
};
