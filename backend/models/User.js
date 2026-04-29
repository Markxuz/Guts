const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const User = sequelize.define("User", {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		password_hash: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		role: {
			type: DataTypes.ENUM("admin", "sub_admin", "staff", "instructor"),
			allowNull: false,
			defaultValue: "staff",
		},
		must_change_password: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		session_version: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
	});

	return User;
};
