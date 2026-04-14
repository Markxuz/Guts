const express = require("express");
const controller = require("./dashboard.controller");
const { authenticateToken } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const { dashboardLogsQuerySchema, dashboardOperationsQuerySchema } = require("./dashboard.schema");

const router = express.Router();

router.get("/summary", authenticateToken, controller.getDashboardSummary);
router.get("/logs", authenticateToken, validateRequest(dashboardLogsQuerySchema, "query"), controller.getDashboardLogs);
router.get("/operations", authenticateToken, validateRequest(dashboardOperationsQuerySchema, "query"), controller.getDashboardOperations);

module.exports = router;
