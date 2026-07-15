import Expo, { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { User } from "../models/user";
import { Op } from "sequelize";
import { sequelize } from "../config/sequelize";
import { NOTIF_TYPE, Notification } from "../models/notification";

class PushNotificationUtils {
	private expo: Expo;

	constructor() {
		this.expo = new Expo();
	}

	async sendToUser(user_id: string, title: string, body: string, data?: any) {
		try {
			const user = await User.findByPk(user_id);
			if (!user || !user.expo_push_token) {
				console.log("No push token found");
				return false;
			}
			return await this.sendPushNotification(
				[user.expo_push_token],
				title,
				body,
				data
			);
		} catch (error) {
			console.error("Error sending push notification to user:", error);
			return false;
		}
	}

	async sendToMultipleUsers(
		user_ids: string[],
		title: string,
		body: string,
		data?: any
	) {
		try {
			const users = await User.findAll({
				where: { id: { [Op.in]: user_ids } },
				attributes: ["id", "expo_push_token"],
			});

			const valid_tokens = users
				.filter(
					(u): u is User & { expo_push_token: string } =>
						u.expo_push_token != null && u.expo_push_token !== ""
				)
				.map((u) => u.expo_push_token);
			if (valid_tokens.length === 0) {
				console.log("No valid push tokens found");
				return false;
			}

			return await this.sendPushNotification(
				valid_tokens,
				title,
				body,
				data
			);
		} catch (error) {
			console.error("Error sending push notifications to multiple users");
			return false;
		}
	}

	private async sendPushNotification(
		push_tokens: string[],
		title: string,
		body: string,
		data?: any
	) {
		try {
			const messages: ExpoPushMessage[] = [];
			for (const push_token of push_tokens) {
				if (!Expo.isExpoPushToken(push_token)) {
					console.error(`Push token ${push_token}`);
					continue;
				}
				messages.push({
					to: push_token,
					sound: "default",
					title,
					body,
					data: data || {},
				});
			}
			if (messages.length === 0) {
				console.log("No valid messages to send");
				return false;
			}

			const chunks = this.expo.chunkPushNotifications(messages);
			const tickets: ExpoPushTicket[] = [];

			for (const chunk of chunks) {
				try {
					const ticket_chuck =
						await this.expo.sendPushNotificationsAsync(chunk);
					tickets.push(...ticket_chuck);
				} catch (error) {
					console.error(
						"Error send push notification chunk: ",
						error
					);
				}
			}

			console.log(
				`Successfully sent ${tickets.length} push notifications`
			);
			return true;
		} catch (error) {
			console.error("Error sending push notification:", error);
			return false;
		}
	}

	async sendNotificationWithLogging(
		user_id: string,
		title: string,
		message: string,
		notification_type: NOTIF_TYPE,
		related_entity_id: string,
		related_entity_type: string,
		data?: any
	) {
		const transaction = await sequelize.transaction();

		try {
			await Notification.create(
				{
					user_id,
					title,
					message,
					notification_type,
					related_entity_id,
					related_entity_type,
				},
				{ transaction }
			);
			const push_sent = await this.sendToUser(
				user_id,
				title,
				message,
				data
			);
			await transaction.commit();
			return push_sent;
		} catch (error) {
			await transaction.rollback();
			console.error("Error sending notification with logging:", error);
			return false;
		}
	}
}

export const pushNotificationUtil = new PushNotificationUtils();
