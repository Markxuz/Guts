const service = require("./reports.service");

async function getDailyReports(req, res) {
  try {
    const payload = await service.getDailyReports({
      date: req.query.date,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch daily reports", error: error.message });
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
    return res.status(500).json({ message: "Failed to fetch reports overview", error: error.message });
  }
}

module.exports = {
  getDailyReports,
  getOverviewReports,
};
