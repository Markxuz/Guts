module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE instructors
      SET
        license_number = COALESCE(NULLIF(license_number, ''), CONCAT('LIC-', LPAD(id, 5, '0'))),
        specialization = COALESCE(NULLIF(specialization, ''), 'TDC Certified'),
        status = COALESCE(NULLIF(status, ''), 'Active')
    `);
  },
};
