import { useState, useEffect, useCallback } from "react";
import { PushNotificationManager } from "../utils/push_notifications";

interface UsePushNotificationsOptions {
	vapidPublicKey: string;
	userId?: string;
	autoSubscribe?: boolean;
}

interface PushNotificationState {
	isSupported: boolean;
	permission: NotificationPermission | null;
	subscription: PushSubscription | null;
	isLoading: boolean;
	error: string | null;
	isSubscribed: boolean;
}

export const usePushNotifications = ({
	vapidPublicKey,
	userId,
	autoSubscribe = false,
}: UsePushNotificationsOptions) => {
	const [state, setState] = useState<PushNotificationState>({
		isSupported: false,
		permission: null,
		subscription: null,
		isLoading: false,
		error: null,
		isSubscribed: false,
	});

	const [pushManager] = useState(
		() => new PushNotificationManager(vapidPublicKey)
	);

	// Initialize push notifications support check
	useEffect(() => {
		const checkSupport = () => {
			const supported = pushManager.isSupported();
			const currentPermission =
				"Notification" in window ? Notification.permission : "default";

			setState((prev) => ({
				...prev,
				isSupported: supported,
				permission: currentPermission,
			}));
		};

		checkSupport();
	}, [pushManager]);

	// Auto-subscribe if enabled and user is available
	useEffect(() => {
		if (
			autoSubscribe &&
			userId &&
			state.isSupported &&
			state.permission === "granted"
		) {
			subscribeToPush();
		}
	}, [autoSubscribe, userId, state.isSupported, state.permission]);

	const requestPermission = useCallback(async () => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			const permission = await pushManager.requestPermission();
			setState((prev) => ({
				...prev,
				permission,
				isLoading: false,
				error:
					permission === "denied"
						? "Push notifications were denied"
						: null,
			}));
			return permission;
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to request permission";
			setState((prev) => ({
				...prev,
				error: errorMessage,
				isLoading: false,
			}));
			return "denied";
		}
	}, [pushManager]);

const subscribeToPush = useCallback(async () => {
    if (!userId) {
        setState((prev) => ({
            ...prev,
            error: "User ID is required for subscription",
        }));
        return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
        // Get current permission state directly
        const currentPermission = Notification.permission;
        
        // Request permission if not granted
        if (currentPermission !== "granted") {
            const permission = await pushManager.requestPermission();
            if (permission !== "granted") {
                throw new Error("Push notification permission denied");
            }
        }

        // Register service worker
        const registration = await pushManager.registerServiceWorker();
        if (!registration) {
            throw new Error("Failed to register service worker");
        }

        // Subscribe to push notifications
        const subscription = await pushManager.subscribeToPush(registration);
        if (!subscription) {
            throw new Error("Failed to create push subscription");
        }

        // Send subscription to server
        const success = await pushManager.sendSubscriptionToServer(
            subscription,
            userId
        );

        if (!success) {
            throw new Error("Failed to save subscription on server");
        }

        setState((prev) => ({
            ...prev,
            subscription,
            isSubscribed: true,
            isLoading: false,
            permission: "granted",
        }));

        return true;
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Failed to subscribe to push notifications";
        setState((prev) => ({
            ...prev,
            error: errorMessage,
            isLoading: false,
        }));
        return false;
    }
}, [pushManager, userId]); // Remove state.permission from dependencies

	const unsubscribe = useCallback(async () => {
		if (!state.subscription) {
			return true;
		}

		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			// Unsubscribe from push manager
			const success = await state.subscription.unsubscribe();

			if (success) {
				setState((prev) => ({
					...prev,
					subscription: null,
					isSubscribed: false,
					isLoading: false,
				}));
			}

			return success;
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to unsubscribe";
			setState((prev) => ({
				...prev,
				error: errorMessage,
				isLoading: false,
			}));
			return false;
		}
	}, [state.subscription]);

	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, error: null }));
	}, []);

	return {
		// State
		...state,

		// Actions
		requestPermission,
		subscribeToPush,
		unsubscribe,
		clearError,

		// Utilities
		canSubscribe: state.isSupported && !state.isSubscribed,
		needsPermission: state.permission === "default",
		permissionDenied: state.permission === "denied",
	};
};
