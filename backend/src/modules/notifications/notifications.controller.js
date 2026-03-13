const service = require("./notifications.service");

async function list(req, res) {
  try {
    const items = await service.listAll({ limit: 50 });
    const unreadCount = await service.getUnreadCount();
    return res.json({ items, unreadCount });
  } catch {
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
}

async function markRead(req, res) {
  try {
    await service.markRead(req.params.id);
    return res.json({ message: "Marked as read" });
  } catch {
    return res.status(500).json({ message: "Failed to mark notification as read" });
  }
}

async function markAllRead(req, res) {
  try {
    await service.markAllRead();
    return res.json({ message: "All notifications marked as read" });
  } catch {
    return res.status(500).json({ message: "Failed to mark notifications as read" });
  }
}

module.exports = { list, markRead, markAllRead };
