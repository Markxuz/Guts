const { sequelize } = require("../../../models");
const enrollmentsRepository = require("../enrollments/enrollments.repository");
const enrollmentsService = require("../enrollments/enrollments.service");

async function checkIn(payload) {
  const transaction = await sequelize.transaction();

  try {
    const enrollment = await enrollmentsRepository.findEnrollmentById(payload.enrollment_id);
    if (!enrollment) {
      const error = new Error("Enrollment not found");
      error.status = 404;
      throw error;
    }

    const item = await enrollmentsRepository.createSessionAttendance(
      {
        enrollment_id: payload.enrollment_id,
        schedule_id: payload.schedule_id || null,
        module_type: payload.module_type,
        session_no: payload.session_no || null,
        attendance_status: "present",
        check_in_at: new Date(),
        check_out_at: null,
        remarks: payload.remarks || null,
      },
      transaction
    );

    const updatedEnrollment = await enrollmentsService.recomputeEnrollmentLifecycleState(payload.enrollment_id, { transaction });
    await transaction.commit();

    return { item, enrollment: updatedEnrollment };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function checkOut(payload) {
  const transaction = await sequelize.transaction();

  try {
    const enrollment = await enrollmentsRepository.findEnrollmentById(payload.enrollment_id);
    if (!enrollment) {
      const error = new Error("Enrollment not found");
      error.status = 404;
      throw error;
    }

    const openAttendance = await enrollmentsRepository.findLatestOpenSessionAttendance(
      {
        enrollment_id: payload.enrollment_id,
        schedule_id: payload.schedule_id || undefined,
        module_type: payload.module_type || undefined,
        session_no: payload.session_no || undefined,
      },
      transaction
    );

    if (!openAttendance) {
      const error = new Error("No open attendance session found");
      error.status = 400;
      throw error;
    }

    const item = await enrollmentsRepository.updateSessionAttendance(
      openAttendance,
      {
        check_out_at: new Date(),
      },
      transaction
    );

    const updatedEnrollment = await enrollmentsService.recomputeEnrollmentLifecycleState(payload.enrollment_id, { transaction });
    await transaction.commit();

    return { item, enrollment: updatedEnrollment };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function markNoShow(payload) {
  const transaction = await sequelize.transaction();

  try {
    const enrollment = await enrollmentsRepository.findEnrollmentById(payload.enrollment_id);
    if (!enrollment) {
      const error = new Error("Enrollment not found");
      error.status = 404;
      throw error;
    }

    const existing = await enrollmentsRepository.findSessionAttendanceByUniqueKey(
      {
        enrollment_id: payload.enrollment_id,
        schedule_id: payload.schedule_id || undefined,
        module_type: payload.module_type,
        session_no: payload.session_no || null,
      },
      transaction
    );

    let item;
    if (existing) {
      item = await enrollmentsRepository.updateSessionAttendance(
        existing,
        {
          attendance_status: "no_show",
          check_in_at: null,
          check_out_at: null,
          remarks: payload.remarks || existing.remarks || null,
        },
        transaction
      );
    } else {
      item = await enrollmentsRepository.createSessionAttendance(
        {
          enrollment_id: payload.enrollment_id,
          schedule_id: payload.schedule_id || null,
          module_type: payload.module_type,
          session_no: payload.session_no || null,
          attendance_status: "no_show",
          check_in_at: null,
          check_out_at: null,
          remarks: payload.remarks || null,
        },
        transaction
      );
    }

    const updatedEnrollment = await enrollmentsService.recomputeEnrollmentLifecycleState(payload.enrollment_id, { transaction });
    await transaction.commit();

    return { item, enrollment: updatedEnrollment };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function recompute(enrollmentId) {
  return enrollmentsService.recomputeEnrollmentLifecycleState(enrollmentId);
}

module.exports = {
  checkIn,
  checkOut,
  markNoShow,
  recompute,
};
