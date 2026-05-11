const request = require("supertest");
const { createApp } = require("../../src/app");
const { ensureDefaultUsers } = require("../../src/modules/auth/auth.service");
const { sequelize } = require("../../models");

let cached;
let initializing;

async function ensureTableColumn(tableName, columnName, columnDefinition) {
  const queryInterface = sequelize.getQueryInterface();
  const columns = await queryInterface.describeTable(tableName);

  if (!Object.prototype.hasOwnProperty.call(columns, columnName)) {
    await queryInterface.addColumn(tableName, columnName, columnDefinition);
  }
}

async function getTestClient() {
  if (cached) {
    return cached;
  }

  if (!initializing) {
    initializing = (async () => {
      const { DataTypes } = require("sequelize");
      await sequelize.authenticate();
      await ensureTableColumn("Enrollments", "promo_offer_id", {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
      await ensureTableColumn("Enrollments", "additional_promo_offer_ids", {
        type: DataTypes.JSON,
        allowNull: true,
      });
      await ensureTableColumn("Enrollments", "additional_promos_amount", {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      });

      // Keep contract tests resilient even if local test DB missed recent migrations.
      await ensureTableColumn("student_profiles", "client_type", {
        type: DataTypes.STRING,
        allowNull: true,
      });
      await ensureTableColumn("student_profiles", "promo_offer_id", {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
      await ensureTableColumn("student_profiles", "enrolling_for", {
        type: DataTypes.STRING,
        allowNull: true,
      });
      await ensureTableColumn("student_profiles", "pdc_category", {
        type: DataTypes.STRING,
        allowNull: true,
      });
      await ensureTableColumn("student_profiles", "tdc_source", {
        type: DataTypes.STRING,
        allowNull: true,
      });
      await ensureTableColumn("student_profiles", "training_method", {
        type: DataTypes.STRING,
        allowNull: true,
      });
      await ensureTableColumn("student_profiles", "is_already_driver", {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      });
      await ensureTableColumn("student_profiles", "target_vehicle", {
        type: DataTypes.STRING,
        allowNull: true,
      });
      await ensureTableColumn("student_profiles", "transmission_type", {
        type: DataTypes.STRING,
        allowNull: true,
      });
      await ensureTableColumn("student_profiles", "motorcycle_type", {
        type: DataTypes.STRING,
        allowNull: true,
      });

      await ensureDefaultUsers();
      cached = request(createApp());
      return cached;
    })().catch((error) => {
      initializing = null;
      throw error;
    });
  }

  return initializing;
}

async function loginAsAdmin(client) {
  const adminPasswords = [
    process.env.SEED_ADMIN_PASSWORD,
    "admin123",
    "ChangeMe!Admin123",
  ].filter(Boolean);

  for (const password of adminPasswords) {
    const response = await client.post("/api/auth/login").send({
      email: process.env.SEED_ADMIN_EMAIL || "admin@guts.local",
      password,
    });

    if (response.status === 200 && response.body?.token) {
      return response.body.token;
    }
  }

  throw new Error("Failed to authenticate test admin");
}

async function loginAsStaff(client) {
  const staffPasswords = [
    process.env.SEED_STAFF_PASSWORD,
    "staff123",
    "ChangeMe!Staff123",
  ].filter(Boolean);

  for (const password of staffPasswords) {
    const response = await client.post("/api/auth/login").send({
      email: process.env.SEED_STAFF_EMAIL || "staff@guts.local",
      password,
    });

    if (response.status === 200 && response.body?.token) {
      return response.body.token;
    }
  }

  throw new Error("Failed to authenticate test staff");
}

module.exports = {
  getTestClient,
  loginAsAdmin,
  loginAsStaff,
};
