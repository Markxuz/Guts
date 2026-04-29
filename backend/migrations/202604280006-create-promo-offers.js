"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("PromoOffers", {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			status: {
				type: Sequelize.ENUM("active", "inactive"),
				allowNull: false,
				defaultValue: "active",
			},
			fixed_price: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: true,
			},
			discounted_price: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: true,
			},
			notes: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("PromoOffers");
	},
};