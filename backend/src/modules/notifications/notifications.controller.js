const service = require("./notifications.service");
const { sendHttpError } = require("../../shared/http/response");

async function list(req, res) {
  try {
    const items = await service.listAll({ limit: 50, userId: req.user.id });
    const unreadCount = await service.getUnreadCount({ userId: req.user.id });
    return res.json({ items, unreadCount });
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to fetch notifications");
  }
}

async function markRead(req, res) {
  try {
    const updated = await service.markRead(req.params.id, req.user.id);
    if (!updated) {
      const err = new Error("Notification not found");
      err.status = 404;
      throw err;
    }
    return res.json({ message: "Marked as read" });
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to mark notification as read");
  }
}

async function markAllRead(req, res) {
  try {
    await service.markAllRead(req.user.id);
    return res.json({ message: "All notifications marked as read" });
  } catch (error) {
    return sendHttpError(res, error, 500, "Failed to mark notifications as read");
  }
}

module.exports = { list, markRead, markAllRead };
