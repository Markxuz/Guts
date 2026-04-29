const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const StudentProfile = sequelize.define(
    "StudentProfile",
    {
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      birthdate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      birthplace: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      civil_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nationality: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fb_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gmail_account: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      house_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      street: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      barangay: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      province: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      zip_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      region: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      educational_attainment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emergency_contact_person: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emergency_contact_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lto_portal_account: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      driving_school_tdc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      year_completed_tdc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      student_permit_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      student_permit_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      student_permit_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      medical_certificate_provider: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      medical_certificate_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      tableName: "student_profiles",
      timestamps: false,
    }
  );

  return StudentProfile;
};
