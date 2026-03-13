require("dotenv").config();

const { sequelize } = require("../models");
const { createApp } = require("./app");
const { ensureDefaultUsers } = require("./modules/auth/auth.service");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Create missing tables on first run without dropping existing data.
    await sequelize.sync({ force: false });
    await ensureDefaultUsers();
    console.log("Database synced");

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
