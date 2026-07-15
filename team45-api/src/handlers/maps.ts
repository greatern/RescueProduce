import { Request, Response } from "express";
import { Proximity } from "../models/proximity";
import { Op } from "sequelize";
import { responseUtils } from "../utils/response";
import { User } from "../models/user";
import { Claim } from "../models/claim";
import { FoodListing } from "../models/food_listing";
import { Donor } from "../models/donor";
import { formatText } from "./donors";
import { Status, Task, TaskType } from "../models/task";
import { Address } from "../models/address";

class MapsHandler {
	public async getUsersProximity(req: Request, res: Response) {
		const { user_id, user_type, maximum } = req.body;

		if (!user_id || !user_type || !maximum) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"Please provide user_id, user_type, and maximum"
			);
			return;
		}

		try {
			const proximities = await Proximity.findAll({
				where: {
					[Op.or]: [{ user_a_id: user_id }, { user_b_id: user_id }],
					distance: { [Op.lte]: maximum },
				},
				include: [
					{
						model: User,
						as: "UserA",
						attributes: [
							"id",
							"first_name",
							"last_name",
							"user_type",
						],
					},
					{
						model: User,
						as: "userB",
						attributes: [
							"id",
							"first_name",
							"last_name",
							"user_type",
						],
					},
				],
				order: [["distance", "ASC"]],
			});

			const filtered_proximities =
				proximities.filter(
					(p) =>
						(p.user_a_id === user_id &&
							p.user_b_type === user_type) ||
						(p.user_b_id === user_id && p.user_b_type === user_type)
				) ?? proximities;

			responseUtils.sendSuccessResponse(
				res,
				undefined,
				filtered_proximities
			);
		} catch (error) {
			console.error("Error fetching proximities:", error);
			responseUtils.sendErrorResponse(
				res,
				undefined,
				"Failed to fetch proximities",
				error
			);
		}
	}

	public async getClosestDonations(req: Request, res: Response) {
		const { receiver_id, maximum } = req.body;
		if (!receiver_id) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"Please provide the receivers' id"
			);
			return;
		}
		try {
			const receiver_exists = await User.count({
				where: { id: receiver_id },
			});
			if (receiver_exists === 0) {
				responseUtils.sendErrorResponse(
					res,
					404,
					"Receiver does not exist"
				);
				return;
			}

			const claims = await Claim.findAll({
				where: {
					receiver_id: receiver_id,
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
				include: [{ model: Donor, as: "donor", attributes: ["id"] }],
			});

			const donor_ids = listings.map((l) => l.id);

			const donors_in_proximity = await Proximity.findAll({
				where: {
					[Op.and]: [
						{ distance: { [Op.lte]: maximum ?? 45 } },
						{
							[Op.or]: [
								{
									user_a_id: receiver_id,
									user_b_id: { [Op.in]: donor_ids },
								},
								{
									user_b_id: receiver_id,
									user_a_id: { [Op.in]: donor_ids },
								},
							],
						},
					],
				},
				include: [
					{
						model: User,
						as: "userA",
						attributes: [
							"id",
							"first_name",
							"last_name",
							"user_type",
						],
					},
					{
						model: User,
						as: "userB",
						attributes: [
							"id",
							"first_name",
							"last_name",
							"user_type",
						],
					},
				],
				order: [["distance", "ASC"]],
			});

			const donor_proximity_map = new Map();
			donors_in_proximity.map((p) => {
				const donor_id =
					p.user_a_id === receiver_id ? p.user_b_id : p.user_a_id;
				donor_proximity_map.set(donor_id, p);
			});

			const donations_within_proximity = [];
			for (const listing of listings) {
				const donor_id = listing.donor.user;
				const proximity = donor_proximity_map.get(donor_id);

				if (proximity) {
					const donor: User =
						proximity.user_a_id === receiver_id
							? proximity.userB
							: proximity.userA;

					donations_within_proximity.push({
						listing: {
							id: listing.id,
							title: formatText(listing.food_category),
							description: listing.description,
							available_quantity: listing.available_quantity,
							status: listing.status,
							cutoff_pickup_date: listing.cutoff_pickup_date,
							created_at: listing.created_at,
						},
						donor: {
							id: listing.donor.id,
							user_id: listing.donor.id,
							name: donor.name,
							user_type: donor.user_type,
						},
						proximity: {
							distance: proximity.distance,
							duration: proximity.duration,
						},
					});
				}
			}

			donations_within_proximity.sort(
				(a, b) => a.proximity.distance - b.proximity.distance
			);

			responseUtils.sendSuccessResponse(
				res,
				undefined,
				donations_within_proximity,
				`Found ${donations_within_proximity.length} nearby within ${
					maximum ?? 45
				} km`
			);
		} catch (error) {
			console.error("Error fetching closest donations:", error);
			responseUtils.sendErrorResponse(
				res,
				500,
				"Failed to fetch closest donations",
				error
			);
		}
	}

	public async getClosestTask(req: Request, res: Response) {
		const { volunteer_id, maximum } = req.body;
		if (!volunteer_id) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"Please provide the volunteers' id"
			);
			return;
		}

		try {
			const volunteer_exists = await User.count({
				where: { id: volunteer_id },
			});
			if (volunteer_exists === 0) {
				responseUtils.sendErrorResponse(
					res,
					404,
					"Volunteer does not exist"
				);
				return;
			}

			const tasks = await Task.findAll({
				where: {
					status: Status.PENDING,
					task_type: TaskType.DELIVERY,
				},
				include: [
					{
						model: Claim,
						as: "claim",
						attributes: ["id"],
						include: [
							{
								model: FoodListing,
								as: "food_listing",
								attributes: ["id"],
								include: [
									{
										model: Donor,
										as: "donor",
										attributes: ["id"],
										include: [
											{
												model: User,
												as: "user",
											},
										],
									},
								],
							},
						],
					},
				],
				order: [["due_date", "ASC"]],
			});

			const receiver_ids = tasks.map((t) => t.assigned_receiver_id);

			const receivers_within_proximity = await Proximity.findAll({
				where: {
					[Op.and]: [
						{ distance: { [Op.lte]: maximum ?? 45 } },
						{
							[Op.or]: [
								{
									user_a_id: volunteer_id,
									user_b_id: { [Op.in]: receiver_ids },
								},
								{
									user_b_id: volunteer_id,
									user_a_id: { [Op.in]: receiver_ids },
								},
							],
						},
					],
				},
				include: [
					{
						model: User,
						as: "userA",
						attributes: [
							"id",
							"first_name",
							"last_name",
							"user_type",
						],
					},
					{
						model: User,
						as: "userB",
						attributes: [
							"id",
							"first_name",
							"last_name",
							"user_type",
						],
					},
				],
				order: [["distance", "ASC"]],
			});

			const receiver_proximity_map = new Map();
			receivers_within_proximity.forEach((proximity) => {
				const receiver_id =
					proximity.user_a_id === volunteer_id
						? proximity.user_b_id
						: proximity.user_a_id;
				receiver_proximity_map.set(receiver_id, proximity);
			});

			const tasks_within_proximity = [];

			for (const task of tasks) {
				const receiver_id = task.assigned_receiver_id;
				const donor = task.claim.food_listing.donor.user;
				const proximity = receiver_proximity_map.get(receiver_id);

				if (proximity) {
					const receiver: User =
						proximity.user_a_id === volunteer_id
							? proximity.userB
							: proximity.userA;

					tasks_within_proximity.push({
						task: {
							id: task.id,
							title: task.title,
							description: task.description,
							status: task.status,
							task_type: task.task_type,
							due_date: task.due_date,
							created_at: task.created_at,
							assigned_receiver_id: task.assigned_receiver_id,
						},
						receiver: {
							id: receiver_id,
							name: receiver.name,
						},
						donor: {
							id: donor.id,
							name: donor.name,
						},
						proximity: {
							distance: proximity.distance,
							duration: proximity.duration,
						},
					});
				}
			}

			tasks_within_proximity.sort(
				(a, b) => a.proximity.distance - b.proximity.distance
			);

			responseUtils.sendSuccessResponse(
				res,
				undefined,
				tasks_within_proximity,
				`Found ${tasks_within_proximity.length} nearby tasks within ${
					maximum ?? 45
				}km`
			);
		} catch (error) {
			console.error("Error fetching closest tasks:", error);
			responseUtils.sendErrorResponse(
				res,
				500,
				"Failed to fetch closest tasks",
				error
			);
		}
	}
}

export default new MapsHandler();
