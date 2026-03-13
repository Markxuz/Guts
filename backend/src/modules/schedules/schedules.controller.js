const service = require("./schedules.service");
const { recordActivity } = require("../activity-logs/activity-logs.service");
const { sendHttpError } = require("../../shared/http/response");
const { sendSuccess } = require("../../shared/http/success");

async function getSchedulesByDate(req, res) {
  try {
    const payload = await service.listSchedulesByDate(req.query.date);
    return sendSuccess(res, payload, {
      meta: {
        date: req.query.date,
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
      item: created,
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

module.exports = {
  getSchedulesByDate,
  getMonthStatus,
  createSchedule,
};
