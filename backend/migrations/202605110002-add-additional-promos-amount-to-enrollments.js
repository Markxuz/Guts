"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Enrollments", "additional_promos_amount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });
  },

  down: async (queryInterface/*, Sequelize*/) => {
    await queryInterface.removeColumn("Enrollments", "additional_promos_amount");
  },
};
