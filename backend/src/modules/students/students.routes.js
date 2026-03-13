const express = require("express");
const controller = require("./students.controller");
const { authenticateToken, authorizeRoles } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const { studentCreateSchema, studentUpdateSchema } = require("./students.schema");

const router = express.Router();

router.use(authenticateToken);

router.get("/", controller.getAllStudents);
router.get("/:id", controller.getStudentById);
router.post("/", validateRequest(studentCreateSchema), controller.createStudent);
router.put("/:id", validateRequest(studentUpdateSchema), controller.updateStudent);
router.put("/:id/enrollment-status", controller.updateEnrollmentStatus);
router.delete("/:id", authorizeRoles("admin"), controller.deleteStudent);

module.exports = router;
