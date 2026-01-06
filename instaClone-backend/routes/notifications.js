import express from 'express';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET / - Get all notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === 'true';

    const filter = { recipient: req.user._id };
    if (unreadOnly) {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username profilePic')
      .populate('post', 'image');

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.json({
      notifications,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /unread-count - Get count of unread notifications
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /read/:id - Mark single notification as read
router.put('/read/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /read-all - Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /:id - Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE / - Clear all notifications
router.delete('/', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;