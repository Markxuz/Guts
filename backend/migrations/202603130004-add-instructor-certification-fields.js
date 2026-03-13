module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("instructors", "tdc_cert_expiry", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("instructors", "pdc_cert_expiry", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("instructors", "certification_file_name", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
};
