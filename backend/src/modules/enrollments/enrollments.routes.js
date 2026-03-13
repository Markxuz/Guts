const express = require("express");
const controller = require("./enrollments.controller");
const { authenticateToken } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const { enrollmentCreateSchema, enrollmentUpdateSchema } = require("./enrollments.schema");

const router = express.Router();

router.use(authenticateToken);

router.get("/", controller.getAllEnrollments);
router.get("/:id", controller.getEnrollmentById);
router.post("/", validateRequest(enrollmentCreateSchema), controller.createEnrollment);
router.put("/:id", validateRequest(enrollmentUpdateSchema), controller.updateEnrollment);
router.delete("/:id", controller.deleteEnrollment);

module.exports = router;
