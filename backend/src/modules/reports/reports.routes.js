const express = require("express");
const controller = require("./reports.controller");
const { authenticateToken } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const { dailyReportsQuerySchema, overviewReportsQuerySchema } = require("./reports.schema");

const router = express.Router();

router.get("/daily", authenticateToken, validateRequest(dailyReportsQuerySchema, "query"), controller.getDailyReports);
router.get("/overview", authenticateToken, validateRequest(overviewReportsQuerySchema, "query"), controller.getOverviewReports);

module.exports = router;
