import { Request, Response } from "express";
import { ClaimDto } from "../dtos/claimDto";
import { sequelize } from "../config/sequelize";
import { Claim } from "../models/claim";
import { Status, Task, TaskType } from "../models/task";
import { FoodListing } from "../models/food_listing";
import { Donor } from "../models/donor";
import { responseUtils } from "../utils/response";
import { Receiver } from "../models/receiver";
import { User } from "../models/user";
import { Address } from "../models/address";

const claimFoodListing = async (req: Request, res: Response) => {
	const findClosestVolunteers = (task: Task, receiver: User) => {
		// TODO: Implement volunteer matching logic
	};

	const claimBody: ClaimDto = req.body.claimData || req.body;
	const t = await sequelize.transaction();

	try {
		// Create the claim first
		const newClaim = await Claim.create(
			{
				listing_id: claimBody.listing_id,
				receiver_id: claimBody.receiver_id,
				claimed_quantity: claimBody.claimed_quantity,
				status: "pending",
			},
			{ transaction: t }
		);

		// Get food listing with donor information
		const foodListing = await FoodListing.findOne({
			where: { id: claimBody.listing_id },
			include: [
				{
					model: Donor,
					as: "donor",
					include: [
						{
							model: User,
							as: "user",
						},
					],
				},
			],
			transaction: t,
		});

		if (!foodListing || !foodListing.donor) {
			await t.rollback();
			return responseUtils.sendErrorResponse(
				res,
				404,
				"Food listing or donor not found"
			);
		}

		// Get receiver information
		const receiver = await User.findByPk(claimBody.receiver_id, {
			transaction: t,
		});

		if (!receiver) {
			await t.rollback();
			return responseUtils.sendErrorResponse(
				res,
				404,
				"Receiver not found"
			);
		}

		// Get addresses using direct link instead of junction table
		const donorAddress = await Address.findOne({
			where: { user_id: foodListing.donor.user.id },
			transaction: t,
		});

		const receiverAddress = await Address.findOne({
			where: { user_id: claimBody.receiver_id },
			transaction: t,
		});

		if (!donorAddress) {
			await t.rollback();
			return responseUtils.sendErrorResponse(
				res,
				400,
				"Donor must have an address registered to process delivery requests. Please contact the donor to update their profile."
			);
		}

		let createdTask;

		switch (claimBody.procurement_type) {
			case "delivery":
				if (!receiverAddress) {
					await t.rollback();
					return responseUtils.sendErrorResponse(
						res,
						400,
						"Receiver address required for delivery"
					);
				}

				createdTask = await Task.create(
					{
						title: `Delivery: ${foodListing.food_category}`,
						description: `Deliver ${claimBody.claimed_quantity} units of ${foodListing.food_category} from donor to receiver`,
						task_type: TaskType.DELIVERY,
						status: Status.PENDING,
						due_date: foodListing.cutoff_pickup_date,
						assigned_receiver_id: claimBody.receiver_id,
						pickup_address_id: donorAddress.id,
						destination_address_id: receiverAddress.id,
						claim_id: newClaim.id,
					},
					{ transaction: t }
				);

				findClosestVolunteers(createdTask, receiver);
				break;

			case "pickup":
				createdTask = await Task.create(
					{
						title: `Pickup: ${foodListing.food_category}`,
						description: `Receiver to pickup ${claimBody.claimed_quantity} units of ${foodListing.food_category}`,
						task_type: TaskType.PICKUP,
						status: Status.READY,
						due_date: foodListing.cutoff_pickup_date,
						assigned_receiver_id: claimBody.receiver_id,
						pickup_address_id: donorAddress.id,
						claim_id: newClaim.id,
					},
					{ transaction: t }
				);
				break;

			default:
				await t.rollback();
				return responseUtils.sendErrorResponse(
					res,
					400,
					"Invalid procurement type"
				);
		}

		await t.commit();

		return responseUtils.sendSuccessResponse(res, 200, {
			claim: newClaim,
			task: createdTask,
			message: `${claimBody.procurement_type} task created successfully`,
		});
	} catch (error) {
		await t.rollback();
		console.error("Claim creation error:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to create claim",
			error
		);
	}
};

export { claimFoodListing };
