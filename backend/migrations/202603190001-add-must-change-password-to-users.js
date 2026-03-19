module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Users");

    if (!table.must_change_password) {
      await queryInterface.addColumn("Users", "must_change_password", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("Users");

    if (table.must_change_password) {
      await queryInterface.removeColumn("Users", "must_change_password");
    }
  },
};