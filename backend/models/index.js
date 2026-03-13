const sequelize = require("../config/db");

const User = require("./User")(sequelize);
const Notification = require("./Notification")(sequelize);
const Student = require("./Student")(sequelize);
const StudentProfile = require("./StudentProfile")(sequelize);
const Course = require("./Course")(sequelize);
const Package = require("./Package")(sequelize);
const DLCode = require("./DLCode")(sequelize);
const Instructor = require("./Instructor")(sequelize);
const Vehicle = require("./Vehicle")(sequelize);
const Schedule = require("./Schedule")(sequelize);
const Enrollment = require("./Enrollment")(sequelize);
const Payment = require("./Payment")(sequelize);
const Certificate = require("./Certificate")(sequelize);
const ActivityLog = require("./ActivityLog")(sequelize);

// Associations

Student.hasMany(Enrollment, { foreignKey: "student_id" });
Enrollment.belongsTo(Student, { foreignKey: "student_id" });

Student.hasOne(StudentProfile, { foreignKey: "student_id" });
StudentProfile.belongsTo(Student, { foreignKey: "student_id" });

Course.hasMany(Schedule, { foreignKey: "course_id" });
Schedule.belongsTo(Course, { foreignKey: "course_id" });

Instructor.hasMany(Schedule, { foreignKey: "instructor_id" });
Schedule.belongsTo(Instructor, { foreignKey: "instructor_id" });

Vehicle.hasMany(Schedule, { foreignKey: "vehicle_id" });
Schedule.belongsTo(Vehicle, { foreignKey: "vehicle_id" });

Schedule.hasMany(Enrollment, { foreignKey: "schedule_id" });
Enrollment.belongsTo(Schedule, { foreignKey: "schedule_id" });

Package.hasMany(Enrollment, { foreignKey: "package_id" });
Enrollment.belongsTo(Package, { foreignKey: "package_id" });

DLCode.hasMany(Enrollment, { foreignKey: "dl_code_id" });
Enrollment.belongsTo(DLCode, { foreignKey: "dl_code_id" });

Enrollment.hasOne(Payment, { foreignKey: "enrollment_id" });
Payment.belongsTo(Enrollment, { foreignKey: "enrollment_id" });

Enrollment.hasOne(Certificate);
Certificate.belongsTo(Enrollment);

User.hasMany(ActivityLog, { foreignKey: "userId" });
ActivityLog.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Notification, { foreignKey: "actor_id" });
Notification.belongsTo(User, { foreignKey: "actor_id", as: "actor" });

module.exports = {
  sequelize,
  User,
  Student,
  StudentProfile,
  Course,
  Package,
  DLCode,
  Instructor,
  Vehicle,
  Schedule,
  Enrollment,
  Payment,
  Certificate,
  ActivityLog,
  Notification,
};