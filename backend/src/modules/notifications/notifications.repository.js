const { Op } = require("sequelize");
const { Notification } = require("../../../models");

async function create({ message, actorId }) {
  return Notification.create({ message, actor_id: actorId, is_read: false });
}

async function findAll({ limit = 50 } = {}) {
  return Notification.findAll({
    order: [["created_at", "DESC"]],
    limit,
  });
}

async function countUnread() {
  return Notification.count({ where: { is_read: false } });
}

async function markAsRead(id) {
  const n = await Notification.findByPk(id);
  if (!n) return null;
  n.is_read = true;
  return n.save();
}

async function markAllAsRead() {
  return Notification.update({ is_read: true }, { where: { is_read: false } });
}

module.exports = {
  create,
  findAll,
  countUnread,
  markAsRead,
  markAllAsRead,
};
