import { Op } from "sequelize";
import { Status, Task } from "../models/task";
import { Request, Response } from "express";
import { sequelize } from "../config/sequelize";
import { responseUtils } from "../utils/response";
import { User } from "../models/user";
import { Claim } from "../models/claim";
import { FoodListing, FoodStatus } from "../models/food_listing";
import { Donor } from "../models/donor";

export const getMissedTasks = async (req: Request, res: Response) => {
	const transaction = await sequelize.transaction();
	try {
		const missedTasks = await Task.findAll({
			where: {
				due_date: { [Op.lt]: new Date() },
			},
			attributes: { exclude: ["created_at", "updated_at"] },
			transaction,
		});

		const response = [];

		for (const t of missedTasks) {
			const claim = await Claim.findByPk(t.claim_id);
			const food_listing = await FoodListing.findByPk(claim?.listing_id);
			const donor = await User.findByPk(food_listing?.donor_id);
			const receiver = await User.findByPk(t.assigned_receiver_id);

			let assigned = "";
			if (t.assigned_volunteer_id) {
				const volunteer = await User.findByPk(t.assigned_volunteer_id);
				assigned = volunteer?.name!;
			} else {
				assigned = receiver?.name!;
			}

			const field = {
				id: t.id,
				donor_name: donor?.name,
				food_category: food_listing?.food_category,
				quantity: claim?.claimed_quantity,
				status: t.status,
				due_date: t.due_date,
				procurement_method: t.task_type,
				assigned_to: assigned,
			};

			response.push(field);
		}

		responseUtils.sendSuccessResponse(
			res,
			200,
			response,
			`Found ${response.length} missed deliveries`
		);
		await transaction.commit();
	} catch (error) {
		responseUtils.sendErrorResponse(
			res,
			500,
			"Error fetching for missed deliveries"
		);
		await transaction.rollback();
	}
};

export const getCancelledPickups = async (req: Request, res: Response) => {};

export const getCancelledDeliveries = async (req: Request, res: Response) => {};

export const getUnclaimedFood = async (req: Request, res: Response) => {
	try {
		const unclaimed = await FoodListing.findAll({
			where: {
				cutoff_pickup_date: {
					[Op.lt]: new Date(Date.now() * 1 * 24 * 60 * 60 * 60),
				}, // a day before the due date
				status: { [Op.ne]: FoodStatus.PICKED_UP },
			},
		});

		const unclaimed_list = [];
		for (const d of unclaimed) {
			const donor = await User.findByPk(d.donor_id);
			unclaimed_list.push({
				id: d.id,
				donor_name: donor?.name,
				food_category: d.food_category,
				quantity: d.available_quantity,
				expiry: d.expiry,
				cutoff_pickup_date: d.cutoff_pickup_date,
				status: d.status,
			});
		}
		responseUtils.sendSuccessResponse(res, 200, unclaimed_list);
	} catch (error) {
		responseUtils.sendErrorResponse(
			res,
			500,
			"Error getting unclaimed food"
		);
	}
};

export const getBackupUsers = async (req: Request, res: Response) => {
	try {
		const backups = await User.findAll({
			where: { is_backup: true },
			attributes: { exclude: ["password_hash"] },
		});
		if (backups.length === 0) {
			responseUtils.sendSuccessResponse(
				res,
				undefined,
				[],
				"No backups were found"
			);
			return;
		}
		responseUtils.sendSuccessResponse(res, 200, backups);
	} catch (error) {
		responseUtils.sendErrorResponse(res, 500);
	}
};
