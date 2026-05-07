const express = require("express");
const { QRCode } = require("../models");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const { ActivityLog } = require("../models");

const router = express.Router();

// Middleware: Only allow admin
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Allow admin, sub-admin, and staff for QR enrollment review workflows.
function requireEnrollmentReviewAccess(req, res, next) {
  const allowedRoles = ["admin", "sub_admin", "staff"];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: "Enrollment review access required" });
  }
  next();
}

// Add audit logging for QR actions
async function logActivity(userId, action) {
  try {
    await ActivityLog.create({ userId, action });
  } catch (err) {
    // Don't throw - activity log is non-critical
    console.error("Failed to log activity:", err.message);
  }
}

// POST /qrcodes - create a new QR code
router.post("/qrcodes", requireAdmin, async (req, res) => {
  try {
    const { name, template } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "QR code name is required" });
    }

    const token = uuidv4();
    const qrCode = await QRCode.create({
      name: name.trim(),
      template: template || null,
      token,
      createdBy: req.user.id,
      revoked: false,
    });
    
    try {
      await logActivity(req.user.id, "qr_code_created", { qrCodeId: qrCode.id });
    } catch (logError) {
      // Activity log failure should not prevent QR code creation
      console.error("Activity log error:", logError && logError.stack ? logError.stack : logError);
    }
    
    res.status(201).json(qrCode);
  } catch (err) {
    console.error("QR code creation error:", err && err.stack ? err.stack : err);
    res.status(500).json({ error: err.message || "Failed to create QR code" });
  }
});

// GET /qrcodes - list all QR codes
router.get("/qrcodes", requireAdmin, async (req, res) => {
  try {
    const qrcodes = await QRCode.findAll({ order: [["id", "DESC"]] });
    res.json(qrcodes);
  } catch (err) {
    console.error("Failed to list QR codes:", err && err.stack ? err.stack : err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /qrcodes/:id/revoke - revoke a QR code
router.patch("/qrcodes/:id/revoke", requireAdmin, async (req, res) => {
  try {
    const qrCode = await QRCode.findByPk(req.params.id);
    if (!qrCode) return res.status(404).json({ error: "QR code not found" });
    qrCode.revoked = true;
    await qrCode.save();
    await logActivity(req.user.id, "qr_code_revoke", { qrCodeId: qrCode.id });
    res.json(qrCode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /qrcodes/:id - permanently remove a QR code
router.delete("/qrcodes/:id", requireAdmin, async (req, res) => {
  try {
    const qrCode = await QRCode.findByPk(req.params.id);
    if (!qrCode) return res.status(404).json({ error: "QR code not found" });

    await qrCode.destroy();
    await logActivity(req.user.id, "qr_code_deleted", { qrCodeId: qrCode.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /enrollments/pending - list pending enrollments from QR
router.get("/enrollments/pending", requireEnrollmentReviewAccess, async (req, res) => {
  try {
    const { Enrollment, QRCode, Student, StudentProfile, Schedule } = require("../models");
    const enrollments = await Enrollment.findAll({
      where: { status: "pending", qrCodeId: { [Op.ne]: null } },
      include: [
        {
          model: Student,
          required: false,
          attributes: ["id", "first_name", "middle_name", "last_name", "email", "phone"],
          include: [
            {
              model: StudentProfile,
              required: false,
              attributes: ["gmail_account"],
            },
          ],
        },
        {
          model: QRCode,
          as: "qrCode",
          required: false,
          attributes: ["id", "name", "token"],
        },
      ],
      order: [["id", "DESC"]],
      limit: 50,
    });

    const normalized = await Promise.all(enrollments.map(async (entry) => {
      const data = entry.toJSON();
      const studentId = data.student?.id || data.Student?.id || data.student_id || null;

      const fullStudent = studentId
        ? await Student.findByPk(studentId, {
            attributes: ["id", "first_name", "middle_name", "last_name", "email", "phone"],
            include: [
              {
                model: StudentProfile,
                required: false,
                attributes: ["gmail_account"],
              },
            ],
          })
        : null;

      const schedules = await Schedule.findAll({
        where: { enrollment_id: data.id },
        attributes: ["id", "schedule_date", "instructor_id", "care_of_instructor_id"],
        order: [["id", "ASC"]],
      });

      const tdcSchedule = schedules[0] || null;
      const pdcSchedule = schedules[1] || null;

      const studentJson = fullStudent ? fullStudent.toJSON() : (data.student || data.Student || null);
      const profileJson = studentJson?.StudentProfile || data.profile || data.Student?.StudentProfile || null;

      return {
        ...data,
        student: studentJson,
        profile: profileJson,
        promo_schedule_tdc: tdcSchedule ? {
          schedule_date: tdcSchedule.schedule_date,
          instructor_id: tdcSchedule.instructor_id,
          care_of_instructor_id: tdcSchedule.care_of_instructor_id,
        } : null,
        promo_schedule_pdc: pdcSchedule ? {
          schedule_date: pdcSchedule.schedule_date,
          instructor_id: pdcSchedule.instructor_id,
          care_of_instructor_id: pdcSchedule.care_of_instructor_id,
          enabled: true,
        } : null,
      };
    }));

    res.json(normalized);
  } catch (err) {
    try {
      const full = {};
      Object.getOwnPropertyNames(err).forEach(k => {
        try { full[k] = err[k]; } catch (e) { full[k] = String(err[k]); }
      });
      console.error('pending_enrollments_error_full', JSON.stringify(full, null, 2));
    } catch (logErr) {
      console.error('error logging failure', logErr);
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /enrollments/:id/approve - approve enrollment
router.put("/enrollments/:id/approve", requireEnrollmentReviewAccess, async (req, res) => {
  try {
    const { Enrollment } = require("../models");
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });
    if (enrollment.status !== "pending") return res.status(400).json({ error: "Already processed" });
    enrollment.status = "confirmed";
    await enrollment.save();
    await logActivity(req.user.id, "enrollment_approved", { enrollmentId: enrollment.id });
    res.json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /enrollments/:id/mark-paid - mark enrollment as paid
router.put("/enrollments/:id/mark-paid", requireEnrollmentReviewAccess, async (req, res) => {
  try {
    const { Enrollment } = require("../models");
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ error: "Enrollment not found" });
    if (enrollment.status !== "confirmed") return res.status(400).json({ error: "Not ready for payment" });
    enrollment.status = "completed";
    await enrollment.save();
    await logActivity(req.user.id, "enrollment_paid", { enrollmentId: enrollment.id });
    res.json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
