const express = require("express");
const controller = require("./schedules.controller");
const { authenticateToken } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const {
	scheduleCreateSchema,
	scheduleDayQuerySchema,
	scheduleMonthStatusQuerySchema,
	scheduleCancelParamsSchema,
	scheduleCancelQuerySchema,
	scheduleUpdateSchema,
	scheduleRemarksUpdateSchema,
} = require("./schedules.schema");

const router = express.Router();

router.use(authenticateToken);
router.get("/day", validateRequest(scheduleDayQuerySchema, "query"), controller.getSchedulesByDate);
router.get("/month-status", validateRequest(scheduleMonthStatusQuerySchema, "query"), controller.getMonthStatus);
router.post("/", validateRequest(scheduleCreateSchema), controller.createSchedule);
router.put("/:id", validateRequest(scheduleCancelParamsSchema, "params"), validateRequest(scheduleUpdateSchema), controller.updateSchedule);
router.patch("/:id/remarks", validateRequest(scheduleCancelParamsSchema, "params"), validateRequest(scheduleRemarksUpdateSchema), controller.updateScheduleRemarks);
router.delete("/:id", validateRequest(scheduleCancelParamsSchema, "params"), validateRequest(scheduleCancelQuerySchema, "query"), controller.cancelSchedule);

module.exports = router;
