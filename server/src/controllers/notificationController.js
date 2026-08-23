import { getMemoryStore } from '../config/db.js';

const store = getMemoryStore();

export async function listNotifications(req, res) {
  try {
    return res.json(store.notifications.filter((notification) => notification.owner === req.user.id));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
