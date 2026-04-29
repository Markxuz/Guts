"use strict";

async function addColumnIfMissing(queryInterface, tableName, columnName, attributes) {
	const table = await queryInterface.describeTable(tableName);
	if (!table[columnName]) {
		await queryInterface.addColumn(tableName, columnName, attributes);
	}
}

module.exports = {
	async up(queryInterface, Sequelize) {
		await addColumnIfMissing(queryInterface, "Users", "session_version", {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0,
		});
	},

	async down(queryInterface) {
		const table = await queryInterface.describeTable("Users");
		if (table.session_version) {
			await queryInterface.removeColumn("Users", "session_version");
		}
	},
};