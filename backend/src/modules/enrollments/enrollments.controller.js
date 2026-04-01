const service = require("./enrollments.service");
const { recordActivity } = require("../activity-logs/activity-logs.service");
const { create: createNotification } = require("../notifications/notifications.service");
const { sendHttpError } = require("../../shared/http/response");

async function getAllEnrollments(req, res) {
  try {
    const rows = await service.listEnrollments();
    return res.status(200).json(rows);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch Enrollment records");
  }
}

async function getEnrollmentById(req, res) {
  try {
    const row = await service.getEnrollment(req.params.id);
    return res.status(200).json(row);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch enrollment");
  }
}

async function createEnrollment(req, res) {
  try {
    const created = await service.addEnrollment(req.body);
    await recordActivity({
      userId: req.user?.id,
      action: `Created enrollment #${created.id}`,
    });

    if (req.user?.role === "admin" || req.user?.role === "sub_admin" || req.user?.role === "staff") {
      createNotification({
        message: `${req.user.name || req.user.email} created enrollment #${created.id}.`,
        actorId: req.user.id,
      }).catch(() => {});
    }

    return res.status(201).json(created);
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to create enrollment");
  }
}

async function updateEnrollment(req, res) {
  try {
    const updated = await service.editEnrollment(req.params.id, req.body);
    await recordActivity({
      userId: req.user?.id,
      action: `Updated enrollment #${updated.id}`,
    });
    return res.status(200).json(updated);
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to update enrollment");
  }
}

async function deleteEnrollment(req, res) {
  try {
    await service.removeEnrollment(req.params.id);
    await recordActivity({
      userId: req.user?.id,
      action: `Deleted enrollment #${req.params.id}`,
    });
    return res.status(200).json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to delete enrollment");
  }
}

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
};
