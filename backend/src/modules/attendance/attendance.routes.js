const express = require("express");
const controller = require("./attendance.controller");
const { authenticateToken } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const {
  attendancePayloadSchema,
  attendanceCheckOutSchema,
  attendanceRecomputeParamSchema,
} = require("./attendance.schema");

const router = express.Router();

router.use(authenticateToken);

router.post("/check-in", validateRequest(attendancePayloadSchema), controller.checkIn);
router.post("/check-out", validateRequest(attendanceCheckOutSchema), controller.checkOut);
router.post("/no-show", validateRequest(attendancePayloadSchema), controller.markNoShow);
router.post("/recompute/:enrollmentId", validateRequest(attendanceRecomputeParamSchema, "params"), controller.recompute);

module.exports = router;
