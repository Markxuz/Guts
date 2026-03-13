const service = require("./activity-logs.service");
const { sendHttpError } = require("../../shared/http/response");

async function getActivityLogs(req, res) {
  try {
    const rows = await service.listActivityLogs({
      isoDate: req.query.date,
      limit: req.query.limit,
    });
    return res.status(200).json({ date: req.query.date || null, items: rows });
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch activity logs");
  }
}

module.exports = {
  getActivityLogs,
};
