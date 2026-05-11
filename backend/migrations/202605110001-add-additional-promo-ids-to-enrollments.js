"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Enrollments", "additional_promo_offer_ids", {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface/*, Sequelize*/) => {
    await queryInterface.removeColumn("Enrollments", "additional_promo_offer_ids");
  },
};
