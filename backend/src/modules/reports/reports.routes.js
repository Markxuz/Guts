const express = require("express");
const controller = require("./reports.controller");
const { authenticateToken } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const { dailyReportsQuerySchema, overviewReportsQuerySchema, scheduleEmailReportBodySchema } = require("./reports.schema");

const router = express.Router();

router.get("/daily", authenticateToken, validateRequest(dailyReportsQuerySchema, "query"), controller.getDailyReports);
router.get("/overview", authenticateToken, validateRequest(overviewReportsQuerySchema, "query"), controller.getOverviewReports);
router.post("/schedule-email", authenticateToken, validateRequest(scheduleEmailReportBodySchema, "body"), controller.scheduleEmailReports);
router.post("/test-email", authenticateToken, validateRequest(scheduleEmailReportBodySchema, "body"), controller.sendTestEmailReport);
router.post("/send-email", authenticateToken, validateRequest(scheduleEmailReportBodySchema, "body"), controller.sendEmailReport);

module.exports = router;
