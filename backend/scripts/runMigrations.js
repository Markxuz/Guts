require("dotenv").config();

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const { sequelize } = require("../models");

const MIGRATION_TABLE = "_migrations";
const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

async function ensureMigrationTable() {
  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (name VARCHAR(255) PRIMARY KEY, run_at DATETIME NOT NULL)`
  );
}

async function getExecutedMigrationNames() {
  const [rows] = await sequelize.query(`SELECT name FROM ${MIGRATION_TABLE}`);
  return new Set(rows.map((row) => row.name));
}

async function markMigrationApplied(name) {
  await sequelize.query(`INSERT INTO ${MIGRATION_TABLE} (name, run_at) VALUES (?, NOW())`, {
    replacements: [name],
  });
}

function parseMissingTableFromError(error) {
  const message = error?.message || "";
  const describeMatch = message.match(/No description found for "(.+?)" table/i);
  if (describeMatch) {
    return describeMatch[1];
  }

  const tableNotFoundMatch = message.match(/Table '.*?\.(.+?)' doesn't exist/i);
  if (tableNotFoundMatch) {
    return tableNotFoundMatch[1].replace(/[`"']/g, "");
  }

  return null;
}

function normalizeTableName(table) {
  if (typeof table === "string") {
    return table.toLowerCase();
  }

  if (table && typeof table === "object") {
    if (typeof table.tableName === "string") {
      return table.tableName.toLowerCase();
    }
    if (typeof table.name === "string") {
      return table.name.toLowerCase();
    }
  }

  return "";
}

async function shouldSkipMissingTableMigration(error) {
  const missingTable = parseMissingTableFromError(error);
  if (!missingTable) {
    return false;
  }

  const existingTables = await sequelize.getQueryInterface().showAllTables();
  const normalizedExisting = new Set(existingTables.map(normalizeTableName).filter(Boolean));
  return normalizedExisting.has(String(missingTable).toLowerCase());
}

async function main() {
  await ensureMigrationTable();

  const executedMigrations = await getExecutedMigrationNames();
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".js"))
    .sort();

  for (const file of files) {
    if (executedMigrations.has(file)) {
      continue;
    }

    const migrationPath = path.join(MIGRATIONS_DIR, file);
    const migration = require(migrationPath);
    if (typeof migration.up !== "function") {
      throw new Error(`Migration ${file} is missing an up() function`);
    }

    try {
      await migration.up(sequelize.getQueryInterface(), Sequelize);
      await markMigrationApplied(file);
      console.log(`Applied migration: ${file}`);
    } catch (error) {
      if (await shouldSkipMissingTableMigration(error)) {
        await markMigrationApplied(file);
        console.warn(`Skipped migration due to table-case mismatch: ${file}`);
        continue;
      }

      throw error;
    }
  }

  console.log("Migrations complete");
  await sequelize.close();
}

main().catch(async (error) => {
  console.error("Migration failed:", error.message);
  await sequelize.close();
  process.exit(1);
});
