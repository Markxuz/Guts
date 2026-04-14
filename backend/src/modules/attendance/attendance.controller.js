const service = require("./attendance.service");
const { sendHttpError } = require("../../shared/http/response");
const { sendSuccess } = require("../../shared/http/success");

async function checkIn(req, res) {
  try {
    const result = await service.checkIn(req.body);
    return sendSuccess(res, result, {
      status: 201,
      meta: { type: "attendance-check-in" },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to check in attendance");
  }
}

async function checkOut(req, res) {
  try {
    const result = await service.checkOut(req.body);
    return sendSuccess(res, result, {
      meta: { type: "attendance-check-out" },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to check out attendance");
  }
}

async function markNoShow(req, res) {
  try {
    const result = await service.markNoShow(req.body);
    return sendSuccess(res, result, {
      meta: { type: "attendance-no-show" },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to mark no-show");
  }
}

async function recompute(req, res) {
  try {
    const item = await service.recompute(Number(req.params.enrollmentId));
    return sendSuccess(res, { item }, {
      meta: { type: "attendance-recompute-enrollment-state" },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to recompute enrollment state");
  }
}

module.exports = {
  checkIn,
  checkOut,
  markNoShow,
  recompute,
};
