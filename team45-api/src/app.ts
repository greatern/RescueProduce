import dotenv from "dotenv";
dotenv.config()

import express, { Request, Response } from "express";
import cors from "cors";
import { initDatabase, sequelize } from "./config/sequelize";
import userRouter from "./routes/users";
import donorRouter from "./routes/donors";
import receiverRouter from "./routes/receiver";
import authRouter from "./routes/auth";
import listRouter from "./routes/foodlistings";
import volunteerRouter from "./routes/volunteer";
import taskRouter from "./routes/tasks";
//import reportRouter from "./routes/report";
import reportsRouter from "./routes/reports";
import pushNotificationRouter from "./routes/push_notifications";
import adminRouter from "./routes/admin";
import fraudCaseRoutes from "./routes/fraudCaseRoutes";
import mainRouter from "./routes/main";
//import notifRouter from "./routes/test_notification";
import path from "path";
import testDataRouter from "./routes/testData";
import { webPushNotifications } from "./utils/web_push_notifications";
import { PushSubscription } from "./models/push_notifications";

const app = express();


app.use(express.json());
app.use(cors());


const UPLOADS_DIR = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(UPLOADS_DIR));

console.log("Serving static files from:", UPLOADS_DIR);
app.get("/", (req: Request, res: Response) => {
	res.send("Hello world!");
});

const configurePushNotifications = () => {
    try {
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
        const vapidSubject = process.env.VAPID_SUBJECT;

        if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
            console.warn('⚠️  VAPID keys not found. Push notifications will be disabled.');
            console.warn('   Please set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT in your .env file');
            return false;
        }

        webPushNotifications.configure(vapidPublicKey, vapidPrivateKey, vapidSubject);
        console.log('✅ Web Push notifications configured successfully');
        console.log('   Public Key:', vapidPublicKey.substring(0, 20) + '...');
        return true;
    } catch (error) {
        console.error('❌ Failed to configure web push notifications:', error);
        return false;
    }
};

// Initialize push notifications
configurePushNotifications();

app.get("/", (req: Request, res: Response) => {
    res.json({ 
        message: "Hello world!",
        pushNotifications: webPushNotifications.isReady() ? 'Enabled' : 'Disabled'
    });
});

// Register routes
app.use("/api", mainRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/users", userRouter);
app.use("/api/donors", donorRouter);
app.use("/api/report", reportsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/receivers", receiverRouter);
app.use("/api/volunteers", volunteerRouter);
//app.use("/api/notifications", notifRouter);
app.use("/api/food_listings", listRouter);
app.use("/api/push-notifications",pushNotificationRouter);
app.use("/api/food_listings", listRouter);
app.use("/api/volunteers", volunteerRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/fraudcases", fraudCaseRoutes);
//app.use("/api/report", reportRouter);
//app.use("/api/reports", reportRouter);
app.use("/api/test", testDataRouter);
app.use("/api", mainRouter);

initDatabase();

export default app;
