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

async function scheduleEmailReports(req, res) {
  try {
    const payload = await service.scheduleEmailReports({
      recipients: req.body.recipients,
      frequency: req.body.frequency,
      fileFormat: req.body.fileFormat,
      course: req.body.course,
      requestedByUserId: req.user?.id || null,
    });
    return res.status(201).json(payload);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to schedule email report");
  }
}

async function sendTestEmailReport(req, res) {
  try {
    const payload = await service.sendTestEmailReport({
      recipients: req.body.recipients,
      frequency: req.body.frequency,
      fileFormat: req.body.fileFormat,
      course: req.body.course,
      requestedByUserId: req.user?.id || null,
    });
    return res.status(200).json(payload);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to send test email report");
  }
}

async function sendEmailReport(req, res) {
  try {
    const payload = await service.sendEmailReport({
      recipients: req.body.recipients,
      frequency: req.body.frequency,
      fileFormat: req.body.fileFormat,
      course: req.body.course,
      requestedByUserId: req.user?.id || null,
    });
    return res.status(200).json(payload);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to send report email");
  }
}

module.exports = {
  getDailyReports,
  getOverviewReports,
  scheduleEmailReports,
  sendTestEmailReport,
  sendEmailReport,
};
