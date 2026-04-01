const repository = require("./notifications.repository");

async function create({ message, actorId }) {
  return repository.create({ message, actorId });
}

async function listAll({ limit = 50, userId } = {}) {
  const rows = await repository.findAll({ limit, userId });
  return rows.map((r) => ({
    id: r.id,
    message: r.message,
    is_read: Array.isArray(r.reads) ? r.reads.length > 0 : false,
    actor_id: r.actor_id,
    created_at: r.created_at,
  }));
}

async function getUnreadCount({ userId } = {}) {
  return repository.countUnread({ userId });
}

async function markRead(id, userId) {
  return repository.markAsRead(id, userId);
}

async function markAllRead(userId) {
  return repository.markAllAsRead(userId);
}

module.exports = {
  create,
  listAll,
  getUnreadCount,
  markRead,
  markAllRead,
};
