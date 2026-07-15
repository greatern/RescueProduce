import { Request, Response } from "express";
import { webPushNotifications } from "../utils/web_push_notifications";
import { responseUtils } from "../utils/response";
import { NOTIF_TYPE, Notification } from "../models/notification";
import { User } from "../models/user";
import { Op } from "sequelize";


export class NotificationHandler {

static async subscribe(req: Request, res: Response) {
    try {
        const { user_id, subscription, user_agent, device_type } = req.body;

        console.log('📥 Received subscription request:', {
            user_id,
            subscription_keys: subscription ? Object.keys(subscription) : 'MISSING',
            user_agent,
            device_type
        });

        // Validate required fields
        if (!user_id || !subscription) {
            console.error('❌ Missing required fields:', { user_id, subscription });
            return responseUtils.sendErrorResponse(res, 400, "User ID and subscription are required");
        }

        if (!subscription.endpoint || !subscription.keys) {
            console.error('❌ Invalid subscription format:', subscription);
            return responseUtils.sendErrorResponse(res, 400, "Invalid subscription format");
        }

        console.log('🔑 Subscription details:', {
            endpoint: subscription.endpoint.substring(0, 50) + '...',
            hasP256dh: !!subscription.keys.p256dh,
            hasAuth: !!subscription.keys.auth
        });

        const saved = await webPushNotifications.saveSubscription(
            user_id,
            subscription,
            user_agent,
            device_type
        );

        console.log('✅ Subscription saved successfully:', saved.id);

        responseUtils.sendSuccessResponse(
            res,
            201,
            { id: saved.id },
            "Push subscription saved"
        );
    } catch (error) {
        console.error('❌ Error in subscribe handler:', error);
        responseUtils.sendErrorResponse(res, 500, "Failed to save subscription", error);
    }
}
  
  // Helper method to get userId from request
  static getUserId(req: Request): string | null {
    // Check multiple sources for userId
    return req.body.userId || 
           req.query.userId as string || 
           req.params.userId ||
           req.body.user_id ||
           req.query.user_id as string ||
           null;
  }

  static async validateUser(userId: string): Promise<boolean> {
    const user = await User.findByPk(userId, { attributes: ['id'] });
    return !!user;
  }


static async getNotifications(req: Request, res: Response) {
  try {
    const { limit = 50, unreadOnly = 'false' } = req.query;

    const whereClause: any = {};
    if (unreadOnly === 'true') {
      whereClause.is_read = false;
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit as string)
    });

    const unreadCount = await Notification.count({
      where: { is_read: false }
    });

    return responseUtils.sendSuccessResponse(res, 200, {
      notifications,
      unreadCount
    }, "All notifications fetched successfully");

  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return responseUtils.sendErrorResponse(res, 500, "Failed to fetch notifications", error);
  }
}


static async getUserNotifications(req: Request, res: Response) {
  try {
  
    const userId = req.params.userId || req.query.userId || req.body.userId;

    if (!userId) {
      return responseUtils.sendErrorResponse(res, 400, "User ID is required");
    }

    // Validate user exists
    const userExists = await NotificationHandler.validateUser(userId);
    if (!userExists) {
      return responseUtils.sendErrorResponse(res, 404, "User not found");
    }


    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = parseInt(req.query.limit as string) || 50;

    const whereClause: any = { user_id: userId };
    if (unreadOnly) {
      whereClause.is_read = false;
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: limit
    });

    const unreadCount = await Notification.count({
      where: { user_id: userId, is_read: false }
    });

    return responseUtils.sendSuccessResponse(res, 200, {
      notifications,
      unreadCount
    }, "Notifications fetched");

  } catch (error: any) {
    console.error("Error fetching user notifications:", error);
    return responseUtils.sendErrorResponse(res, 500, "Failed to fetch notifications", error);
  }
}

  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = this.getUserId(req);

      if (!userId) {
        return responseUtils.sendErrorResponse(res, 400, "User ID is required");
      }

      const notification = await Notification.findOne({
        where: { id, user_id: userId }
      });

      if (!notification) {
        return responseUtils.sendErrorResponse(res, 404, "Notification not found or doesn't belong to user");
      }

      notification.is_read = true;
      await notification.save();

      return responseUtils.sendSuccessResponse(res, 200, notification, "Notification marked as read");

    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      return responseUtils.sendErrorResponse(res, 500, "Failed to mark as read", error);
    }
  }

  // Mark all notifications as read for user
  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);

      if (!userId) {
        return responseUtils.sendErrorResponse(res, 400, "User ID is required");
      }

   
      const userExists = await this.validateUser(userId);
      if (!userExists) {
        return responseUtils.sendErrorResponse(res, 404, "User not found");
      }

      const [updatedCount] = await Notification.update(
        { is_read: true },
        { where: { user_id: userId, is_read: false } }
      );

      return responseUtils.sendSuccessResponse(res, 200, { 
        updatedCount 
      }, `${updatedCount} notifications marked as read`);

    } catch (error: any) {
      console.error("Error marking all as read:", error);
      return responseUtils.sendErrorResponse(res, 500, "Failed to mark all as read", error);
    }
  }

  // Delete notification
  static async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = this.getUserId(req);

      if (!userId) {
        return responseUtils.sendErrorResponse(res, 400, "User ID is required");
      }

      const notification = await Notification.findOne({
        where: { id, user_id: userId }
      });

      if (!notification) {
        return responseUtils.sendErrorResponse(res, 404, "Notification not found or doesn't belong to user");
      }

      await notification.destroy();

      return responseUtils.sendSuccessResponse(res, 200, null, "Notification deleted");

    } catch (error: any) {
      console.error("Error deleting notification:", error);
      return responseUtils.sendErrorResponse(res, 500, "Failed to delete notification", error);
    }
  }

  // Get unread count
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);

      if (!userId) {
        return responseUtils.sendErrorResponse(res, 400, "User ID is required");
      }

      // Validate user exists
      const userExists = await this.validateUser(userId);
      if (!userExists) {
        return responseUtils.sendErrorResponse(res, 404, "User not found");
      }

      const unreadCount = await Notification.count({
        where: { user_id: userId, is_read: false }
      });

      return responseUtils.sendSuccessResponse(res, 200, { 
        unreadCount,
        userId 
      }, "Unread count fetched");

    } catch (error: any) {
      console.error("Error getting unread count:", error);
      return responseUtils.sendErrorResponse(res, 500, "Failed to get unread count", error);
    }
  }

  static async deleteOldReadNotifications(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const { daysOld = 30 } = req.query;

      if (!userId) {
        return responseUtils.sendErrorResponse(res, 400, "User ID is required");
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld as string));

      const deletedCount = await Notification.destroy({
        where: {
          user_id: userId,
          is_read: true,
          created_at: {
            [Op.lt]: cutoffDate
          }
        }
      });

      return responseUtils.sendSuccessResponse(res, 200, { 
        deletedCount,
        cutoffDate 
      }, `${deletedCount} old notifications deleted`);

    } catch (error: any) {
      console.error("Error deleting old notifications:", error);
      return responseUtils.sendErrorResponse(res, 500, "Failed to delete old notifications", error);
    }
  }


  static async getNotificationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = this.getUserId(req);

      if (!userId) {
        return responseUtils.sendErrorResponse(res, 400, "User ID is required");
      }

      const notification = await Notification.findOne({
        where: { id, user_id: userId }
      });

      if (!notification) {
        return responseUtils.sendErrorResponse(res, 404, "Notification not found or doesn't belong to user");
      }

      return responseUtils.sendSuccessResponse(res, 200, notification, "Notification fetched");

    } catch (error: any) {
      console.error("Error fetching notification:", error);
      return responseUtils.sendErrorResponse(res, 500, "Failed to fetch notification", error);
    }
  }
}