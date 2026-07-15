import { webPushNotifications } from "../utils/web_push_notifications";
import { Notification as NotificationModel, NOTIF_TYPE } from "../models/notification";
import { pushNotificationUtil } from "../utils/push_notifications";

export class NotificationService {
    static async sendFraudCaseResolution(
        userId: string,
        caseId: string,
        caseNumber: string,
        status: string,
        actionType: string,
        isReporter: boolean = false
    ): Promise<boolean> {
        const title = isReporter ? 'Your Fraud Case Was Resolved' : 'Fraud Case Update';
        const message = isReporter 
            ? `Your fraud case ${caseNumber} has been ${status}. Action taken: ${actionType}`
            : `You were involved in fraud case ${caseNumber} which has been ${status}. Action: ${actionType}`;

        try {
            // ALWAYS create database notification (this is the primary notification method)
            const dbNotification = await NotificationModel.create({
                user_id: userId,
                title,
                message,
                notification_type: NOTIF_TYPE.FRAUD_CASE_UPDATE,
                related_entity_id: caseId,
                related_entity_type: 'fraud_case',
                is_read: false
            });

            console.log(`✅ Database notification created for user ${userId} (ID: ${dbNotification.id})`);

            // Try to send push notification (optional, best-effort)
            let pushSent = false;
            
            try {
                const webPushPayload = webPushNotifications.createNotificationPayload(
                    title,
                    message,
                    {
                        tag: 'fraud_case_resolved',
                        data: {
                            type: 'fraud_case_resolved',
                            caseId,
                            caseNumber,
                            action: actionType,
                            timestamp: new Date().toISOString()
                        }
                    }
                );

                const webPushResults = await webPushNotifications.sendToUser(userId, webPushPayload);
                
                if (webPushResults && webPushResults.length > 0) {
                    const successCount = webPushResults.filter(r => r.success).length;
                    if (successCount > 0) {
                        pushSent = true;
                        console.log(`✅ Web push notification sent to user ${userId} (${successCount}/${webPushResults.length} subscriptions)`);
                    } else {
                        console.log(`⚠️ Failed to send web push to user ${userId} subscriptions`);
                    }
                } else {
                    console.log(`ℹ️ No active web push subscriptions for user ${userId}`);
                }
            } catch (webPushError: unknown) {
                console.log(`ℹ️ Web push failed for user ${userId}, attempting Expo fallback...`);
                
                try {
                    // Fall back to Expo
                    const expoPushResult = await pushNotificationUtil.sendToUser(
                        userId,
                        title,
                        message,
                        {
                            type: 'fraud_case_resolved',
                            caseId,
                            caseNumber,
                            action: actionType
                        }
                    );
                    
                    if (expoPushResult) {
                        pushSent = true;
                        console.log(`✅ Expo push notification sent to user ${userId}`);
                    } else {
                        console.log(`ℹ️ No active Expo push tokens for user ${userId}`);
                    }
                } catch (expoError) {
                    console.log(`ℹ️ Expo push also failed for user ${userId}`);
                }
            }

            if (!pushSent) {
                console.log(`📱 User ${userId} will see notification when they log in (no active push subscriptions)`);
            }

            // Return true because database notification was created successfully
            // Push notifications are optional/best-effort
            console.log(`✅ Notification delivered to user ${userId} (DB: ✓, Push: ${pushSent ? '✓' : '✗'})`);
            return true;

        } catch (error) {
            console.error(`❌ Error sending notification to user ${userId}:`, error);
            return false;
        }
    }

    static async sendWarningNotification(
        userId: string,
        caseId: string,
        caseNumber: string,
        warningMessage: string
    ): Promise<boolean> {
        const title = '⚠️ Warning Issued';
        const message = `Regarding fraud case ${caseNumber}: ${warningMessage}`;

        try {
            // ALWAYS create database notification
            const dbNotification = await NotificationModel.create({
                user_id: userId,
                title,
                message,
                notification_type: NOTIF_TYPE.WARNING,
                related_entity_id: caseId,
                related_entity_type: 'fraud_case',
                is_read: false
            });

            console.log(`✅ Warning notification created in database for user ${userId} (ID: ${dbNotification.id})`);

            // Try to send push notification (optional)
            let pushSent = false;
            
            try {
                const webPushPayload = webPushNotifications.createNotificationPayload(
                    title,
                    message,
                    {
                        tag: 'warning_issued',
                        requireInteraction: true,
                        data: {
                            type: 'warning',
                            caseId,
                            caseNumber,
                            severity: 'warning',
                            timestamp: new Date().toISOString()
                        }
                    }
                );

                const webPushResults = await webPushNotifications.sendToUser(userId, webPushPayload);
                
                if (webPushResults && webPushResults.length > 0) {
                    const successCount = webPushResults.filter(r => r.success).length;
                    if (successCount > 0) {
                        pushSent = true;
                        console.log(`✅ Warning push notification sent to user ${userId} (${successCount}/${webPushResults.length} subscriptions)`);
                    } else {
                        console.log(`⚠️ Failed to send warning push to user ${userId} subscriptions`);
                    }
                } else {
                    console.log(`ℹ️ No active web push subscriptions for user ${userId}`);
                }
            } catch (webPushError: unknown) {
                console.log(`ℹ️ Web push failed for user ${userId}, attempting Expo fallback...`);
                
                try {
                    const expoPushResult = await pushNotificationUtil.sendToUser(
                        userId,
                        title,
                        message,
                        {
                            type: 'warning',
                            caseId,
                            caseNumber,
                            severity: 'warning'
                        }
                    );
                    
                    if (expoPushResult) {
                        pushSent = true;
                        console.log(`✅ Expo warning push sent to user ${userId}`);
                    } else {
                        console.log(`ℹ️ No active Expo push tokens for user ${userId}`);
                    }
                } catch (expoError) {
                    console.log(`ℹ️ Expo push also failed for user ${userId}`);
                }
            }

            if (!pushSent) {
                console.log(`📱 User ${userId} will see warning when they log in`);
            }

            console.log(`✅ Warning delivered to user ${userId} (DB: ✓, Push: ${pushSent ? '✓' : '✗'})`);
            return true;

        } catch (error) {
            console.error(`❌ Error sending warning to user ${userId}:`, error);
            return false;
        }
    }

    static async sendToMultipleUsers(
        userIds: string[],
        title: string,
        message: string,
        data?: any
    ): Promise<{ success: string[]; failed: string[] }> {
        const success: string[] = [];
        const failed: string[] = [];

        console.log(`📤 Sending notifications to ${userIds.length} users...`);

        for (const userId of userIds) {
            try {
                const sent = await this.sendFraudCaseResolution(
                    userId,
                    data?.caseId || '',
                    data?.caseNumber || '',
                    data?.status || 'resolved',
                    data?.actionType || 'resolved',
                    data?.isReporter || false
                );

                if (sent) {
                    success.push(userId);
                } else {
                    failed.push(userId);
                }
            } catch (error) {
                failed.push(userId);
                console.error(`❌ Error sending to user ${userId}:`, error);
            }
        }

        console.log(`✅ Batch notification results: ${success.length} succeeded, ${failed.length} failed`);
        return { success, failed };
    }
}