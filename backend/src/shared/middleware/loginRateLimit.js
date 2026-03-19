const WINDOW_MINUTES = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MINUTES || 15);
const MAX_ATTEMPTS = Number(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS || 5);
const WINDOW_MS = WINDOW_MINUTES * 60 * 1000;

const attempts = new Map();
let requestCounter = 0;

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "unknown";
}

function cleanupExpiredEntries(now) {
  for (const [key, entry] of attempts.entries()) {
    if (now - entry.firstAttemptAt >= WINDOW_MS) {
      attempts.delete(key);
    }
  }
}

function loginRateLimit(req, res, next) {
  const now = Date.now();
  requestCounter += 1;

  // Periodic cleanup keeps memory bounded without adding background timers.
  if (requestCounter % 100 === 0) {
    cleanupExpiredEntries(now);
  }

  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const email = normalizeEmail(req.body?.email);
  const key = `${ip}:${email}`;
  const current = attempts.get(key);

  if (!current || now - current.firstAttemptAt >= WINDOW_MS) {
    attempts.set(key, { firstAttemptAt: now, count: 1 });
  } else {
    if (current.count >= MAX_ATTEMPTS) {
      return res.status(429).json({
        message: `Too many login attempts. Try again in ${WINDOW_MINUTES} minute(s).`,
      });
    }

    current.count += 1;
    attempts.set(key, current);
  }

  res.on("finish", () => {
    if (res.statusCode < 400) {
      attempts.delete(key);
    }
  });

  return next();
}

module.exports = {
  loginRateLimit,
};