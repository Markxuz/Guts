const service = require("./schedules.service");
const { recordActivity } = require("../activity-logs/activity-logs.service");
const { sendHttpError } = require("../../shared/http/response");
const { sendSuccess } = require("../../shared/http/success");

function ensureAdminScheduleModification(user) {
  if (user?.role === "admin") {
    return;
  }

  const error = new Error("Unauthorized: Admin approval required for schedule modifications.");
  error.status = 403;
  throw error;
}

async function getSchedulesByDate(req, res) {
  try {
    const payload = await service.listSchedulesByDate(req.query.date, req.query.course_type, {
      instructorId: req.query.instructor_id,
      vehicleId: req.query.vehicle_id,
    });
    return sendSuccess(res, payload, {
      meta: {
        date: req.query.date,
        courseType: req.query.course_type || "overall",
        type: "schedule-day",
      },
    });
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch schedules");
  }
}

async function getMonthStatus(req, res) {
  try {
    const rows = await service.listMonthStatus(req.query.year, req.query.month);
    return sendSuccess(res, {
      year: Number(req.query.year),
      month: Number(req.query.month),
      items: rows,
    }, {
      meta: {
        type: "schedule-month-status",
      },
    });
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch schedule month status");
  }
}

async function createSchedule(req, res) {
  try {
    const created = await service.addSchedule(req.body);
    await recordActivity({
      userId: req.user?.id,
      action: `Created schedule for ${req.body.schedule_date} (${req.body.slot})`,
    });
    return sendSuccess(res, {
      item: created.item,
      createdItems: created.createdItems,
      reservedDates: created.reservedDates,
      slot: created.slot,
      courseType: created.courseType,
    }, {
      status: 201,
      meta: {
        type: "schedule-create",
        date: req.body.schedule_date,
        slot: req.body.slot,
      },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to create schedule");
  }
}

async function cancelSchedule(req, res) {
  try {
    ensureAdminScheduleModification(req.user);
    const payload = await service.cancelSchedule(Number(req.params.id), req.query.scope || "single");
    await recordActivity({
      userId: req.user?.id,
      action: `Cancelled schedule #${req.params.id} (${payload.scopeApplied})`,
    });

    return sendSuccess(res, payload, {
      meta: {
        type: "schedule-cancel",
      },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to cancel schedule");
  }
}

async function updateSchedule(req, res) {
  try {
    ensureAdminScheduleModification(req.user);
    const payload = await service.rescheduleSchedule(Number(req.params.id), {
      schedule_date: req.body.schedule_date,
      slot: req.body.slot,
    });

    await recordActivity({
      userId: req.user?.id,
      action: `Rescheduled schedule #${req.params.id} to ${req.body.schedule_date} (${req.body.slot})`,
    });

    return sendSuccess(res, payload, {
      meta: {
        type: "schedule-update",
      },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to update schedule");
  }
}

module.exports = {
  getSchedulesByDate,
  getMonthStatus,
  createSchedule,
  updateSchedule,
  cancelSchedule,
};
