const { sequelize } = require("../../../models");
const repository = require("./schedule-change-requests.repository");
const schedulesService = require("../schedules/schedules.service");
const { create: createNotification } = require("../notifications/notifications.service");

function studentName(student) {
  if (!student) return "Open Slot";
  return [student.first_name, student.last_name].filter(Boolean).join(" ") || `Student #${student.id}`;
}

function scheduleSlotFromRow(schedule) {
  return schedule?.start_time === schedulesService.SLOT_MAP.morning.startTime ? "morning" : "afternoon";
}

function mapRequest(row) {
  const schedule = row?.schedule || null;
  const enrollment = row?.enrollment || schedule?.selectedEnrollment || null;
  const linkedStudent = schedule?.scheduledStudent || enrollment?.Student || null;

  return {
    id: row.id,
    scheduleId: row.schedule_id,
    enrollmentId: row.enrollment_id || enrollment?.id || null,
    status: row.status,
    reason: row.reason,
    reviewerNote: row.reviewer_note || null,
    requestScope: row.request_scope,
    requestedScheduleDate: row.requested_schedule_date,
    requestedSlot: row.requested_slot,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at || null,
    requester: row?.requester ? {
      id: row.requester.id,
      name: row.requester.name,
      role: row.requester.role,
    } : null,
    reviewer: row?.reviewer ? {
      id: row.reviewer.id,
      name: row.reviewer.name,
      role: row.reviewer.role,
    } : null,
    currentSchedule: schedule ? {
      id: schedule.id,
      scheduleDate: schedule.schedule_date,
      slot: scheduleSlotFromRow(schedule),
      course: schedule?.Course?.course_name || enrollment?.DLCode?.code || "Course",
      studentName: studentName(linkedStudent),
    } : null,
  };
}

async function createRequest({ scheduleId, requestedScheduleDate, requestedSlot, reason }, user) {
  const schedule = await schedulesService.getScheduleById(scheduleId);
  if (!schedule) {
    const error = new Error("Schedule not found");
    error.status = 404;
    throw error;
  }

  const existingPending = await repository.findPendingByScheduleId(scheduleId);
  if (existingPending) {
    const error = new Error("A pending approval request already exists for this schedule.");
    error.status = 409;
    throw error;
  }

  const request = await repository.createRequest({
    schedule_id: schedule.id,
    enrollment_id: schedule.enrollment_id || schedule.selectedEnrollment?.id || null,
    requested_by_user_id: user.id,
    requested_schedule_date: requestedScheduleDate,
    requested_slot: requestedSlot,
    request_scope: schedulesService.isBeginnerSchedule(schedule) ? "both" : "single",
    reason,
    status: "pending",
  });

  await createNotification({
    actorId: user.id,
    message: `Pending schedule approval requested for schedule #${schedule.id} on ${requestedScheduleDate} (${requestedSlot}).`,
  });

  return mapRequest(await repository.findById(request.id));
}

async function listPendingRequests() {
  const rows = await repository.findAllPending();
  return rows.map(mapRequest);
}

async function approveRequest(id, user) {
  const transaction = await sequelize.transaction();
  let committed = false;

  try {
    const request = await repository.findById(id, transaction);
    if (!request) {
      const error = new Error("Schedule change request not found");
      error.status = 404;
      throw error;
    }

    if (request.status !== "pending") {
      const error = new Error("This schedule change request has already been reviewed.");
      error.status = 409;
      throw error;
    }

    await schedulesService.rescheduleSchedule(request.schedule_id, {
      schedule_date: request.requested_schedule_date,
      slot: request.requested_slot,
    }, {
      transaction,
      allowPendingEnrollment: true,
    });

    await repository.updateRequest(request, {
      status: "approved",
      reviewed_by_user_id: user.id,
      reviewed_at: new Date(),
    }, transaction);

    await transaction.commit();
    committed = true;

    await createNotification({
      actorId: user.id,
      message: `Approved schedule change request #${request.id}.`,
    });

    return mapRequest(await repository.findById(id));
  } catch (error) {
    if (!committed) {
      await transaction.rollback();
    }
    throw error;
  }
}

async function rejectRequest(id, user, reviewerNote = null) {
  const request = await repository.findById(id);
  if (!request) {
    const error = new Error("Schedule change request not found");
    error.status = 404;
    throw error;
  }

  if (request.status !== "pending") {
    const error = new Error("This schedule change request has already been reviewed.");
    error.status = 409;
    throw error;
  }

  await repository.updateRequest(request, {
    status: "rejected",
    reviewer_note: reviewerNote,
    reviewed_by_user_id: user.id,
    reviewed_at: new Date(),
  });

  await createNotification({
    actorId: user.id,
    message: `Rejected schedule change request #${request.id}.`,
  });

  return mapRequest(await repository.findById(id));
}

module.exports = {
  createRequest,
  listPendingRequests,
  approveRequest,
  rejectRequest,
};