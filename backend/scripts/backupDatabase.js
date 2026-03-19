require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function assertRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for database backups`);
  }
  return value;
}

function getTimestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
}

function cleanupOldBackups(backupDir, retentionDays) {
  const entries = fs.readdirSync(backupDir, { withFileTypes: true });
  const now = Date.now();
  const cutoffMs = retentionDays * 24 * 60 * 60 * 1000;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".sql")) {
      continue;
    }

    const filePath = path.join(backupDir, entry.name);
    const stats = fs.statSync(filePath);
    if (now - stats.mtimeMs > cutoffMs) {
      fs.unlinkSync(filePath);
      console.log(`Removed old backup: ${entry.name}`);
    }
  }
}

function writeBackupStatus(backupDir, statusPayload) {
  const statusPath = path.join(backupDir, "backup-status.json");
  fs.writeFileSync(statusPath, JSON.stringify(statusPayload, null, 2));
}

async function sendBackupAlert(statusPayload) {
  const webhookUrl = process.env.BACKUP_ALERT_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statusPayload),
    });
  } catch (error) {
    console.error("Backup alert webhook failed:", error.message);
  }
}

async function runBackup() {
  const startedAt = new Date();
  const dbName = assertRequiredEnv("DB_NAME");
  const dbUser = assertRequiredEnv("DB_USER");
  const dbPassword = assertRequiredEnv("DB_PASSWORD");
  const dbHost = process.env.DB_HOST || "localhost";
  const backupDir = path.resolve(process.env.BACKUP_DIR || "./backups");
  const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS || 14);

  fs.mkdirSync(backupDir, { recursive: true });

  const backupFile = path.join(backupDir, `${dbName}_${getTimestamp()}.sql`);
  const output = fs.createWriteStream(backupFile);

  console.log(`Starting backup to ${backupFile}`);

  const args = [`--host=${dbHost}`, `--user=${dbUser}`, dbName];
  const dump = spawn("mysqldump", args, {
    env: {
      ...process.env,
      MYSQL_PWD: dbPassword,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  dump.stdout.pipe(output);

  let stderr = "";
  dump.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  await new Promise((resolve, reject) => {
    dump.on("error", (error) => reject(error));
    dump.on("close", (code) => {
      output.close();
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`mysqldump exited with code ${code}. ${stderr}`));
      }
    });
  });

  cleanupOldBackups(backupDir, retentionDays);
  const statusPayload = {
    status: "success",
    timestamp: new Date().toISOString(),
    startedAt: startedAt.toISOString(),
    backupFile,
    database: dbName,
    host: dbHost,
  };
  writeBackupStatus(backupDir, statusPayload);
  await sendBackupAlert(statusPayload);
  console.log("Backup complete");
}

runBackup().catch((error) => {
  const backupDir = path.resolve(process.env.BACKUP_DIR || "./backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const statusPayload = {
    status: "failed",
    timestamp: new Date().toISOString(),
    database: process.env.DB_NAME || null,
    host: process.env.DB_HOST || "localhost",
    error: error.message,
  };
  writeBackupStatus(backupDir, statusPayload);
  sendBackupAlert(statusPayload).catch(() => {
    // Backup should still fail fast even if alert delivery fails.
  });
  console.error("Backup failed:", error.message);
  process.exit(1);
});