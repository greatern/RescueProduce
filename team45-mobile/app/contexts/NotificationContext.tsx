import * as Notifications from "expo-notifications";
import {
	EventSubscription,
	Notification,
	NotificationResponse,
	PermissionStatus,
} from "expo-notifications";
import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import NotificationService from "../service/notifications";
import { User } from "../service/user";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

interface NotificationContextType {
	is_initialised: boolean;
	push_token: string | null;
	permission_status: PermissionStatus | null;
	last_notification: Notification | null;
	last_notification_response: NotificationResponse | null;
	error: string | null;
	initialiseNotifications: (user: User) => Promise<void>;
	scheduleLocalNotification: (
		title: string,
		body: string,
		seconds?: number
	) => Promise<string>;
	cancelNotification: (notif_id: string) => Promise<void>;
	cancelAllNotifications: () => Promise<void>;
	checkPermissionStatus: () => Promise<PermissionStatus>;
	clearError: () => void;
}

const NotificationContex = createContext<NotificationContextType | undefined>(
	undefined
);

export const useNotifications = () => {
	const context = useContext(NotificationContex);
	if (context === undefined)
		throw new Error(
			"useNotifications must be used within an NotificationProvider"
		);

	return context;
};

export const NotificationProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [isInitialised, setIsInitialised] = useState(false);
	const [pushToken, setPushToken] = useState<string | null>(null);
	const [permissionStatus, setPermissionStatus] =
		useState<PermissionStatus | null>(null);
	const [lastNotification, setLastNotification] =
		useState<Notification | null>(null);
	const [lastNotificationResponse, setLastNotificationResponse] =
		useState<NotificationResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	const notification_listener = useRef<EventSubscription | null>(null);
	const response_listener = useRef<EventSubscription | null>(null);

	useEffect(() => {
		setupNotificationListeners();

		return () => {
			cleanup();
		};
	}, []);

	const setupNotificationListeners = () => {
		// Listeners for notifications received while app is in foreground
		notification_listener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				console.log("Notification received:", notification);
				setLastNotification(notification);
			});

		// Listerns for when user taps on the notification
		response_listener.current =
			Notifications.addNotificationResponseReceivedListener(
				(response) => {
					console.log("Notification Tapped: ", response);
					setLastNotificationResponse(response);
					handleNotificationResponse(response);
				}
			);
	};

	const handleNotificationResponse = (response: NotificationResponse) => {
		const data = response.notification.request.content.data;

		if (data?.screen) {
			console.log("Navigate to:", data.screen);
		}

		if (data?.action) {
			console.log("Perfom action:", data.action);
		}
	};

	const initialiseNotifications = async (user: User) => {
		try {
			setError(null);
			console.log("Notifications");

			const current_status =
				await NotificationService.getPermissionStatus();
			setPermissionStatus(current_status);
			let token = user.expo_push_token;
			if (!user.expo_push_token || user.expo_push_token.length! > 5) {
				token =
					await NotificationService.registerForPushNotifications();
			}
			console.log("Token: ", token);

			if (token) {
				setPushToken(token);
				await NotificationService.sendTokenToServer(token, user?.id!);
				setIsInitialised(true);
				console.log("Push notifications initialized successfully");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to initialize notifications";
			setError(errorMessage);
			console.error("Failed to initialize push notifications:", error);
		}
	};

	const scheduleLocalNotification = async (
		title: string,
		body: string,
		seconds: number = 1
	): Promise<string> => {
		try {
			setError(null);
			return await NotificationService.scheduleLocalNotification(
				title,
				body,
				seconds
			);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to schedule notification";
			setError(errorMessage);
			throw error;
		}
	};

	const cancelNotification = async (notif_id: string): Promise<void> => {
		try {
			setError(null);
			await NotificationService.cancelNotification(notif_id);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to cancel notification";
			setError(errorMessage);
			throw error;
		}
	};

	const cancelAllNotifications = async (): Promise<void> => {
		try {
			setError(null);
			await NotificationService.cancelAllNotifications();
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to cancel notifications";
			setError(errorMessage);
			throw error;
		}
	};

	const checkPermissionStatus = async (): Promise<PermissionStatus> => {
		try {
			const status = await NotificationService.getPermissionStatus();
			setPermissionStatus(status);
			return status;
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to check permission status";
			setError(errorMessage);
			throw error;
		}
	};

	const clearError = (): void => {
		setError(null);
	};

	const cleanup = (): void => {
		if (notification_listener.current) {
			notification_listener.current.remove();
		}
		if (response_listener.current) {
			response_listener.current.remove();
		}
	};

	const value: NotificationContextType = {
		is_initialised: isInitialised,
		push_token: pushToken,
		permission_status: permissionStatus,
		last_notification: lastNotification,
		last_notification_response: lastNotificationResponse,
		error,
		initialiseNotifications,
		scheduleLocalNotification,
		cancelNotification,
		cancelAllNotifications,
		checkPermissionStatus,
		clearError,
	};

	return (
		<NotificationContex.Provider value={value}>
			{children}
		</NotificationContex.Provider>
	);
};
