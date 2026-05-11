const express = require("express");
const { QRCode, PromoOffer } = require("../models");
const rateLimit = require("express-rate-limit");
const enrollmentsService = require("../src/modules/enrollments/enrollments.service");

const router = express.Router();

function createPublicLimiter(maxRequests) {
  return rateLimit({
    windowMs: 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: "Too many requests. Please wait a minute and try again.",
      });
    },
  });
}

// Use a higher read limit because opening a public form can trigger multiple requests in quick succession.
const publicReadLimiter = createPublicLimiter(60);
const publicSubmitLimiter = createPublicLimiter(20);
router.use(["/enroll", "/enroll/promo-offers"], publicReadLimiter);
router.use("/enroll/submit", publicSubmitLimiter);

function resolveEnrollmentType(template) {
  const explicitType = String(template?.enrollment_type || "").trim().toUpperCase();
  if (explicitType === "TDC" || explicitType === "PDC" || explicitType === "PROMO") {
    return explicitType;
  }

  const normalizedName = String(template?.name || "").toLowerCase();
  if (normalizedName.includes("promo")) {
    return "PROMO";
  }
  if (normalizedName.includes("pdc")) {
    return "PDC";
  }
  if (normalizedName.includes("tdc")) {
    return "TDC";
  }

  return null;
}

// GET /enroll?token=... - fetch QR template (public)
router.get("/enroll", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: "Missing token" });
  const qr = await QRCode.findOne({ where: { token, revoked: false } });
  if (!qr) return res.status(404).json({ error: "QR code not found or revoked" });
  res.json({ name: qr.name, template: qr.template });
});

// GET /enroll/promo-offers?token=... - list active promo offers scoped to this QR form type
router.get("/enroll/promo-offers", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Missing token" });

    const qr = await QRCode.findOne({ where: { token, revoked: false } });
    if (!qr) return res.status(404).json({ error: "QR code not found or revoked" });

    const offers = await PromoOffer.findAll({
      where: {
        status: "active",
      },
      attributes: ["id", "name", "description", "fixed_price", "discounted_price", "applies_to"],
      order: [["id", "DESC"]],
    });

    const enrollmentType = resolveEnrollmentType(qr.template);
    const normalizedEnrollmentType = String(enrollmentType || "").toUpperCase();

    res.json(
      offers.map((offer) => ({
        ...offer.toJSON(),
        is_applicable: !offer.applies_to || offer.applies_to === "ALL" || offer.applies_to === normalizedEnrollmentType,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to load promo offers" });
  }
});

// POST /enroll/submit - submit enrollment (public)
router.post("/enroll/submit", async (req, res) => {
  const { token, data } = req.body;
  if (!token || !data) return res.status(400).json({ error: "Missing token or data" });
  const qr = await QRCode.findOne({ where: { token, revoked: false } });
  if (!qr) return res.status(404).json({ error: "QR code not found or revoked" });

  const enrollment = await enrollmentsService.addEnrollment({
    ...data,
    qrCodeId: qr.id,
    enrollment: {
      ...(data.enrollment || {}),
      status: "pending",
    },
  });

  res.status(201).json({
    success: true,
    enrollmentId: enrollment.id,
    status: enrollment.status,
  });
});

module.exports = router;
