require("dotenv").config();

const { sequelize } = require("../models");
const { createApp } = require("./app");
const { ensureDefaultUsers } = require("./modules/auth/auth.service");
const logger = require("./shared/logging/logger");

const PORT = process.env.PORT || 5000;
const SHOULD_SYNC_SCHEMA = process.env.DB_SYNC === "true";

async function startServer() {
  try {
    await sequelize.authenticate();

    // Schema sync is opt-in only to avoid repeated ALTER/UNIQUE operations in MySQL.
    if (SHOULD_SYNC_SCHEMA) {
      await sequelize.sync({ force: false });
      logger.info("database_synced", { syncMode: "safe", force: false });
    }

    await ensureDefaultUsers();
    logger.info("database_connected", { host: process.env.DB_HOST || "localhost" });

    const app = createApp();
    app.listen(PORT, () => {
      logger.info("server_started", { port: Number(PORT), nodeEnv: process.env.NODE_ENV || "development" });
    });
  } catch (error) {
    logger.error("server_start_failed", { error });
    process.exit(1);
  }
}

startServer();
