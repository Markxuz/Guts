const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Payment = sequelize.define("Payment", {
		enrollment_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		amount: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		payment_method: {
			type: DataTypes.ENUM("cash", "card", "bank_transfer", "ewallet"),
			allowNull: false,
			defaultValue: "cash",
		},
		payment_status: {
			type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
			allowNull: false,
			defaultValue: "pending",
		},
		status: {
			type: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
			allowNull: true,
			defaultValue: "pending",
		},
		payment_date: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		payment_terms: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		payment_notes: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		reference_number: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		account_number: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	});

	return Payment;
};
