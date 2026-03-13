const express = require("express");
const controller = require("./dashboard.controller");
const { authenticateToken } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const { dashboardLogsQuerySchema } = require("./dashboard.schema");

const router = express.Router();

router.get("/summary", authenticateToken, controller.getDashboardSummary);
router.get("/logs", authenticateToken, validateRequest(dashboardLogsQuerySchema, "query"), controller.getDashboardLogs);

module.exports = router;
