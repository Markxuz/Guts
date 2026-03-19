require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function assertRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for restore test`);
  }
  return value;
}

function listBackupFiles(backupDir) {
  return fs
    .readdirSync(backupDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => ({
      name: entry.name,
      filePath: path.join(backupDir, entry.name),
      modifiedAtMs: fs.statSync(path.join(backupDir, entry.name)).mtimeMs,
    }))
    .sort((a, b) => b.modifiedAtMs - a.modifiedAtMs);
}

async function runCommand(command, args, env, stdinFilePath = null) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: [stdinFilePath ? "pipe" : "ignore", "pipe", "pipe"],
    });

    let stderr = "";

    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk.toString());
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    if (stdinFilePath) {
      const readStream = fs.createReadStream(stdinFilePath);
      readStream.pipe(child.stdin);
    }

    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}. ${stderr}`));
    });
  });
}

async function main() {
  const dbUser = assertRequiredEnv("DB_USER");
  const dbPassword = assertRequiredEnv("DB_PASSWORD");
  const dbHost = process.env.DB_HOST || "localhost";
  const backupDir = path.resolve(process.env.BACKUP_DIR || "./backups");
  const restoreDbPrefix = process.env.BACKUP_RESTORE_TEST_DB_PREFIX || "guts_restore_test";
  const shouldCleanup = (process.env.BACKUP_RESTORE_TEST_CLEANUP || "true") === "true";

  if (!fs.existsSync(backupDir)) {
    throw new Error(`Backup directory not found: ${backupDir}`);
  }

  const backups = listBackupFiles(backupDir);
  if (backups.length === 0) {
    throw new Error("No backup files found to test restore");
  }

  const latestBackup = backups[0];
  const restoreDbName = `${restoreDbPrefix}_${Date.now()}`;
  const mysqlEnv = {
    ...process.env,
    MYSQL_PWD: dbPassword,
  };

  console.log(`Using backup: ${latestBackup.name}`);
  console.log(`Restore test database: ${restoreDbName}`);

  await runCommand("mysql", [`--host=${dbHost}`, `--user=${dbUser}`, "-e", `CREATE DATABASE ${restoreDbName};`], mysqlEnv);

  try {
    await runCommand("mysql", [`--host=${dbHost}`, `--user=${dbUser}`, restoreDbName], mysqlEnv, latestBackup.filePath);

    await runCommand(
      "mysql",
      [
        `--host=${dbHost}`,
        `--user=${dbUser}`,
        "-N",
        "-B",
        "-e",
        `SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = '${restoreDbName}';`,
      ],
      mysqlEnv
    );

    console.log("Restore test passed");
  } finally {
    if (shouldCleanup) {
      await runCommand("mysql", [`--host=${dbHost}`, `--user=${dbUser}`, "-e", `DROP DATABASE IF EXISTS ${restoreDbName};`], mysqlEnv);
      console.log(`Cleanup complete: dropped ${restoreDbName}`);
    }
  }
}

main().catch((error) => {
  console.error("Restore test failed:", error.message);
  process.exit(1);
});