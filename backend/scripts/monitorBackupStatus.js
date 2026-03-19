require("dotenv").config();

const fs = require("fs");
const path = require("path");

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

function main() {
  const backupDir = path.resolve(process.env.BACKUP_DIR || "./backups");
  const maxAgeHours = Number(process.env.BACKUP_MAX_AGE_HOURS || 26);

  if (!fs.existsSync(backupDir)) {
    console.error(`Backup monitor failed: directory not found (${backupDir})`);
    process.exit(1);
  }

  const backups = listBackupFiles(backupDir);
  if (backups.length === 0) {
    console.error("Backup monitor failed: no .sql backups found");
    process.exit(1);
  }

  const latest = backups[0];
  const ageMs = Date.now() - latest.modifiedAtMs;
  const ageHours = ageMs / (60 * 60 * 1000);

  if (ageHours > maxAgeHours) {
    console.error(
      `Backup monitor failed: latest backup (${latest.name}) is ${ageHours.toFixed(2)} hours old (max ${maxAgeHours})`
    );
    process.exit(1);
  }

  console.log(
    `Backup monitor OK: latest backup (${latest.name}) is ${ageHours.toFixed(2)} hours old, within threshold (${maxAgeHours}h)`
  );
}

main();