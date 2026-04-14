const service = require("./dashboard.service");
const { sendHttpError } = require("../../shared/http/response");

async function getDashboardSummary(req, res) {
  try {
    const payload = await service.getSummary(req.query.course || "overall");
    return res.status(200).json(payload);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch dashboard summary");
  }
}

async function getDashboardLogs(req, res) {
  try {
    const payload = await service.getLogsByDate(req.query.date);
    return res.status(200).json(payload);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch dashboard logs");
  }
}

async function getDashboardOperations(req, res) {
  try {
    const payload = await service.getOperationsSnapshot({
      daysAhead: Number(req.query.daysAhead || 7),
      limit: Number(req.query.limit || 50),
    });
    return res.status(200).json(payload);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch dashboard operations snapshot");
  }
}

module.exports = {
  getDashboardSummary,
  getDashboardLogs,
  getDashboardOperations,
};
