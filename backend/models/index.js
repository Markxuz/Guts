const sequelize = require("../config/db");

const User = require("./User")(sequelize);
const Notification = require("./Notification")(sequelize);
const NotificationRead = require("./NotificationRead")(sequelize);
const Student = require("./Student")(sequelize);
const StudentProfile = require("./StudentProfile")(sequelize);
const Course = require("./Course")(sequelize);
const Package = require("./Package")(sequelize);
const DLCode = require("./DLCode")(sequelize);
const Instructor = require("./Instructor")(sequelize);
const Vehicle = require("./Vehicle")(sequelize);
const Schedule = require("./Schedule")(sequelize);
const ScheduleChangeRequest = require("./ScheduleChangeRequest")(sequelize);
const Enrollment = require("./Enrollment")(sequelize);
const Payment = require("./Payment")(sequelize);
const Certificate = require("./Certificate")(sequelize);
const ActivityLog = require("./ActivityLog")(sequelize);
const MaintenanceLog = require("./MaintenanceLog")(sequelize);
const FuelLog = require("./FuelLog")(sequelize);
const VehicleUsage = require("./VehicleUsage")(sequelize);
const PromoPackage = require("./PromoPackage")(sequelize);
const PromoEntitlement = require("./PromoEntitlement")(sequelize);
const PromoOffer = require("./PromoOffer")(sequelize);
const SessionAttendance = require("./SessionAttendance")(sequelize);
const OnlineImportQueue = require("./OnlineImportQueue")(sequelize);
const ReportSchedule = require("./ReportSchedule")(sequelize);
const QRCode = require("./QRCode")(sequelize);

// Associations

Student.hasMany(Enrollment, { foreignKey: "student_id" });
Enrollment.belongsTo(Student, { foreignKey: "student_id" });

Student.hasOne(StudentProfile, { foreignKey: "student_id" });
StudentProfile.belongsTo(Student, { foreignKey: "student_id" });

Course.hasMany(Schedule, { foreignKey: "course_id" });
Schedule.belongsTo(Course, { foreignKey: "course_id" });

Instructor.hasMany(Schedule, { foreignKey: "instructor_id" });
Schedule.belongsTo(Instructor, { foreignKey: "instructor_id" });

Instructor.hasMany(Schedule, { foreignKey: "care_of_instructor_id", as: "careOfSchedules" });
Schedule.belongsTo(Instructor, { foreignKey: "care_of_instructor_id", as: "careOfInstructor" });

Vehicle.hasMany(Schedule, { foreignKey: "vehicle_id" });
Schedule.belongsTo(Vehicle, { foreignKey: "vehicle_id" });

Vehicle.hasMany(Instructor, { foreignKey: "assigned_vehicle_id", as: "assignedInstructors" });
Instructor.belongsTo(Vehicle, { foreignKey: "assigned_vehicle_id", as: "assignedVehicle" });

Vehicle.hasMany(MaintenanceLog, { foreignKey: "vehicle_id", as: "maintenanceLogs" });
MaintenanceLog.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

Vehicle.hasMany(FuelLog, { foreignKey: "vehicle_id", as: "fuelLogs" });
FuelLog.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

Vehicle.hasMany(VehicleUsage, { foreignKey: "vehicle_id", as: "usageLogs" });
VehicleUsage.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

Instructor.hasMany(VehicleUsage, { foreignKey: "instructor_id", as: "vehicleUsages" });
VehicleUsage.belongsTo(Instructor, { foreignKey: "instructor_id", as: "instructor" });

Schedule.hasMany(Enrollment, { foreignKey: "schedule_id" });
Enrollment.belongsTo(Schedule, { foreignKey: "schedule_id" });

Enrollment.hasMany(Schedule, { foreignKey: "enrollment_id", as: "scheduledSessions" });
Schedule.belongsTo(Enrollment, { foreignKey: "enrollment_id", as: "selectedEnrollment" });

Student.hasMany(Schedule, { foreignKey: "student_id", as: "scheduledSessions" });
Schedule.belongsTo(Student, { foreignKey: "student_id", as: "scheduledStudent" });

Schedule.hasMany(ScheduleChangeRequest, { foreignKey: "schedule_id", as: "changeRequests", constraints: false });
ScheduleChangeRequest.belongsTo(Schedule, { foreignKey: "schedule_id", as: "schedule", constraints: false });

Enrollment.hasMany(ScheduleChangeRequest, { foreignKey: "enrollment_id", as: "scheduleChangeRequests" });
ScheduleChangeRequest.belongsTo(Enrollment, { foreignKey: "enrollment_id", as: "enrollment" });

Package.hasMany(Enrollment, { foreignKey: "package_id" });
Enrollment.belongsTo(Package, { foreignKey: "package_id" });

DLCode.hasMany(Enrollment, { foreignKey: "dl_code_id" });
Enrollment.belongsTo(DLCode, { foreignKey: "dl_code_id" });

Enrollment.hasMany(Payment, { foreignKey: "enrollment_id", as: "payments" });
Payment.belongsTo(Enrollment, { foreignKey: "enrollment_id" });

Student.hasMany(PromoPackage, { foreignKey: "student_id", as: "promoPackages" });
PromoPackage.belongsTo(Student, { foreignKey: "student_id", as: "student" });

Enrollment.hasMany(PromoPackage, { foreignKey: "enrollment_id", as: "promoPackages" });
PromoPackage.belongsTo(Enrollment, { foreignKey: "enrollment_id", as: "enrollment" });

PromoPackage.hasMany(PromoEntitlement, { foreignKey: "promo_package_id", as: "entitlements" });
PromoEntitlement.belongsTo(PromoPackage, { foreignKey: "promo_package_id", as: "promoPackage" });

PromoPackage.hasMany(Enrollment, { foreignKey: "promo_package_id", as: "enrollments" });
Enrollment.belongsTo(PromoPackage, { foreignKey: "promo_package_id", as: "promoPackage" });

PromoOffer.hasMany(Enrollment, { foreignKey: "promo_offer_id", as: "enrollments" });
Enrollment.belongsTo(PromoOffer, { foreignKey: "promo_offer_id", as: "promoOffer" });

QRCode.hasMany(Enrollment, { foreignKey: "qrCodeId", as: "enrollments" });
Enrollment.belongsTo(QRCode, { foreignKey: "qrCodeId", as: "qrCode" });

Enrollment.hasMany(SessionAttendance, { foreignKey: "enrollment_id", as: "sessionAttendance" });
SessionAttendance.belongsTo(Enrollment, { foreignKey: "enrollment_id", as: "enrollment" });

Schedule.hasMany(SessionAttendance, { foreignKey: "schedule_id", as: "sessionAttendance" });
SessionAttendance.belongsTo(Schedule, { foreignKey: "schedule_id", as: "schedule" });

User.hasMany(OnlineImportQueue, { foreignKey: "reviewed_by_user_id", as: "reviewedOnlineImports" });
OnlineImportQueue.belongsTo(User, { foreignKey: "reviewed_by_user_id", as: "reviewer" });

Enrollment.hasOne(Certificate);
Certificate.belongsTo(Enrollment);

User.hasMany(ActivityLog, { foreignKey: "userId" });
ActivityLog.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Notification, { foreignKey: "actor_id" });
Notification.belongsTo(User, { foreignKey: "actor_id", as: "actor" });

Notification.hasMany(NotificationRead, { foreignKey: "notification_id", as: "reads" });
NotificationRead.belongsTo(Notification, { foreignKey: "notification_id", as: "notification" });

User.hasMany(NotificationRead, { foreignKey: "user_id", as: "notificationReads" });
NotificationRead.belongsTo(User, { foreignKey: "user_id", as: "reader" });

User.hasMany(ScheduleChangeRequest, { foreignKey: "requested_by_user_id", as: "requestedScheduleChanges" });
ScheduleChangeRequest.belongsTo(User, { foreignKey: "requested_by_user_id", as: "requester" });

User.hasMany(ScheduleChangeRequest, { foreignKey: "reviewed_by_user_id", as: "reviewedScheduleChanges" });
ScheduleChangeRequest.belongsTo(User, { foreignKey: "reviewed_by_user_id", as: "reviewer" });

User.hasMany(ReportSchedule, { foreignKey: "created_by_user_id", as: "reportSchedules" });
ReportSchedule.belongsTo(User, { foreignKey: "created_by_user_id", as: "creator" });

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
  ScheduleChangeRequest,
  Enrollment,
  Payment,
  Certificate,
  ActivityLog,
  Notification,
  NotificationRead,
  MaintenanceLog,
  FuelLog,
  VehicleUsage,
  PromoPackage,
  PromoEntitlement,
  PromoOffer,
  SessionAttendance,
  OnlineImportQueue,
  ReportSchedule,
  QRCode,
};