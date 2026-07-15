import { Sequelize } from "sequelize-typescript";
import { User } from "../models/user";
import dotenv from "dotenv";
import { Address } from "../models/address";
import { Notification } from "../models/notification";
import { UserAvailability } from "../models/user_availability";
import { Admin } from "../models/admin";
import { Appeal } from "../models/appeal";
import { AuditLogs } from "../models/audit_logs";
import { BackupReceiver } from "../models/backup_receiver";
import { Blocklist } from "../models/blocklist";
import { Claim } from "../models/claim";
import { Delivery } from "../models/delivery";
import { DeliveryCheck } from "../models/delivery_check";
import { Donor } from "../models/donor";
import { FoodListing } from "../models/food_listing";
import { FraudCase } from "../models/fraud_case";
import { Message } from "../models/message";
import { NoShowLog } from "../models/no_show_log";
import { Penalty } from "../models/penalty";
import { Rating } from "../models/rating";
import { Receiver } from "../models/receiver";
import { Report } from "../models/report";
import { Rewards } from "../models/reward";
import { UserAuthMetadata } from "../models/user_auth_metadata";
import { UserReward } from "../models/user_reward";
import { Volunteer } from "../models/volunteer";
import { Vehicle } from "../models/vehicle";
import { VolunteerOrganisation } from "../models/volunteer_organisation";
import { OrganizationPenalty } from "../models/organizationPenalty";
import { Task } from "../models/task";
import { OtpCode } from "../models/otp_code";
import { OtpRateLimit } from "../models/otp_rate_limit";
import { Pickup } from "../models/pickup";
import { PushSubscription } from "../models/push_notifications";


dotenv.config();

const models = [
	User,
	Address,

	Receiver,
	Admin,
	Donor,
	Volunteer,

	VolunteerOrganisation,
	Vehicle,
	Blocklist,
	Appeal,
	FoodListing,

	Claim,
	Delivery,
	DeliveryCheck,

	AuditLogs,
	BackupReceiver,
	FraudCase,
	Message,
	NoShowLog,
	Notification,
	PushSubscription,
	Penalty,
	Pickup,
	Rating,
	Report,
	Rewards,
	Task,
	UserAuthMetadata,
	UserAvailability,
	UserReward,
	OrganizationPenalty,

	OtpCode,
	OtpRateLimit,
];

export const sequelize = new Sequelize({
	dialect: "mysql",
	host: process.env.DB_HOST,
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	models: models,
	logging: false,
});

export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // Sync PushSubscription table only if needed
    console.log('🔄 Creating push_subscriptions table if it does not exist...');
    await PushSubscription.sync({ alter: true }); // safe sync for dev
    console.log('✅ Push subscriptions table ready');

    const count = await PushSubscription.count();
    console.log(`📊 Current push subscriptions: ${count}`);
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1);
  }
};