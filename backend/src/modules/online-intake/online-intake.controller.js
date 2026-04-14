const service = require("./online-intake.service");
const { sendHttpError } = require("../../shared/http/response");
const { sendSuccess } = require("../../shared/http/success");

async function list(req, res) {
  try {
    const items = await service.listQueue(req.query || {});
    return sendSuccess(res, { items }, {
      meta: { type: "online-intake-list" },
    });
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch online intake queue");
  }
}

async function manualIngest(req, res) {
  try {
    const item = await service.manualIngest(req.body, req.user);
    return sendSuccess(res, { item }, {
      status: 201,
      meta: { type: "online-intake-manual-ingest" },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to ingest manual online applications");
  }
}

async function approveMatch(req, res) {
  try {
    const item = await service.approveMatch(Number(req.params.id), req.body, req.user);
    return sendSuccess(res, { item }, {
      meta: { type: "online-intake-approve-match" },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to approve match for online intake item");
  }
}

async function approveCreate(req, res) {
  try {
    const item = await service.approveCreate(Number(req.params.id), req.body, req.user);
    return sendSuccess(res, { item }, {
      meta: { type: "online-intake-approve-create" },
    });
  } catch (error) {
    return sendHttpError(res, error, 400, "Failed to approve create for online intake item");
  }
}

module.exports = {
  list,
  manualIngest,
  approveMatch,
  approveCreate,
};
