import { Request, Response } from "express";
import { Model, Op, fn, col, literal } from "sequelize";
import crypto from "crypto";
import { FoodListing } from "../models/food_listing";
import { Claim } from "../models/claim";
import { User } from "../models/user";
import { Status, Task, TaskType } from "../models/task";
import { Donor } from "../models/donor";
import { Address } from "../models/address";
import { sequelize } from "../config/sequelize";
import { ClaimDto } from "../dtos/claimDto";
import { responseUtils } from "../utils/response";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { mapUtils } from "../utils/maps";
import { Pickup, PickupStatus } from "../models/pickup";
import { pushNotificationUtil } from "../utils/push_notifications";
import { NOTIF_TYPE } from "../models/notification";
import { FraudCase } from "../models/fraud_case";

class ReceiverHandler {
	public async getFoodListings(req: Request, res: Response): Promise<void> {
		try {
			const param_receiver_id = req.params.id;

			const claims = await Claim.findAll({
				where: {
					receiver_id: param_receiver_id,
				},
				attributes: ["listing_id"],
			});

			let claimed_listing_id = claims.map((c) => c.listing_id);

			const listings = await FoodListing.findAll({
				where: {
					status: { [Op.in]: ["available", "partially_claimed"] },
					id: { [Op.notIn]: claimed_listing_id },
					cutoff_pickup_date: { [Op.gte]: new Date() },
				},
				order: [["cutoff_pickup_date", "ASC"]],
			});

			if (listings.length == 0) {
				responseUtils.sendSuccessResponse(
					res,
					200,
					[],
					"No Donations were found"
				);
				return;
			}

			const receiver_address = await Address.findOne({
				where: { user_id: param_receiver_id },
				include: {
					model: User,
					as: "user",
				},
			});

			const resListings = [];
			for (const l of listings) {
				const donor = await User.findOne({
					where: { id: l.donor_id },
					include: {
						model: Address,
						as: "addresses",
					},
				});

				const description = `This is a donation of ${l.food_category} from ${donor?.name}`;

				const donor_address = donor?.addresses?.[0];
				const receiver = receiver_address?.user;

				let distance = null;
				let duration = null;

				if (
					donor_address?.latitude &&
					donor_address?.longitude &&
					receiver_address?.latitude &&
					receiver_address?.longitude
				) {
					const distance_result = await mapUtils.calculateDistance(
						{
							lat: donor_address.latitude,
							lng: donor_address.longitude,
						},
						{
							lat: receiver_address.latitude,
							lng: receiver_address.longitude,
						}
					);
					if (distance_result) {
						distance = mapUtils.metersToKm(
							distance_result.distance
						);
						duration = mapUtils.secondsToMinutes(
							distance_result.duration
						);
					}
				}

				resListings.push({
					id: l.id,
					donor_id: l.id,
					donor_name: donor?.name,
					food_category: l.food_category,
					description: description,
					available_quantity: l.available_quantity,
					weight_per_unit: l.weight_per_unit,
					expiry: l.expiry,
					cutoff_pickup_date: l.cutoff_pickup_date,
					donor_address: donor_address,
					receiver_address: receiver_address,
					distance_km: distance,
					duration_minutes: duration,
				});
			}

			responseUtils.sendSuccessResponse(res, undefined, resListings);
		} catch (error) {
			console.error("Error fetching food listings:", error);
			responseUtils.sendErrorResponse(res, undefined, undefined, error);
		}
	}

	public async claim(req: Request, res: Response) {
		const claimData = plainToInstance(ClaimDto, req.body);
		const errors = await validate(claimData);
		if (errors.length > 0) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"Validation error",
				errors
			);
			return;
		}
		const transaction = await sequelize.transaction();
		try {
			const {
				listing_id,
				claimed_quantity,
				procurement_type,
				receiver_id,
				distance,
			} = claimData;

			const claim = await Claim.create(
				{
					listing_id: listing_id,
					receiver_id: receiver_id,
					claimed_quantity: claimed_quantity,
					// the claimed_amount_kg will be calculated by a trigger
				},
				{ transaction }
			);
			// The values in the foodlisting table will also be updated by a trigger

			const food_listing = await FoodListing.findOne({
				where: { id: listing_id },
				include: {
					model: Donor,
					as: "donor",
					include: [
						{
							model: User,
							as: "user",
						},
					],
				},
				transaction,
			});

			const donor = await User.findByPk(food_listing?.donor.id, {
				include: [
					{
						model: Address,
						as: "addresses",
					},
				],
				transaction,
			});
			const receiver = await User.findByPk(receiver_id, {
				include: [
					{
						model: Address,
						as: "addresses",
					},
				],
				transaction,
			});

			const donor_addresses = food_listing?.donor.user.addresses;

			const BUFFER_DAYS = 3;

			const daysFromNow = (d: number) =>
				new Date(Date.now() + d * 24 * 60 * 60 * 1000);

			let newTask: Task = new Task();

			const off_set = daysFromNow(BUFFER_DAYS);
			const fallback = daysFromNow(1);
			fallback.setHours(0, 0, 0, 0);
			off_set.setHours(0, 0, 0, 0);
			// the donation should be picked up within ${BUFFER_DAYS} it's been claimed
			const cutoff_date =
				off_set > food_listing?.cutoff_pickup_date!
					? fallback // if the cutoff pickup date is three days or less from the date it has been claimed
					: off_set; // it should be picked up by the following day

			switch (procurement_type) {
				case "delivery":
					newTask = await Task.create(
						{
							title: `Donation from ${donor?.name}`,
							description: `Requesting delivery from ${donor?.name} to ${receiver?.name}`,
							claim_id: claim.id,
							task_type: procurement_type,
							due_date: cutoff_date,
							assigned_receiver_id: receiver_id,
							distance: distance,
							pickup_address_id:
								donor?.addresses?.[0]?.id || null,
							destination_address_id:
								receiver?.addresses?.[0]?.id || null,
						},
						{ transaction }
					);
					break;
				case "pickup":
					newTask = await Task.create(
						{
							title: `Donation claim from ${donor?.name}`,
							description: `Please pickup your claim from ${donor?.name}`,
							claim_id: claim.id,
							task_type: procurement_type,
							due_date: cutoff_date,
							status: Status.READY,
							assigned_receiver_id: receiver_id,
							distance: distance,
							pickup_address_id:
								donor?.addresses?.[0]?.id || null,
							destination_address_id:
								receiver?.addresses?.[0]?.id || null,
						},
						{ transaction }
					);
			}

			const donor_id = donor?.id;
			const confirm_code = Math.floor(
				100000 + Math.random() * 900000
			).toString();
			await Pickup.create(
				{
					donor_id: donor_id,
					task_id: newTask.id,
					scheduled_pickup_time: newTask.due_date,
					confirmation_code: confirm_code,
					pickup_status:
						procurement_type === "delivery"
							? PickupStatus.SCHEDULED
							: PickupStatus.CONFIRMED,
				},
				{ transaction }
			);

			await transaction.commit();
			responseUtils.sendSuccessResponse(
				res,
				201,
				undefined,
				"Successfully claimed the donation"
			);
		} catch (error) {
			await transaction.rollback();
			responseUtils.sendErrorResponse(
				res,
				500,
				"Failed to create a claim"
			);
		}
	}

	public async getTasks(req: Request, res: Response) {
		try {
			const id = req.params.id;
			if (!id) {
				responseUtils.sendErrorResponse(
					res,
					400,
					"Please provide the user's id"
				);
				return;
			}
			const tasks = await Task.findAll({
				where: {
					assigned_receiver_id: id,
					status: {
						[Op.notIn]: [Status.COMPLETED, Status.CANCELLED],
					},
					due_date: { [Op.gt]: new Date() },
				},
			});
			if (tasks.length === 0) {
				responseUtils.sendSuccessResponse(
					res,
					200,
					[],
					"No tasks currently active"
				);
				return;
			}

			const taskResponse = await Promise.all(
				tasks.map(async (t) => {
					const claim = await Claim.findOne({
						where: { id: t.claim_id },
						include: [
							{
								model: FoodListing,
								as: "food_listing",
								order: [["created_at", "DESC"]],
							},
						],
					});

					const now = new Date();
					// A receiver cannot cancel 3 hours after they have claimed
					const can_cancel =
						claim?.created_at &&
						(now.getTime() - new Date(claim.created_at).getTime()) /
							(1000 * 60 * 60) <
							3;

					return {
						id: t.id,
						title: t.title,
						description: t.description,
						status: t.status,
						task_type: t.task_type,
						due_date: t.due_date,
						latest_pickup_time:
							claim?.food_listing.cutoff_pickup_time,
						distance: t.distance,
						claim_date: claim?.created_at,
						can_cancel,
					};
				})
			);

			responseUtils.sendSuccessResponse(
				res,
				200,
				taskResponse,
				"Task retrieved successfully"
			);
		} catch (error) {
			console.error("Error occured", error);
			responseUtils.sendErrorResponse(
				res,
				500,
				"Could not get tasks",
				error
			);
		}
	}

	public async confirmPickup(req: Request, res: Response) {
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
				status: Status.COMPLETED,
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
	}

	public async getHistory(req: Request, res: Response) {
		const { id } = req.params;
		try {
			const tasks = await Task.findAll({
				where: {
					assigned_receiver_id: id,
				},
			});

			responseUtils.sendSuccessResponse(
				res,
				200,
				tasks,
				"History retrieved successfully"
			);
		} catch (error) {
			console.error("Error fetching history:", error);
			responseUtils.sendErrorResponse(
				res,
				500,
				"Failed to fetch history",
				error
			);
		}
	}
	public async getClaimHistory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const claims = await Claim.findAll({
      where: { receiver_id: id },
      include: [
        {
          model: FoodListing,
          as: 'food_listing',
          include: [
            {
              model: Donor,
              as: 'donor',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['name', 'email']
                }
              ]
            }
          ]
        },
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'status', 'task_type', 'due_date']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const claimHistory = claims.map(claim => ({
      id: claim.id,
      claimId: claim.id,
      food_listing_id: claim.food_listing?.id,
      status: claim.task?.status || 'unknown',
      donorName: claim.food_listing?.donor?.user?.name,
      procurementMethod: claim.task?.task_type,
      due_date: claim.task?.due_date,
      taskId: claim.task?.id
    }));

    responseUtils.sendSuccessResponse(
      res,
      200,
      claimHistory,
      "Claim history retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching claim history:", error);
    responseUtils.sendErrorResponse(res, 500, "Error fetching claim history", error);
  }
}

	public async cancelTask(req: Request, res: Response) {
		const transaction = await sequelize.transaction();
		try {
			const { task_id, receiver_id } = req.params;
			if (!task_id || !receiver_id) {
				responseUtils.sendErrorResponse(
					res,
					400,
					"Please provide both the task Id and Receiver Id"
				);
				return;
			}

			const task = await Task.findByPk(task_id);
			const receiver = await User.findByPk(receiver_id);

			if (!task) {
				responseUtils.sendErrorResponse(res, 404, "Task not found");
				return;
			}
			if (!receiver) {
				responseUtils.sendErrorResponse(res, 404, "User not found");
				return;
			}

			const claim = await Claim.findOne({
				where: { id: task.claim_id },
				include: [{ model: FoodListing, as: "food_listing" }],
			});

			const food_listing = claim?.food_listing;
			if (food_listing && claim) {
				await food_listing.update(
					{
						claimed_quantity:
							food_listing.claimed_quantity -
							claim.claimed_quantity,
					},
					{ transaction }
				);
			}

			if (claim) {
				await claim.update({ claimed_quantity: 0 }, { transaction });
			}

			if (
				task.task_type === TaskType.DELIVERY &&
				task.assigned_volunteer_id
			) {
				pushNotificationUtil.sendNotificationWithLogging(
					task.assigned_volunteer_id,
					"Task cancelled",
					`${receiver.name} has cancelled the delivery, apologies for any inconvinience incurred.`,
					NOTIF_TYPE.ALERT,
					task_id,
					"tasks"
				);
			}

			await task.update({ status: "cancelled" }, { transaction });

			await transaction.commit();
			responseUtils.sendSuccessResponse(
				res,
				undefined,
				undefined,
				"The claim has been successfully cancelled."
			);
		} catch (error) {
			console.error("Error deleting claim:", error);
			await transaction.rollback();
			responseUtils.sendErrorResponse(
				res,
				undefined,
				"Error deleting a task",
				error
			);
		}
	}


public async getDashboard(req: Request, res: Response) {
  try {
	const receiverId = req.params.id;

	// Total kilograms successfully claimed by this receiver
	const totalKgSaved = await Claim.sum("claimed_amount_kg", {
	  where: { receiver_id: receiverId },
	});

	// Active food requests = listings still available
	const activeListings = await FoodListing.count({
	  where: { status: "available" },
	});

	// Near-expiry claims (expires in next 48 hours)
	const nearExpiryClaims = await Claim.count({
	  include: [
		{
		  model: FoodListing,
		  required: true,
		  where: {
			expiry: {
			  [Op.lte]: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
			},
		  },
		},
	  ],
	  where: { receiver_id: receiverId },
	});

	// Pending / active tasks assigned to this receiver
	const activeTasks = await Task.findAll({
	  where: {
		assigned_receiver_id: receiverId,
		status: { [Op.notIn]: ["completed", "cancelled"] },
	  },
	  order: [["created_at", "DESC"]],
	  attributes: ["id", "title", "description", "status", "due_date"],
	});

	// Fraud cases linked to this receiver
	const fraudCases = await FraudCase.count({
	  include: [
		{
		  model: Claim,
		  required: true,
		  where: { receiver_id: receiverId },
		},
	  ],
	});

const kgHistory = await Claim.findAll({
  where: { receiver_id: receiverId },
  attributes: [
    // Format  "2025-09" 
    [fn("DATE_FORMAT", col("created_at"), "%Y-%m"), "month"],
    [fn("SUM", col("claimed_amount_kg")), "kg"],
  ],
  group: [sequelize.fn("DATE_FORMAT", sequelize.col("created_at"), "%Y-%m")],
  order: [[literal("DATE_FORMAT(created_at, '%Y-%m')"), "ASC"]],
  limit: 12, // last 12 months 
  raw: true,
});

	 res.json({
	  totalKgSaved,       
      activeListings,     
      nearExpiryClaims,   
      activeTasks,    
      fraudCases,
	  totalKgSavedHistory: kgHistory.map((r: any) => ({
	  month: r.month,
	  kg: Number(r.kg),
	  })),
	});
  } catch (err) {
	console.error("Dashboard error:", err);
	res.status(500).json({ message: "Failed to load receiver dashboard." });
  }
}
}

export default new ReceiverHandler();
