const { Op, Sequelize } = require("sequelize");
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
        attributes: ["id", "user_id", "read_at"],
        where: Sequelize.where(
          Sequelize.col("reads.user_id"),
          Op.eq,
          userId
        ),
      },
    ],
    subQuery: false,
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
        attributes: ["id"],
        where: Sequelize.where(
          Sequelize.col("reads.user_id"),
          Op.eq,
          userId
        ),
      },
    ],
    where: buildVisibleNotificationsWhere(userId),
    subQuery: false,
  });

  // Count only notifications that don't have a read entry for this user
  const unreadCount = rows.filter((notification) => !notification.reads || notification.reads.length === 0).length;
  return unreadCount;
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
        attributes: ["id"],
        where: Sequelize.where(
          Sequelize.col("reads.user_id"),
          Op.eq,
          userId
        ),
      },
    ],
    where: buildVisibleNotificationsWhere(userId),
    subQuery: false,
  });

  // Filter to only unread notifications (where reads is empty)
  const unreadNotifications = unreadRows.filter((n) => !n.reads || n.reads.length === 0);

  if (!unreadNotifications.length) {
    return [0];
  }

  const payload = unreadNotifications.map((row) => ({
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
