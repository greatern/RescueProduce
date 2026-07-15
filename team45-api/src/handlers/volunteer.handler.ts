import { Request, Response } from "express";
import { Task, TaskType, Status } from "../models/task";
import { Claim } from "../models/claim";
import { FoodListing } from "../models/food_listing";
import { User } from "../models/user";
import { Address } from "../models/address";
import { UserAddress } from "../models/user_address";
import { Donor } from "../models/donor";
import { Receiver } from "../models/receiver";
import { responseUtils } from "../utils/response";
import { Op } from "sequelize";
import { Pickup, PickupStatus } from "../models/pickup";
import { pushNotificationUtil } from "../utils/push_notifications";
import { NOTIF_TYPE } from "../models/notification";
import { Volunteer } from "../models/volunteer";
import { Appeal } from "../models/appeal";
import { Blocklist } from "../models/blocklist";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
	interface Request {
	  user?: { id: number; [key: string]: any };
	}
  }
}

export const submitAppeal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // assuming you get user from auth middleware
    const { blockId } = req.params;
    const { appeal_reason } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Ensure the block exists
    const block = await Blocklist.findByPk(blockId);
    if (!block) return res.status(404).json({ message: "Block case not found" });

    // Extract file paths
    const evidenceFiles = req.files
      ? (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`)
      : [];

    // Create the appeal
    const appeal = await Appeal.create({
      user_id: userId,
      block_id: blockId,
      appeal_reason,
      evidence_files: evidenceFiles,
      status: "pending",
      submission_date: new Date(),
    });

    return res.status(201).json({ message: "Appeal submitted successfully", appeal });
  } catch (error) {
    console.error("Error submitting appeal:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// Get available tasks for volunteers
export const getAvailableTasks = async (req: Request, res: Response) => {
	try {
		const available_tasks = await Task.findAll({
			where: {
				status: Status.PENDING,
				task_type: TaskType.DELIVERY,
			},

			order: [["due_date", "ASC"]],
		});
		const task_ids = available_tasks.map((t) => t.id);
		const pickups = await Pickup.findAll({
			where: { task_id: { [Op.in]: task_ids } },
		});
		const response_data = available_tasks.map((t) => {
			const plain = t.get({ plain: true });
			const pickup = pickups.find((p) => p.task_id === t.id);
			const plain_pick = pickup?.get({ plain: true });
			return {
				...plain,
				pickup: pickup
					? {
							id: pickup.id,
							task_id: t.id,
							pickup_status: pickup.pickup_status,
					  }
					: null,
			};
		});

		responseUtils.sendSuccessResponse(res, 200, response_data);
	} catch (error) {
		console.error("Error fetching available tasks:", error);
		responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to fetch available tasks",
			error
		);
	}
};

// Accept a task
export const acceptTask = async (req: Request, res: Response) => {
	try {
		const { task_id, volunteer_id } = req.body;

		const task = await Task.findByPk(task_id);
		const pickup = await Pickup.findOne({ where: { task_id: task_id } });
		if (!task) {
			return responseUtils.sendErrorResponse(res, 404, "Task not found");
		}

		if (task.status === Status.COMPLETED) {
			return responseUtils.sendErrorResponse(
				res,
				400,
				"Task is no longer available"
			);
		}

		const volunteer = await User.findByPk(volunteer_id);

		await task.update({
			assigned_volunteer_id: volunteer_id,
			status: Status.CONFIRMED,
		});

		pushNotificationUtil.sendNotificationWithLogging(
			task.assigned_receiver_id,
			"Delivery Accepted!",
			`Hello! You Request for delivery has been accepted by ${volunteer?.name}. They are on their way.`,
			NOTIF_TYPE.DELIVERY,
			task_id,
			"tasks"
		);

		await pickup?.update({
			status: PickupStatus.CONFIRMED,
		});

		return responseUtils.sendSuccessResponse(res, 200, {
			task,
			message: "Task accepted successfully",
		});
	} catch (error) {
		console.error("Error accepting task:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to accept task",
			error
		);
	}
};

// Get tasks assigned to a specific volunteer
/* export const getVolunteerTasks = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		const volunteer_tasks = await Task.findAll({
			where: {
				assigned_volunteer_id: id,
				status: [Status.CONFIRMED],
			},
			include: [
				{
					model: Claim,
					as: "claim",
					include: [
						{
							model: FoodListing,
							as: "food_listing",
						},
						{
							model: Receiver,
							as: "receiver",
							include: [
								{
									model: User,
									as: "user",
									attributes: ["name", "phone"],
								},
							],
						},
					],
				},
				{
					model: Address,
					as: "pickup_address",
				},
				{
					model: Address,
					as: "destination_address",
				},
			],
			order: [["due_date", "ASC"]],
		});

		const task_ids = volunteer_tasks.map((t) => t.id);

		const pickups = await Pickup.findAll({
			where: { task_id: { [Op.in]: task_ids } },
		});

		const response_data = volunteer_tasks.map((t) => {
			const plain = t.get({ plain: true });
			const pickup = pickups.find((p) => p.task_id === t.id);
			return {
				...plain,
				pickup: pickup
					? {
							id: pickup.id,
							task_id: t.id,
							pickup_status: pickup.pickup_status,
					  }
					: null,
			};
		});

		return responseUtils.sendSuccessResponse(res, 200, response_data);
	} catch (error) {
		console.error("Error fetching volunteer tasks:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to fetch volunteer tasks",
			error
		);
	}
}; */

export const getActiveTasks = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		if (!id) {
			responseUtils.sendErrorResponse(res, 404, "Provide volunteer id");
			return;
		}
		const tasks = await Task.findAll({
			where: {
				assigned_volunteer_id: id,
				status: { [Op.ne]: Status.COMPLETED || Status.MISSED },
			},
		});
		if (tasks.length === 0) {
			responseUtils.sendSuccessResponse(
				res,
				200,
				[],
				"There are currently no active tasks"
			);
			return;
		}
		const task_ids = tasks.map((t) => t.id);

		const pickups = await Pickup.findAll({
			where: { task_id: { [Op.in]: task_ids } },
		});

		const response_data = tasks.map((t) => {
			const plain = t.get({ plain: true });
			const pickup = pickups.find((p) => p.task_id === t.id);
			return {
				...plain,
				pickup: pickup
					? {
							id: pickup.id,
							task_id: t.id,
							pickup_status: pickup.pickup_status,
					  }
					: null,
			};
		});
		responseUtils.sendSuccessResponse(res, 200, response_data);
	} catch (error) {
		responseUtils.sendErrorResponse(
			res,
			500,
			"Error fetching tasks",
			error
		);
	}
};

export const updateTaskStatus = async (req: Request, res: Response) => {
	try {
		const { id, status } = req.params;
		if (!id && !status) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"Please provide the task id and new status"
			);
			return;
		}
		const task = await Task.findByPk(id);
		if (!(<any>Object).values(Status).includes(status)) {
			responseUtils.sendErrorResponse(
				res,
				400,
				`Please provide a valid status`
			);
			return;
		}
		const valid_status = status as Status;
		switch (valid_status) {
			case Status.EN_ROUTE:
				await task?.update({
					pickup_time: new Date(),
				});
		}
		await task?.update({ status: valid_status });
		responseUtils.sendSuccessResponse(
			res,
			201,
			task,
			"Successfully updated task status"
		);
	} catch (error) {
		responseUtils.sendErrorResponse(
			res,
			undefined,
			"Could not update tasks"
		);
	}
};

export const confirmPickup = async (req: Request, res: Response) => {
	const { task_id, code } = req.body;
	try {
		if (!task_id || !code) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"Please provide both task id and code"
			);
			return;
		}
		const pickup = await Pickup.findOne({
			where: { task_id: task_id },
		});
		const task = await Task.findOne({ where: { id: task_id } });
		if (!pickup || !task) {
			responseUtils.sendErrorResponse(
				res,
				404,
				"Either pickup or task was not found"
			);
			return;
		}

		await pickup.update({
			pickup_status: PickupStatus.COMPLETED,
		});

		await task.update({
			status: Status.COLLECTED,
		});

		responseUtils.sendSuccessResponse(
			res,
			undefined,
			undefined,
			"Successful Pickup!"
		);
	} catch (error) {
		responseUtils.sendErrorResponse(res, 500, undefined, error);
	}
};


