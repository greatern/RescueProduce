import { apiClient } from "../services/api";

export class PushNotificationManager {
	private vapidPublicKey: string;

	constructor(vapidPublicKey: string) {
		this.vapidPublicKey = vapidPublicKey;
	}

	isSupported() {
		return "serviceWorker" in navigator && "PushManager" in window;
	}

async registerServiceWorker() {
    if (!this.isSupported()) {
        console.warn("Push notifications not supported");
        return null;
    }

    try {
         
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            await registration.unregister();
            console.log('Unregistered old service worker');
        }

        const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: '/'
        });
        
        console.log("Service Worker registered:", registration);
        return registration;
    } catch (error) {
        console.error("Service Worker registration failed:", error);
        return null;
    }
}
	async requestPermission() {
		if (!("Notification" in window)) {
			throw new Error("This browser does not support notifications");
		}

		const permission = await Notification.requestPermission();
		return permission;
	}

async subscribeToPush(registration: ServiceWorkerRegistration) {
    try {
        // If service worker is waiting, trigger skip waiting
        if (registration.waiting) {
            console.log('Service Worker is waiting, triggering skip waiting...');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Wait a bit for activation
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // If still no active service worker, wait a bit more
        if (!registration.active) {
            console.log('Waiting for service worker to become active...');
            let attempts = 0;
            while (!registration.active && attempts < 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        }

        if (!registration.active) {
            throw new Error('Service Worker not active after waiting');
        }

        const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
        
        console.log('Subscribing to push with applicationServerKey:', applicationServerKey);
        
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey,
        });

        console.log("Push subscription successful:", subscription);
        return subscription;
    } catch (error) {
        console.error("Failed to subscribe to push notifications:", error);
        return null;
    }
}
	async sendSubscriptionToServer(
		subscription: PushSubscription,
		user_id: string,
		user_agent?: string,
		device_type?: string
	) {
		try {
			const payload = {
				user_id: user_id,
				subscription: subscription,
				user_agent: user_agent || navigator.userAgent,
				device_type: device_type || this.detectDeviceType(),
			};

			const response = await apiClient.post(
				"/api/push-notifications/subscribe",
				payload
			);

			return response.status >= 200 && response.status < 300;
		} catch (error) {
			console.error("Failed to send subscription to server:", error);
			return false;
		}
	}

	detectDeviceType() {
		const user_agent = navigator.userAgent;
		if (/mobile/i.test(user_agent)) return "mobile";
		if (/tablet/i.test(user_agent)) return "tablet";
		return "desktop";
	}

	private urlBase64ToUint8Array(base64String: string) {
		const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/-/g, "+")
			.replace(/_/g, "/");

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}
}
