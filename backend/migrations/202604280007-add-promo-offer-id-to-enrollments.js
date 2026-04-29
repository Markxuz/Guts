"use strict";

async function addColumnIfMissing(queryInterface, tableName, columnName, attributes) {
	const table = await queryInterface.describeTable(tableName);
	if (!table[columnName]) {
		await queryInterface.addColumn(tableName, columnName, attributes);
	}
}

module.exports = {
	async up(queryInterface, Sequelize) {
		await addColumnIfMissing(queryInterface, "Enrollments", "promo_offer_id", {
			type: Sequelize.INTEGER,
			allowNull: true,
		});
	},

	async down(queryInterface) {
		const table = await queryInterface.describeTable("Enrollments");
		if (table.promo_offer_id) {
			await queryInterface.removeColumn("Enrollments", "promo_offer_id");
		}
	},
};