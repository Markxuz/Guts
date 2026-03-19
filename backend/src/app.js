const express = require("express");
const cors = require("cors");
const { createApiRouter } = require("./routes");
const { sequelize } = require("../models");
const { requestContext } = require("./shared/middleware/requestContext");
const { requestLogger } = require("./shared/middleware/requestLogger");

function buildCorsConfig() {
  const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins.length === 0) {
    return process.env.NODE_ENV === "production" ? { origin: false } : { origin: true };
  }

  const allowlist = new Set(configuredOrigins);
  return {
    origin(origin, callback) {
      // Allow non-browser clients (curl, server-to-server).
      if (!origin || allowlist.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin is not allowed"));
    },
  };
}

function createApp() {
  const app = express();

  app.use(requestContext);
  app.use(cors(buildCorsConfig()));
  app.use(express.json());
  app.use(requestLogger);

  app.get("/", (req, res) => {
    res.send("GUTS Scheduling API Running");
  });

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      version: process.env.APP_VERSION || "1.0.0",
      requestId: req.requestId,
    });
  });

  app.get("/api/health/ready", async (req, res) => {
    const startedAt = process.hrtime.bigint();

    try {
      await sequelize.authenticate();
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      return res.status(200).json({
        status: "ready",
        dependencies: {
          database: "up",
        },
        databaseCheckMs: Number(durationMs.toFixed(2)),
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
      });
    } catch (error) {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      return res.status(503).json({
        status: "not_ready",
        dependencies: {
          database: "down",
        },
        databaseCheckMs: Number(durationMs.toFixed(2)),
        message: "Database connection failed",
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
      });
    }
  });

  app.use("/api", createApiRouter());

  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ message: "API route not found" });
    }

    return next();
  });

  return app;
}

module.exports = {
  createApp,
};
