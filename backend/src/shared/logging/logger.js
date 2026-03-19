const LEVEL_PRIORITY = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const configuredLevel = String(process.env.LOG_LEVEL || "info").toLowerCase();
const minPriority = LEVEL_PRIORITY[configuredLevel] || LEVEL_PRIORITY.info;

function shouldLog(level) {
  const priority = LEVEL_PRIORITY[level] || LEVEL_PRIORITY.info;
  return priority >= minPriority;
}

function serializeError(error) {
  if (!error) {
    return null;
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

function emit(level, message, meta = {}) {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: "guts-backend",
    environment: process.env.NODE_ENV || "development",
    ...meta,
  };

  if (meta.error instanceof Error) {
    payload.error = serializeError(meta.error);
  }

  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function logWithLevel(level) {
  return (message, meta = {}) => emit(level, message, meta);
}

module.exports = {
  debug: logWithLevel("debug"),
  info: logWithLevel("info"),
  warn: logWithLevel("warn"),
  error: logWithLevel("error"),
};