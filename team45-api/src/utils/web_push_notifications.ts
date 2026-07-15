import webpush from "web-push";
import { PushSubscription as PushSubscriptionModel } from "../models/push_notifications";
import { User } from "../models/user";
import * as crypto from "crypto";
import { Op } from "sequelize";

export interface PushSubscription {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
}

export interface NotificationPayload {
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	image?: string;
	data?: any;
	actions?: Array<{
		action: string;
		title: string;
		icon?: string;
	}>;
	tag?: string;
	requireInteraction?: boolean;
	url?: string;
}

export interface SendResult {
	subscription: PushSubscription;
	result?: webpush.SendResult;
	error?: any;
	success: boolean;
}

export class WebPushNotifications {
	private static instance: WebPushNotifications;
	private isConfigured = false;

	private constructor() {}

	public static getInstance(): WebPushNotifications {
		if (!WebPushNotifications.instance) {
			WebPushNotifications.instance = new WebPushNotifications();
		}
		return WebPushNotifications.instance;
	}

	public configure(
		vapidPublicKey: string,
		vapidPrivateKey: string,
		subject: string
	) {
		try {
			webpush.setVapidDetails(subject, vapidPublicKey, vapidPrivateKey);
			this.isConfigured = true;
			console.log("WebPush configured successfully");
		} catch (error) {
			console.error("Failed to configure WebPush:", error);
			throw error;
		}
	}

	public validateSubscription(
		subscription: any
	): subscription is PushSubscription {
		return (
			subscription &&
			typeof subscription.endpoint === "string" &&
			subscription.keys &&
			typeof subscription.keys.p256dh === "string" &&
			typeof subscription.keys.auth === "string"
		);
	}

	public async saveSubscription(
		userId: string,
		subscription: PushSubscription,
		userAgent?: string,
		deviceType?: string
	) {
		try {
			if (!this.validateSubscription(subscription)) {
				throw new Error("Invalid push subscription format");
			}

			const existingSubscription =
				await PushSubscriptionModel.findByEndpoint(
					subscription.endpoint
				);

			if (existingSubscription) {
				await existingSubscription.update({
					user_id: userId,
					p256dhKey: subscription.keys.p256dh,
					authKey: subscription.keys.auth,
					user_agent: userAgent,
					device_type: deviceType,
					isActive: true,
					last_used: new Date(),
				});
				console.log(
					`Updated existing push subscription for user: ${userId}`
				);
				return existingSubscription;
			}

			const newSubscription = await PushSubscriptionModel.create({
				user_id: userId,
				endpoint: subscription.endpoint,
				endpoint_hash: crypto
					.createHash("sha256")
					.update(subscription.endpoint)
					.digest("hex"),
				p256dhKey: subscription.keys.p256dh,
				authKey: subscription.keys.auth,
				user_agent: userAgent,
				device_type: deviceType,
				isActive: true,
				last_used: new Date(),
			});

			console.log(`Created new push subscription for user: ${userId}`);
			return newSubscription;
		} catch (error) {
			console.error("Error saving push subscription:", error);
			throw error;
		}
	}

	public async getUserSubscriptions(
		userId: string
	): Promise<PushSubscription[]> {
		try {
			const subscriptions = await PushSubscriptionModel.findAll({
				where: {
					user_id: userId,
					isActive: true,
				},
				order: [["last_used", "DESC"]],
			});

			return subscriptions.map((sub) => ({
				endpoint: sub.endpoint,
				keys: {
					p256dh: sub.p256dhKey,
					auth: sub.authKey,
				},
			}));
		} catch (error) {
			console.error("Error getting user subscriptions:", error);
			throw error;
		}
	}

	public async sendNotification(
		subscription: PushSubscription,
		payload: NotificationPayload,
		options?: webpush.RequestOptions
	) {
		if (!this.isConfigured) {
			throw new Error("WebPush not configured. Call configure() first.");
		}

		if (!this.validateSubscription(subscription)) {
			throw new Error("Invalid push subscription format");
		}

		try {
			const result = await webpush.sendNotification(
				subscription,
				JSON.stringify(payload),
				{
					TTL: 24 * 60 * 60, // 24 hours default
					...options,
				}
			);
			return result;
		} catch (error) {
			console.error("Error sending push notification:", error);
			throw error;
		}
	}

	public async sendNotificationToMultiple(
		subscriptions: PushSubscription[],
		payload: NotificationPayload,
		options?: webpush.RequestOptions
	): Promise<SendResult[]> {
		if (!this.isConfigured) {
			throw new Error("WebPush not configured. Call configure() first.");
		}

		const results = await Promise.allSettled(
			subscriptions.map((subscription) =>
				this.sendNotification(subscription, payload, options)
			)
		);

		return results.map((result, index) => {
			const subscription = subscriptions[index];

			if (result.status === "fulfilled") {
				return {
					subscription,
					result: result.value,
					success: true,
				};
			} else {
				const error = result.reason;

				if (error.statusCode === 410) {
					this.deactivateSubscriptionByEndpoint(
						subscription.endpoint
					).catch(console.error);
				}

				return {
					subscription,
					error,
					success: false,
				};
			}
		});
	}

	public async sendToUser(
		userId: string,
		payload: NotificationPayload,
		options?: webpush.RequestOptions
	) {
		try {
			const subscriptions = await this.getUserSubscriptions(userId);

			if (subscriptions.length === 0) {
				console.log(
					`No active subscriptions found for user: ${userId}`
				);
				return [];
			}

			const results = await this.sendNotificationToMultiple(
				subscriptions,
				payload,
				options
			);

			// Update last used timestamp for successful sends
			const successfulEndpoints = results
				.filter((r) => r.success)
				.map((r) => r.subscription.endpoint);

			if (successfulEndpoints.length > 0) {
				await this.updateLastUsed(successfulEndpoints);
			}

			console.log(
				`Sent notifications to user ${userId}: ${
					results.filter((r) => r.success).length
				}/${results.length} successful`
			);
			return results;
		} catch (error) {
			console.error("Error sending notification to user:", error);
			throw error;
		}
	}

	public async sendToUsers(
		user_Ids: string[],
		payload: NotificationPayload,
		options?: webpush.RequestOptions
	) {
		const userResults = await Promise.allSettled(
			user_Ids.map((user_id) =>
				this.sendToUser(user_id, payload, options).then((results) => ({
					userId: user_id,
					results,
				}))
			)
		);

		return userResults.map((result, index) => {
			if (result.status === "fulfilled") {
				return result.value;
			} else {
				return {
					userId: user_Ids[index],
					results: [],
					error: result.reason,
				};
			}
		});
	}

	public async sendToAll(
		payload: NotificationPayload,
		options?: webpush.RequestOptions
	) {
		try {
			const allSubscriptions = await PushSubscriptionModel.findAll({
				where: { isActive: true },
				attributes: ["endpoint", "p256dhKey", "authKey"],
			});

			const subscriptions: PushSubscription[] = allSubscriptions.map(
				(sub) => ({
					endpoint: sub.endpoint,
					keys: {
						p256dh: sub.p256dhKey,
						auth: sub.authKey,
					},
				})
			);

			console.log(
				`Sending notification to ${subscriptions.length} active subscriptions`
			);
			return await this.sendNotificationToMultiple(
				subscriptions,
				payload,
				options
			);
		} catch (error) {
			console.error("Error sending notification to all users:", error);
			throw error;
		}
	}

	public async deactivateSubscriptionByEndpoint(
		endpoint: string
	): Promise<void> {
		try {
			const subscription = await PushSubscriptionModel.findByEndpoint(
				endpoint
			);
			if (subscription) {
				await subscription.update({ isActive: false });
				console.log(
					`Deactivated subscription: ${endpoint.substring(0, 50)}...`
				);
			}
		} catch (error) {
			console.error("Error deactivating subscription:", error);
		}
	}

	public async removeSubscription(endpoint: string): Promise<boolean> {
		try {
			const subscription = await PushSubscriptionModel.findByEndpoint(
				endpoint
			);
			if (subscription) {
				await subscription.destroy();
				console.log(
					`Removed subscription: ${endpoint.substring(0, 50)}...`
				);
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error removing subscription:", error);
			return false;
		}
	}

	private async updateLastUsed(endpoints: string[]): Promise<void> {
		try {
			const endpointHashes = endpoints.map((endpoint) =>
				crypto.createHash("sha256").update(endpoint).digest("hex")
			);

			await PushSubscriptionModel.update(
				{ last_used: new Date() },
				{
					where: {
						endpoint_hash: endpointHashes,
					},
				}
			);
		} catch (error) {
			console.error("Error updating last used timestamps:", error);
		}
	}

	public async cleanupOldSubscriptions(
		daysOld: number = 30
	): Promise<number> {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - daysOld);

			const result = await PushSubscriptionModel.destroy({
				where: {
					isActive: false,
					updated_at: {
						[Op.lt]: cutoffDate,
					},
				},
			});

			console.log(`Cleaned up ${result} old push subscriptions`);
			return result;
		} catch (error) {
			console.error("Error cleaning up subscriptions:", error);
			return 0;
		}
	}

	public createNotificationPayload(
		title: string,
		body: string,
		options?: Partial<NotificationPayload>
	): NotificationPayload {
		return {
			title,
			body,
			icon: "https://imageplaceholder.net/192x192/eeeeee/131313?text=app",
			badge: "https://imageplaceholder.net/72x72/eeeeee/131313?text=app",
			tag: options?.tag || "default",
			requireInteraction: options?.requireInteraction || false,
			...options,
		};
	}

	public async testNotification(userId: string): Promise<SendResult[]> {
		const testPayload = this.createNotificationPayload(
			"Test Notification",
			"This is a test push notification from your app!",
			{
				tag: "test",
				data: { timestamp: new Date().toISOString() },
			}
		);

		return await this.sendToUser(userId, testPayload);
	}

	public isReady(): boolean {
		return this.isConfigured;
	}
}

export const webPushNotifications = WebPushNotifications.getInstance();
