// src/index.ts
import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);

    console.log(`📧 VAPID Subject: ${process.env.VAPID_SUBJECT || 'Not configured'}`);
    console.log(`🔔 Push Notifications: ${process.env.VAPID_PUBLIC_KEY ? 'Enabled' : 'Disabled'}`)
});
