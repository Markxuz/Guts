const service = require("./students.service");
const { recordActivity } = require("../activity-logs/activity-logs.service");
const { create: createNotification } = require("../notifications/notifications.service");
const { sendHttpError } = require("../../shared/http/response");

async function getAllStudents(req, res) {
  try {
    const rows = await service.listStudents();
    return res.status(200).json(rows);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch students");
  }
}

async function getStudentById(req, res) {
  try {
    const row = await service.getStudent(req.params.id);
    return res.status(200).json(row);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch student");
  }
}

async function createStudent(req, res) {
  try {
    const created = await service.addStudent(req.body);
    await recordActivity({
      userId: req.user?.id,
      action: `Created student ${created.first_name} ${created.last_name}`,
    });
    if (req.user?.role === "staff") {
      createNotification({
        message: `${req.user.name || req.user.email} added a new student: ${created.first_name} ${created.last_name}`,
        actorId: req.user.id,
      }).catch(() => {});
    }
    return res.status(201).json(created);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to create student");
  }
}

async function updateStudent(req, res) {
  try {
    const updated = await service.editStudent(req.params.id, req.body);
    await recordActivity({
      userId: req.user?.id,
      action: `Updated student #${updated.id}`,
    });
    return res.status(200).json(updated);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to update student");
  }
}

async function deleteStudent(req, res) {
  try {
    await service.removeStudent(req.params.id);
    await recordActivity({
      userId: req.user?.id,
      action: `Deleted student #${req.params.id}`,
    });
    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to delete student");
  }
}

async function updateEnrollmentStatus(req, res) {
  try {
    const updated = await service.updateEnrollmentStatus(req.params.id, req.body);
    await recordActivity({
      userId: req.user?.id,
      action: `Updated enrollment status for student #${updated.id}`,
    });
    if (req.user?.role === "staff") {
      createNotification({
        message: `${req.user.name || req.user.email} updated enrollment status for student #${updated.id}`,
        actorId: req.user.id,
      }).catch(() => {});
    }
    return res.status(200).json(updated);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to update enrollment status");
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  updateEnrollmentStatus,
};
