const service = require("./schedules.service");
const { recordActivity } = require("../activity-logs/activity-logs.service");

async function getSchedulesByDate(req, res) {
  try {
    const payload = await service.listSchedulesByDate(req.query.date);
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch schedules", error: error.message });
  }
}

async function getMonthStatus(req, res) {
  try {
    const rows = await service.listMonthStatus(req.query.year, req.query.month);
    return res.status(200).json({ items: rows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch schedule month status", error: error.message });
  }
}

async function createSchedule(req, res) {
  try {
    const created = await service.addSchedule(req.body);
    await recordActivity({
      userId: req.user?.id,
      action: `Created schedule for ${req.body.schedule_date} (${req.body.slot})`,
    });
    return res.status(201).json(created);
  } catch (error) {
    const status = error.status || 400;
    return res.status(status).json({ message: error.message });
  }
}

module.exports = {
  getSchedulesByDate,
  getMonthStatus,
  createSchedule,
};
