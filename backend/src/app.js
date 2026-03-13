const express = require("express");
const cors = require("cors");
const { createApiRouter } = require("./routes");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("GUTS Scheduling API Running");
  });

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
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
