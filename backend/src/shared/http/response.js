const logger = require("../logging/logger");

function sendHttpError(res, error, fallbackStatus = 500, fallbackMessage = "Request failed") {
  const status = Number(error?.status) || fallbackStatus;
  const message = error?.message || fallbackMessage;

  const payload = { message };

  if (Array.isArray(error?.details) && error.details.length > 0) {
    payload.details = error.details;
  }

  const req = res.req || {};
  const logMeta = {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl || req.url,
    statusCode: status,
    userId: req.user?.id || null,
    role: req.user?.role || null,
    error,
  };

  if (status >= 500) {
    logger.error("http_error", logMeta);
  } else {
    logger.warn("http_error", logMeta);
  }

  return res.status(status).json(payload);
}

module.exports = {
  sendHttpError,
};
