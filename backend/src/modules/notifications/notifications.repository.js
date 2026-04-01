const { Op } = require("sequelize");
const { Notification, NotificationRead } = require("../../../models");

function buildVisibleNotificationsWhere(userId) {
  return {
    [Op.or]: [
      { actor_id: { [Op.ne]: userId } },
      { actor_id: { [Op.is]: null } },
    ],
  };
}

async function create({ message, actorId }) {
  return Notification.create({ message, actor_id: actorId, is_read: false });
}

async function findAll({ limit = 50, userId } = {}) {
  return Notification.findAll({
    where: buildVisibleNotificationsWhere(userId),
    order: [["created_at", "DESC"]],
    limit,
    include: [
      {
        model: NotificationRead,
        as: "reads",
        required: false,
        where: { user_id: userId },
        attributes: ["id", "user_id", "read_at"],
      },
    ],
  });
}

async function countUnread({ userId } = {}) {
  const rows = await Notification.findAll({
    attributes: ["id"],
    include: [
      {
        model: NotificationRead,
        as: "reads",
        required: false,
        where: { user_id: userId },
        attributes: ["id"],
      },
    ],
    where: {
      ...buildVisibleNotificationsWhere(userId),
      "$reads.id$": null,
    },
  });

  return rows.length;
}

async function markAsRead(id, userId) {
  const n = await Notification.findByPk(id);
  if (!n) return null;

  const [read] = await NotificationRead.findOrCreate({
    where: {
      notification_id: n.id,
      user_id: userId,
    },
    defaults: {
      read_at: new Date(),
    },
  });

  return read;
}

async function markAllAsRead(userId) {
  const unreadRows = await Notification.findAll({
    attributes: ["id"],
    include: [
      {
        model: NotificationRead,
        as: "reads",
        required: false,
        where: { user_id: userId },
        attributes: ["id"],
      },
    ],
    where: {
      ...buildVisibleNotificationsWhere(userId),
      "$reads.id$": null,
    },
  });

  if (!unreadRows.length) {
    return [0];
  }

  const payload = unreadRows.map((row) => ({
    notification_id: row.id,
    user_id: userId,
    read_at: new Date(),
  }));

  await NotificationRead.bulkCreate(payload, { ignoreDuplicates: true });
  return [payload.length];
}

module.exports = {
  create,
  findAll,
  countUnread,
  markAsRead,
  markAllAsRead,
};
