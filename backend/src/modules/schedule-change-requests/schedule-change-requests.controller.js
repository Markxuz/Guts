const service = require("./schedule-change-requests.service");
const { sendHttpError } = require("../../shared/http/response");
const { sendSuccess } = require("../../shared/http/success");

async function createRequest(req, res) {
  try {
    const item = await service.createRequest({
      scheduleId: Number(req.body.schedule_id),
      requestedScheduleDate: req.body.requested_schedule_date,
      requestedSlot: req.body.requested_slot,
      reason: req.body.reason,
    }, req.user);

    return sendSuccess(res, { item }, {
      status: 201,
      meta: { type: "schedule-change-request-create" },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to create schedule change request");
  }
}

async function getPendingRequests(req, res) {
  try {
    const items = await service.listPendingRequests();
    return sendSuccess(res, { items }, {
      meta: { type: "schedule-change-request-list" },
    });
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch schedule change requests");
  }
}

async function approveRequest(req, res) {
  try {
    const item = await service.approveRequest(Number(req.params.id), req.user);
    return sendSuccess(res, { item }, {
      meta: { type: "schedule-change-request-approve" },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to approve schedule change request");
  }
}

async function rejectRequest(req, res) {
  try {
    const item = await service.rejectRequest(Number(req.params.id), req.user, req.body.reviewer_note || null);
    return sendSuccess(res, { item }, {
      meta: { type: "schedule-change-request-reject" },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to reject schedule change request");
  }
}

module.exports = {
  createRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest,
};