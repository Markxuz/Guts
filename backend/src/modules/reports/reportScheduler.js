const logger = require("../../shared/logging/logger");
const { dispatchDueReportSchedules } = require("./reportEmail.service");

let schedulerHandle = null;

async function runReportSchedulerCycle() {
  try {
    const result = await dispatchDueReportSchedules(new Date());
    if (result.scannedCount > 0) {
      logger.info("report_scheduler_cycle_complete", result);
    }
  } catch (error) {
    logger.error("report_scheduler_cycle_failed", { error });
  }
}

function startReportScheduler() {
  if (String(process.env.REPORT_EMAIL_WORKER_ENABLED || "true").toLowerCase() === "false") {
    logger.info("report_scheduler_disabled");
    return null;
  }

  if (schedulerHandle) {
    return schedulerHandle;
  }

  void runReportSchedulerCycle();

  const intervalMs = Number(process.env.REPORT_EMAIL_POLL_INTERVAL_MS || 60000);
  schedulerHandle = setInterval(() => {
    void runReportSchedulerCycle();
  }, intervalMs);

  if (typeof schedulerHandle.unref === "function") {
    schedulerHandle.unref();
  }

  return schedulerHandle;
}

module.exports = {
  runReportSchedulerCycle,
  startReportScheduler,
};