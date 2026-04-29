"use strict";

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
	const table = await queryInterface.describeTable(tableName);
	if (!table[columnName]) {
		await queryInterface.addColumn(tableName, columnName, definition);
	}
}

module.exports = {
	async up(queryInterface, Sequelize) {
		await addColumnIfMissing(queryInterface, "PromoOffers", "fixed_price", {
			type: Sequelize.DECIMAL(10, 2),
			allowNull: true,
		});

		await addColumnIfMissing(queryInterface, "PromoOffers", "discounted_price", {
			type: Sequelize.DECIMAL(10, 2),
			allowNull: true,
		});
	},

	async down(queryInterface) {
		const table = await queryInterface.describeTable("PromoOffers");
		if (table.discounted_price) {
			await queryInterface.removeColumn("PromoOffers", "discounted_price");
		}
		if (table.fixed_price) {
			await queryInterface.removeColumn("PromoOffers", "fixed_price");
		}
	},
};