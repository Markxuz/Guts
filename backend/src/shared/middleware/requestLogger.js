const logger = require("../logging/logger");

function requestLogger(req, res, next) {
  res.on("finish", () => {
    const includeHealthLogs = (process.env.REQUEST_LOG_INCLUDE_HEALTH || "false") === "true";
    if (!includeHealthLogs && req.path.startsWith("/api/health")) {
      return;
    }

    const startedAt = req.requestStartAt || process.hrtime.bigint();
    const durationNs = process.hrtime.bigint() - startedAt;
    const durationMs = Number(durationNs) / 1_000_000;

    const logMeta = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip || req.socket?.remoteAddress || "unknown",
      userId: req.user?.id || null,
      role: req.user?.role || null,
    };

    if (res.statusCode >= 500) {
      logger.error("request_completed", logMeta);
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn("request_completed", logMeta);
      return;
    }

    logger.info("request_completed", logMeta);
  });

  return next();
}

module.exports = {
  requestLogger,
};