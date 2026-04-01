// Shared date/test utilities for backend tests
function uniqueLabel(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDaysIso(dateIso, daysToAdd) {
  const date = new Date(`${dateIso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return toIsoDate(date);
}

function nextWeekdayIso(weekday, weeksAhead = 3) {
  const base = new Date();
  base.setDate(base.getDate() + weeksAhead * 7);
  const diff = (weekday - base.getDay() + 7) % 7;
  base.setDate(base.getDate() + diff);
  return toIsoDate(base);
}

module.exports = {
  uniqueLabel,
  toIsoDate,
  addDaysIso,
  nextWeekdayIso,
};
