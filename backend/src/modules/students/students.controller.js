const service = require("./students.service");
const { recordActivity } = require("../activity-logs/activity-logs.service");
const { create: createNotification } = require("../notifications/notifications.service");
const { sendHttpError } = require("../../shared/http/response");

function enrollmentStatusLabel(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "pending") return "Pending";
  if (normalized === "confirmed") return "Active";
  if (normalized === "completed") return "Complete";
  return value || "Unknown";
}

async function getAllStudents(req, res) {
  try {
    const rows = await service.listStudents(req.query || {});
    return res.status(200).json(rows);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch students");
  }
}

async function importOnlineTdcStudents(req, res) {
  try {
    if (!req.file) {
      return sendHttpError(res, new Error("An Excel or CSV file is required"), 400, "Failed to import online TDC file");
    }

    const result = await service.importOnlineTdcStudents(req.file, req.body || {}, req.user);
    return res.status(201).json({
      message: "Online TDC file imported successfully",
      result,
    });
  } catch (error) {
    return sendHttpError(res, error, error.status || 400, "Failed to import online TDC file");
  }
}

async function exportStudents(req, res) {
  try {
    const format = String(req.query?.format || "csv").toLowerCase();
    const datePart = new Date().toISOString().slice(0, 10);

    // Parse optional range or explicit startDate/endDate
    const range = String(req.query?.range || "").toLowerCase();
    let { startDate, endDate } = req.query || {};

    if (!startDate && !endDate && range) {
      const now = new Date();
      let days = 0;
      if (range === "daily") days = 1;
      else if (range === "weekly") days = 7;
      else if (range === "monthly") days = 30;

      if (days > 0) {
        const start = new Date(now);
        start.setUTCDate(start.getUTCDate() - days);
        startDate = start.toISOString();
        endDate = now.toISOString();
      }
    }

    const options = {};
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;

    if (format === "xlsx" || format === "xls" || format === "excel") {
      const content = await service.exportStudentsExcel(options);
      res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="students-${datePart}.xls"`);
      return res.status(200).send(content);
    }

    const csv = await service.exportStudentsCsv(options);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="students-${datePart}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to export students");
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

    if (req.user?.role === "admin" || req.user?.role === "sub_admin" || req.user?.role === "staff") {
      createNotification({
        message: `${req.user.name || req.user.email} updated student #${updated.id} enrollment progress to ${enrollmentStatusLabel(req.body?.enrollmentStatus)}.`,
        actorId: req.user.id,
      }).catch((err) => {
        // Keep status update successful even if notification insert fails.
        console.error("Error creating status update notification:", err.message);
      });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to update enrollment status");
  }
}

module.exports = {
  getAllStudents,
  importOnlineTdcStudents,
  exportStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  updateEnrollmentStatus,
};
