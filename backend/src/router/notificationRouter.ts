import express from 'express';
import { auth } from '../middleware/auth';
import { newNotification, notifications, allNotificationsCount } from '../controller/notificationController';

const router = express.Router();

router.get('/new-notifications', auth, newNotification);
router.get('/get-notifications', auth, notifications);
router.get('/count-all-notifications', auth, allNotificationsCount);

export default router;