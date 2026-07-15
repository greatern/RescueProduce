// handlers/notificationHandler.ts
import { Request, Response } from "express";
import { Notification } from "../models/notification";
import { responseUtils } from "../utils/response";
import { Op } from "sequelize";
import { User } from "../models/user";

export class notifications{
  
  // Helper method to get userId from request
  private getUserId(req: Request): string | null {
    // Check multiple sources for userId
    return req.body.userId || 
           req.query.userId as string || 
           req.params.userId ||
           req.body.user_id ||
           req.query.user_id as string ||
           null;
  }

  // Validate if user exists
  private async validateUser(userId: string): Promise<boolean> {
    const user = await User.findByPk(userId, { attributes: ['id'] });
    return !!user;
  }

  // Get notifications for user
  public async getNotifications(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const { limit = 50, unreadOnly = 'false' } = req.query;

      if (!userId) {
        return responseUtils.sendErrorResponse(res, 400, "User ID is required");
      }

      // Validate user exists
      const userExists = await this.validateUser(userId);
      if (!userExists) {
        return responseUtils.sendErrorResponse(res, 404, "User not found");
      }

      const whereClause: any = { user_id: userId };
      
      if (unreadOnly === 'true') {
        whereClause.is_read = false;
      }

      const notifications = await Notification.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit as string)
      });

      const unreadCount = await Notification.count({
        where: { user_id: userId, is_read: false }
      });

      return responseUtils.sendSuccessResponse(res, 200, {
        notifications,
        unreadCount
      }, "Notifications fetched successfully");

    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      return responseUtils.sendErrorResponse(res, 500, "Failed to fetch notifications", error);
    }
  }

  // Get notifications for specific user (admin or user themselves)
  public async getUserNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { unreadOnly = 'false', limit = 50 } = req.query;

      if (!userId) {
        return responseUtils.sendErrorResponse(res, 400, "User ID is required");
      }

      // Validate user exists
      const userExists = await this.validateUser(userId);
      if (!userExists) {
        return responseUtils.sendErrorResponse(res, 404, "User not found");
      }

      const whereClause: any = { user_id: userId };
      
      if (unreadOnly === 'true') {
        whereClause.is_read = false;
      }

      const notifications = await Notification.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit as string)
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

  // Mark single notification as read
  public async markAsRead(req: Request, res: Response) {
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
  public async markAllAsRead(req: Request, res: Response) {
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
  public async deleteNotification(req: Request, res: Response) {
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
  public async getUnreadCount(req: Request, res: Response) {
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

  // Batch delete old read notifications (cleanup)
  public async deleteOldReadNotifications(req: Request, res: Response) {
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

  // Get notification by ID (with user validation)
  public async getNotificationById(req: Request, res: Response) {
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


