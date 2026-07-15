// src/routes/otp.ts
import { Router, Request, Response } from "express";
import { sequelize } from "../config/sequelize";
import { Model, Op, QueryTypes, where } from "sequelize";
import crypto from "crypto";
import { responseUtils } from "../utils/response";
import { Status, Task } from "../models/task";
import { Claim } from "../models/claim";
import { Receiver } from "../models/receiver";
import { User } from "../models/user";
import { OtpRateLimit } from "../models/otp_rate_limit";
import { OtpCode } from "../models/otp_code";
import { Notification, NOTIF_TYPE } from "../models/notification";

const router = Router();

// Generate OTP and send notification to receiver
router.post(
	"/generate/:taskId/:volunteerId",
	async (req: Request, res: Response) => {
		const { taskId, volunteerId } = req.params;

		if (!taskId && !volunteerId) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"Please provide the task id and volunteer id in your req params"
			);
			return;
		}
		const transaction = await sequelize.transaction();
		try {
			const task = await Task.findOne({
				where: {
					id: taskId,
					assigned_volunteer_id: volunteerId,
					status: Status.EN_ROUTE,
				},
				include: [
					{
						model: Claim,
						as: "claim",
						include: [
							{
								model: Receiver,
								as: "receiver",
								include: [
									{
										model: User,
										as: "user",
										attributes: ["id", "name"],
									},
								],
							},
						],
					},
				],
				transaction,
			});

			if (!task) {
				responseUtils.sendErrorResponse(res, 404, "Task not found");
				await transaction.rollback();
				return;
			}

			const receiver_id = task.claim.receiver.user.id;
			const receiver_name = task.claim.receiver.user.name;

			if (!receiver_id) {
				responseUtils.sendErrorResponse(
					res,
					404,
					"Receiver for this task was not found for some reason"
				);
				await transaction.rollback();
				return;
			}

			const rateLimitCheck = await OtpRateLimit.findOne({
				where: {
					identifier: receiver_id,
					limit_type: "user",
					window_start: {
						[Op.gt]: new Date(Date.now() - 3600 * 1000),
					},
				},
				transaction,
			});

			if (rateLimitCheck && rateLimitCheck.request_count >= 3) {
				responseUtils.sendErrorResponse(
					res,
					429,
					"Rate limit exceeded"
				);
				await transaction.rollback();
				return;
			}

			await OtpCode.update(
				{ used: true },
				{ where: { task_id: taskId, used: false }, transaction }
			);

			// generate 6-digit otp
			const otpCode = Math.floor(
				100000 + Math.random() * 900000
			).toString();
			const otpHash = crypto
				.createHash("sha256")
				.update(otpCode)
				.digest("hex");

			const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

			await OtpCode.create(
				{
					user_id: receiver_id,
					task_id: taskId,
					otp_code: otpCode.toString(),
					otp_hash: otpHash,
					expires_at: expiresAt,
					used: false,
					ip_address: req.ip,
					attempts: 0,
					max_attempts: 3,
				},
				{ transaction }
			);

			await Notification.create(
				{
					user_id: receiver_id,
					notification_type: NOTIF_TYPE.DELIVERY,
					title: "Delivery Confirmation Code",
					message: `Your delivery confirmation code is: ${otpCode}. Please share this with the volunteer to confirm your delivery.`,
					related_entity_type: "tasks",
					related_entity_id: taskId,
				},
				{ transaction }
			);

			if (rateLimitCheck) {
				await rateLimitCheck.update(
					{
						request_count: rateLimitCheck.request_count + 1,
					},
					{ transaction }
				);
			} else {
				await OtpRateLimit.create(
					{
						identifier: receiver_id,
						limit_type: "user",
						request_count: 1,
						window_start: new Date(),
						window_duration: 3600,
					},
					{ transaction }
				);
			}
			responseUtils.sendSuccessResponse(res, 200, "OTP sent to receiver");
			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			responseUtils.sendErrorResponse(res, 500, "Failed to generate OTP");
		}
	}
);

// Verify OTP and complete delivery
router.post("/verify/:id", async (req: Request, res: Response) => {
	const { id } = req.params; // volunteer id
	const { task_id, otp_code } = req.body;

	if (!otp_code || otp_code.length !== 6) {
		responseUtils.sendErrorResponse(res, 400, "Invalid OTP format");
		return;
	}
	try {
		const otp = await OtpCode.findOne({
			where: {
				task_id: task_id,
				used: false,
				expires_at: { [Op.gt]: new Date() },
			},
			order: [["created_at", "DESC"]],
		});

		if (!otp) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"No valid OTP found or OTP has expired"
			);
			return;
		}

		if (otp.attempts >= otp.max_attempts) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"Maximum verification attempts exceeded"
			);
			return;
		}

		await otp.update({ attempts: otp.attempts + 1 });

		// verify otp
		const input_hash = crypto
			.createHash("sha256")
			.update(otp_code)
			.digest("hex");
		const isValid = crypto.timingSafeEqual(
			Buffer.from(otp.otp_hash, "hex"),
			Buffer.from(input_hash, "hex")
		);

		if (!isValid) {
			responseUtils.sendErrorResponse(res, 400, "Invalid OTP");
			return;
		}

		await Task.update(
			{
				status: Status.COMPLETED,
				dropoff_time: new Date(),
			},
			{
				where: { id: task_id, assigned_volunteer_id: id },
			}
		);

		await Promise.all([
			Notification.create({
				user_id: otp.user_id,
				notification_type: "delivery",
				title: "Delivery Confirmed",
				message: "Your food delivery has been confirmed.",
				related_entity_type: "tasks",
				related_entity_id: task_id,
			}),
			Notification.create({
				user_id: id,
				notification_type: "delivery",
				title: "Delivery Completed",
				message: "You have successfully completed the delivery!",
				related_entity_type: "task",
				related_entity_id: task_id,
			}),
		]);

		responseUtils.sendSuccessResponse(
			res,
			200,
			undefined,
			"Delivery confirmed successfully"
		);
	} catch (error) {
		responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to verify OTP",
			error
		);
	}
});

export default router;
