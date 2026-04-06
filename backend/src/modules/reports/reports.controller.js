const service = require("./reports.service");
const { sendHttpError } = require("../../shared/http/response");

async function getDailyReports(req, res) {
  try {
    const payload = await service.getDailyReports({
      date: req.query.date,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      courseFilter: req.query.course,
      courseType: req.query.courseType,
      instructorId: req.query.instructorId,
      vehicleId: req.query.vehicleId,
    });
    return res.status(200).json(payload);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch daily reports");
  }
}

async function getOverviewReports(req, res) {
  try {
    const payload = await service.getOverviewReports({
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      courseFilter: req.query.course,
    });
    return res.status(200).json(payload);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch reports overview");
  }
}

module.exports = {
  getDailyReports,
  getOverviewReports,
};
