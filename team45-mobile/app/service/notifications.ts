import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import apiClient from "./api";
import { Platform } from "react-native";
import { ApiResponse } from "./user";
import axios from "axios";

interface PushTokenData {
	token: string;
	user_id?: string;
	platform: string;
	device_id?: string;
}

class NotificationService {
	static async isFCMConfigured(): Promise<boolean> {
		if (Platform.OS !== "android") {
			return true;
		}

		const ownership = (Constants as any).appOwnership;
		if (ownership === "expo") {
			return false;
		}

		try {
			const projectId =
				(Constants as any).expoConfig?.extra?.eas?.projectId ??
				(Constants as any).easConfig?.projectId;

			if (!projectId) {
				console.log("No EAS project ID found");
				return false;
			}

			// Attempt to get a push token (this will fail if FCM isn't configured)
			await Notifications.getExpoPushTokenAsync({ projectId });
			return true;
		} catch (error: any) {
			const msg = String(error?.message || error);
			if (
				msg.includes("Default FirebaseApp is not initialized") ||
				msg.includes("fcm-credentials") ||
				msg.includes("Make sure to complete the guide")
			) {
				return false;
			}
			console.warn("FCM check error:", msg);
			return false;
		}
	}

	static async registerForPushNotifications(): Promise<string | null> {
		let token: string | null = null;

		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 255, 255, 255],
				lightColor: "#FF231F7C",
			});
		}

		if (!Device.isDevice) {
			console.log("Skipping push token: must use physical device.");
			return null;
		}
		console.log("Is FCM Configured", await this.isFCMConfigured());

		// Permissions
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== "granted") {
			console.log("Push permission not granted.");
			return null;
		}

		// Expo Go on Android cannot fetch FCM token
		const ownership = (Constants as any).appOwnership;
		if (Platform.OS === "android" && ownership === "expo") {
			console.log("Skipping Android push token in Expo Go (no FCM).");
			return null;
		}

		try {
			const projectId =
				(Constants as any).expoConfig?.extra?.eas?.projectId ??
				(Constants as any).easConfig?.projectId;
			console.log("Project Id: ", projectId);
			const pushTokenData = await Notifications.getExpoPushTokenAsync({
				projectId,
			});
			console.log("Push token data: ", pushTokenData);
			token = pushTokenData.data;
		} catch (e: any) {
			const msg = String(e?.message || e);
			console.error("Error msg:", msg);
			if (
				Platform.OS === "android" &&
				(msg.includes("Default FirebaseApp is not initialized") ||
					msg.includes("fcm-credentials") ||
					msg.includes("Make sure to complete the guide"))
			) {
				console.warn(
					"FCM not configured; Android remote push disabled. Local notifications still work."
				);
				return null;
			}
			console.warn("Failed to get push token:", msg);
			return null;
		}

		return token;
	}

	static async sendTokenToServer(
		token: string,
		user_id: string
	): Promise<void> {
		try {
			await this.registerPushToken(token, user_id);
		} catch (error) {
			console.error("Erorr sending token to server:", error);
			throw error;
		}
	}

	static async scheduleLocalNotification(
		title: string,
		body: string,
		seconds: number = 1
	): Promise<string> {
		return await Notifications.scheduleNotificationAsync({
			content: {
				title,
				body,
				data: { type: "local" },
			},
			trigger: {
				seconds,
				type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
			},
		});
	}

	static async cancelNotification(notif_id: string): Promise<void> {
		await Notifications.cancelScheduledNotificationAsync(notif_id);
	}

	static async cancelAllNotifications(): Promise<void> {
		await Notifications.cancelAllScheduledNotificationsAsync();
	}

	static async getPermissionStatus(): Promise<Notifications.PermissionStatus> {
		const { status } = await Notifications.getPermissionsAsync();
		return status;
	}

	private static async registerPushToken(
		token: string,
		user_id: string
	): Promise<void> {
		try {
			const payload: PushTokenData = {
				token,
				user_id,
				platform: Platform.OS,
				device_id: `${user_id}_${Constants.deviceId}`,
			};
			console.log("Payload", payload);

			const response = await apiClient.post<ApiResponse>(
				"api/users/register_token",
				payload
			);

			if (response.data.status !== "success") {
				throw new Error(response.data.message);
			}

			console.log("Push token registered");
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const errorMessage =
					error.response?.data?.message || error.message;
				console.error("Failed to register push token:", errorMessage);
				throw new Error(`Registration failed: ${errorMessage}`);
			}
			throw error;
		}
	}
}

export default NotificationService;
