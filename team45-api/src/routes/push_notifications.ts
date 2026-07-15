import { Router } from "express";
import { NotificationHandler } from "../handlers/push_notifications";

const router = Router();

router.post("/subscribe", NotificationHandler.subscribe);
router.get("/unread-count", NotificationHandler.getUnreadCount.bind(NotificationHandler));
router.get("/", NotificationHandler.getNotifications.bind(NotificationHandler));
router.get("/user/:userId", NotificationHandler.getUserNotifications.bind(NotificationHandler));
router.patch("/:id/read", NotificationHandler.markAsRead.bind(NotificationHandler));
router.patch("/mark-all-read", NotificationHandler.markAllAsRead.bind(NotificationHandler));
router.delete("/:id", NotificationHandler.deleteNotification.bind(NotificationHandler));


export default router;
