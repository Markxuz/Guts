const express = require("express");
const multer = require("multer");
const controller = require("./students.controller");
const { authenticateToken, authorizeRoles } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const {
	studentCreateSchema,
	studentUpdateSchema,
	enrollmentStatusUpdateSchema,
} = require("./students.schema");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const router = express.Router();

router.use(authenticateToken);

router.get("/", controller.getAllStudents);
router.get("/export", controller.exportStudents);
router.get("/:id", controller.getStudentById);
router.post("/online-tdc/import", authorizeRoles("admin", "sub_admin", "staff"), upload.single("file"), controller.importOnlineTdcStudents);
router.post("/", validateRequest(studentCreateSchema), controller.createStudent);
router.put("/:id", validateRequest(studentUpdateSchema), controller.updateStudent);
router.put(
	"/:id/enrollment-status",
	authorizeRoles("admin", "sub_admin"),
	validateRequest(enrollmentStatusUpdateSchema),
	controller.updateEnrollmentStatus
);
router.delete("/:id", authorizeRoles("admin"), controller.deleteStudent);

module.exports = router;
