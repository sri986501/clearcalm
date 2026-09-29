import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';
import { dbStore } from '../services/store';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'demo-user-id-123';
    let notifs: any[] = [];

    try {
      notifs = await Notification.find({ userId }).sort({ createdAt: -1 });
    } catch (e) {
      // Memory fallback
    }

    if (!notifs || notifs.length === 0) {
      notifs = Array.from(dbStore.notifications.values())
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return res.json({ success: true, count: notifs.length, notifications: notifs });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    try {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    } catch (e) {
      // Memory fallback
    }

    const memNotif = dbStore.notifications.get(id);
    if (memNotif) {
      memNotif.isRead = true;
    }

    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update notification status' });
  }
});

export default router;
