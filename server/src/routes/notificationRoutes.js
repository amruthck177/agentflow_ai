const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET /api/notifications - List user notifications
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ owner: req.user._id, isRead: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/mark-all-read - Mark all as read
router.post('/mark-all-read', async (req, res, next) => {
  try {
    await Notification.updateMany({ owner: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
