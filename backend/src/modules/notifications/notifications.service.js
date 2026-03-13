const repository = require("./notifications.repository");

async function create({ message, actorId }) {
  return repository.create({ message, actorId });
}

async function listAll({ limit = 50 } = {}) {
  const rows = await repository.findAll({ limit });
  return rows.map((r) => ({
    id: r.id,
    message: r.message,
    is_read: r.is_read,
    actor_id: r.actor_id,
    created_at: r.created_at,
  }));
}

async function getUnreadCount() {
  return repository.countUnread();
}

async function markRead(id) {
  return repository.markAsRead(id);
}

async function markAllRead() {
  return repository.markAllAsRead();
}

module.exports = {
  create,
  listAll,
  getUnreadCount,
  markRead,
  markAllRead,
};
