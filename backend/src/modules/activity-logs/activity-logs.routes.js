const express = require("express");
const controller = require("./activity-logs.controller");
const { authenticateToken } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const { activityLogsQuerySchema } = require("./activity-logs.schema");

const router = express.Router();

router.get("/", authenticateToken, validateRequest(activityLogsQuerySchema, "query"), controller.getActivityLogs);

module.exports = router;
