self.addEventListener("pushsubscriptionchange", function(event) {
    console.log('Push subscription changed, resubscribing...');
    
    event.waitUntil(
        self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BD_Z1zG5P4WXizO9scQ9nh4UcRVm5JEy3WrCDyNyypz33qHramzFCsF478VA7KBsfGAsQtCBOU0A3x5-FXFRPCU') // Replace this!
        })
        .then(function(newSubscription) {
            // Send new subscription to server
            return fetch('http://localhost:5001/api/push-notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: newSubscription
                })
            });
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to resubscribe');
            }
            console.log('Resubscribed successfully');
        })
        .catch(function(error) {
            console.error('Error during resubscription:', error);
        })
    );
});

self.addEventListener("install", (event) => {
	console.log("Service Worker installed");
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	console.log("Service Worker activated");
	event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
	console.log("Push message received:", event);

	let notificationData = {
		title: "Default Title",
		body: "Default message",
		icon: "/icon-192x192.png",
		badge: "/badge-72x72.png",
		tag: "default",
		requireInteraction: false,
		actions: [],
	};

	if (event.data) {
		try {
			const data = event.data.json();
			notificationData = { ...notificationData, ...data };
		} catch (e) {
			notificationData.body = event.data.text() || notificationData.body;
		}
	}

	const promiseChain = self.registration.showNotification(
		notificationData.title,
		{
			body: notificationData.body,
			icon: notificationData.icon,
			badge: notificationData.badge,
			tag: notificationData.tag,
			requireInteraction: notificationData.requireInteraction,
			actions: notificationData.actions,
			data: notificationData.data || {},
		}
	);

	event.waitUntil(promiseChain);
});

self.addEventListener("notificationclick", (event) => {
	console.log("Notification clicked:", event);

	event.notification.close();

	const clickAction = event.action || "default";
	const notificationData = event.notification.data || {};

	let urlToOpen = "/";

	if (clickAction === "default" && notificationData.url) {
		urlToOpen = notificationData.url;
	} else if (notificationData.actions) {
		const action = notificationData.actions.find(
			(a) => a.action === clickAction
		);
		if (action && action.url) {
			urlToOpen = action.url;
		}
	}

	const promiseChain = clients
		.matchAll({
			type: "window",
			includeUncontrolled: true,
		})
		.then((clientList) => {
			// Check if there's already a window/tab open with this URL
			for (const client of clientList) {
				if (client.url === urlToOpen && "focus" in client) {
					return client.focus();
				}
			}

			// If no window/tab is open, open a new one
			if (clients.openWindow) {
				return clients.openWindow(urlToOpen);
			}
		});

	event.waitUntil(promiseChain);
});

self.addEventListener("notificationclose", (event) => {
	console.log("Notification closed:", event);
	// track notification close events here
});self.addEventListener("install", (event) => {
    console.log("Service Worker installed");
    self.skipWaiting(); // This helps activate immediately
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker activated");
    // This ensures the service worker takes control immediately
    event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated, claiming clients...');
    event.waitUntil(self.clients.claim().then(() => {
        console.log('Service Worker now controlling all clients');
        return self.clients.matchAll();
    }).then(clients => {
        console.log(`Now controlling ${clients.length} clients`);
    }));
});