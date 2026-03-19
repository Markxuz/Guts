const crypto = require("crypto");

function requestContext(req, res, next) {
  const incomingRequestId = req.headers["x-request-id"];
  req.requestId = typeof incomingRequestId === "string" && incomingRequestId.trim()
    ? incomingRequestId.trim()
    : crypto.randomUUID();
  req.requestStartAt = process.hrtime.bigint();

  res.setHeader("x-request-id", req.requestId);
  return next();
}

module.exports = {
  requestContext,
};