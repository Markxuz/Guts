const service = require("./dashboard.service");

async function getDashboardSummary(req, res) {
  try {
    const payload = await service.getSummary(req.query.course || "overall");
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard summary", error: error.message });
  }
}

async function getDashboardLogs(req, res) {
  try {
    const payload = await service.getLogsByDate(req.query.date);
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard logs", error: error.message });
  }
}

module.exports = {
  getDashboardSummary,
  getDashboardLogs,
};
