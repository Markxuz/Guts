const service = require("./enrollments.service");
const { recordActivity } = require("../activity-logs/activity-logs.service");

async function getAllEnrollments(req, res) {
  try {
    const rows = await service.listEnrollments();
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch Enrollment records", error: error.message });
  }
}

async function getEnrollmentById(req, res) {
  try {
    const row = await service.getEnrollment(req.params.id);
    return res.status(200).json(row);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
}

async function createEnrollment(req, res) {
  try {
    const created = await service.addEnrollment(req.body);
    await recordActivity({
      userId: req.user?.id,
      action: `Created enrollment #${created.id}`,
    });
    return res.status(201).json(created);
  } catch (error) {
    const status = error.status || 400;
    return res.status(status).json({ message: error.message });
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
    const status = error.status || 400;
    return res.status(status).json({ message: error.message });
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
    const status = error.status || 400;
    return res.status(status).json({ message: error.message });
  }
}

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
};
