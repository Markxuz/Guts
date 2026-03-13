const service = require("./activity-logs.service");

async function getActivityLogs(req, res) {
  try {
    const rows = await service.listActivityLogs({
      isoDate: req.query.date,
      limit: req.query.limit,
    });
    return res.status(200).json({ date: req.query.date || null, items: rows });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch activity logs", error: error.message });
  }
}

module.exports = {
  getActivityLogs,
};
