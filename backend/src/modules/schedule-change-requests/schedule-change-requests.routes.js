const express = require("express");
const controller = require("./schedule-change-requests.controller");
const { authenticateToken, authorizeRoles } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const {
  scheduleChangeRequestCreateSchema,
  scheduleChangeRequestIdParamSchema,
  scheduleChangeRequestRejectSchema,
} = require("./schedule-change-requests.schema");

const router = express.Router();

router.use(authenticateToken);

router.post("/", validateRequest(scheduleChangeRequestCreateSchema), controller.createRequest);
router.get("/pending", authorizeRoles("admin"), controller.getPendingRequests);
router.post("/:id/approve", authorizeRoles("admin"), validateRequest(scheduleChangeRequestIdParamSchema, "params"), controller.approveRequest);
router.post("/:id/reject", authorizeRoles("admin"), validateRequest(scheduleChangeRequestIdParamSchema, "params"), validateRequest(scheduleChangeRequestRejectSchema), controller.rejectRequest);

module.exports = router;