const express = require("express");
const controller = require("./online-intake.controller");
const { authenticateToken, authorizeRoles } = require("../../shared/middleware/auth");
const { validateRequest } = require("../../shared/middleware/validateRequest");
const {
  manualIngestSchema,
  idParamSchema,
  approveMatchSchema,
  approveCreateSchema,
} = require("./online-intake.schema");

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles("admin", "sub_admin", "staff"));

router.get("/", controller.list);
router.post("/manual-ingest", validateRequest(manualIngestSchema), controller.manualIngest);
router.post("/:id/approve-match", validateRequest(idParamSchema, "params"), validateRequest(approveMatchSchema), controller.approveMatch);
router.post("/:id/approve-create", validateRequest(idParamSchema, "params"), validateRequest(approveCreateSchema), controller.approveCreate);

module.exports = router;
