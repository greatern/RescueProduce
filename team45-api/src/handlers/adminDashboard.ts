import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { FoodListing } from "../models/food_listing";
import { User } from "../models/user";
import { Task, Status } from "../models/task";
import { Donor } from "../models/donor";
import { Volunteer } from "../models/volunteer";
import { Receiver } from "../models/receiver";
import { Op, Sequelize } from "sequelize";
import { AdminDashboardDto } from "../dtos/adminDashboardDto";
import { sequelize } from "../config/sequelize";

export const getAdminDashboard = async (req: Request, res: Response) => {
	try {
		const totalUsers = await User.count();
		const donations = await FoodListing.findAll({
			attributes: [
				"posted_quantity",
				"weight_per_unit",
				"claimed_quantity",
			],
		});
		const totalDonations = (await FoodListing.sum("posted_quantity")) || 0;
		const claimedDonations = await FoodListing.sum("claimed_quantity");
		const totalDeliveriesCompleted = await Task.count({
			where: { status: Status.COMPLETED },
		});
		const totalDeliveriesFailed = await Task.count({
			where: { status: { [Op.ne]: Status.COMPLETED } },
		});

		const currentDate = new Date();
		const currentMonthStart = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			1
		);
		const lastMonthStart = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() - 1,
			1
		);

		const currentMonthWaste =
			(await FoodListing.sum("posted_quantity", {
				where: { created_at: { [Op.gte]: currentMonthStart } },
			})) || 0;

		const lastMonthWaste =
			(await FoodListing.sum("posted_quantity", {
				where: {
					created_at: {
						[Op.gte]: lastMonthStart,
						[Op.lt]: currentMonthStart,
					},
				},
			})) || 0;

		const wasteDataRaw = (await FoodListing.findAll({
			attributes: [
				[
					sequelize.fn(
						"DATE_FORMAT",
						sequelize.col("created_at"),
						"%Y-%m"
					),
					"month",
				],
				[
					sequelize.fn(
						"SUM",
						sequelize.literal("posted_quantity * weight_per_unit")
					),
					"total",
				],
			],
			where: {
				created_at: {
					[Op.gte]: new Date(currentDate.getFullYear(), 0, 1),
				},
			},
			group: ["month"],
			order: ["month"],
			raw: true,
		})) as unknown as { month: string; total: number }[];

		const wasteData = wasteDataRaw.map((r) => ({
			name: new Date(r.month + "-01").toLocaleString("default", {
				month: "short",
			}),
			total: r.total || 0,
		}));

		const donorCount = await Donor.count();
		const volunteerCount = await Volunteer.count();
		const receiverCount = await Receiver.count();

		const mealsProvided = Math.round(claimedDonations * 3.5);
		const co2Saved = Math.round(claimedDonations * 2.5);
		const peopleFed = Math.round(claimedDonations * 0.3);

		type TopDonorRaw = { donorName: string; totalQuantity: number };
		const topDonorsRaw = (await FoodListing.findAll({
			attributes: [
				"donor_id",
				[
					sequelize.fn(
						"SUM",
						sequelize.literal("posted_quantity * weight_per_unit")
					),
					"totalQuantity",
				],
				[sequelize.col("donor.user.name"), "donorName"],
			],
			include: [
				{
					model: Donor,
					as: "donor",
					attributes: [],
					include: [
						{
							model: User,
							as: "user",
							attributes: [],
						},
					],
				},
			],
			group: ["donor_id", "donor.user.name"],
			order: [
				[sequelize.fn("SUM", sequelize.col("posted_quantity")), "DESC"],
			],
			limit: 5,
			raw: true,
		})) as unknown as TopDonorRaw[];

		const topDonors = topDonorsRaw.map((d) => ({
			name: d.donorName,
			quantity: d.totalQuantity,
		}));

		type TopVolunteerRaw = {
			volunteerName: string;
			completedTasks: number;
		};
		const topVolunteersRaw = (await Task.findAll({
			attributes: [
				"assigned_volunteer_id",
				[
					sequelize.fn("COUNT", sequelize.col("Task.id")),
					"completedTasks",
				],
				[sequelize.col("volunteer.user.name"), "volunteerName"],
			],
			include: [
				{
					model: Volunteer,
					as: "volunteer",
					attributes: [],
					include: [
						{
							model: User,
							as: "user",
							attributes: [],
						},
					],
				},
			],
			where: { status: Status.COMPLETED },
			group: ["assigned_volunteer_id", "volunteer.user.name"],
			order: [[sequelize.fn("COUNT", sequelize.col("Task.id")), "DESC"]],
			limit: 5,
			raw: true,
		})) as unknown as TopVolunteerRaw[];

		const topVolunteers = topVolunteersRaw.map((v) => ({
			name: v.volunteerName,
			completedTasks: v.completedTasks,
		}));

		let accumulation = 0;
		for (const d of donations) {
			const qty =
				typeof d.claimed_quantity === "number"
					? d.claimed_quantity
					: parseFloat(d.claimed_quantity) || 0;
			const weight =
				typeof d.weight_per_unit === "number"
					? d.weight_per_unit
					: parseFloat(d.weight_per_unit) || 0;
			accumulation += qty * weight;
		}

		const deliverySuccessRate =
			totalDeliveriesCompleted + totalDeliveriesFailed > 0
				? (totalDeliveriesCompleted /
						(totalDeliveriesCompleted + totalDeliveriesFailed)) *
				  100
				: 0;
		const dashboardData: AdminDashboardDto = plainToInstance(
			AdminDashboardDto,
			{
				stats: {
					users: totalUsers,
					donations: totalDonations,
					accumulation: accumulation,
					deliveries: totalDeliveriesCompleted,
					deliveriesFailed: totalDeliveriesFailed,
					deliverySuccessRate: deliverySuccessRate.toFixed(1),
				},
				wasteTrend: {
					currentMonth: currentMonthWaste,
					lastMonth: lastMonthWaste,
				},
				wasteData,
				userDistribution: [
					{ name: "Donors", value: donorCount },
					{ name: "Volunteers", value: volunteerCount },
					{ name: "Receivers", value: receiverCount },
				],
				impactMetrics: {
					mealsProvided,
					co2Saved,
					peopleFed,
					wasteDiverted: accumulation,
				},
				topDonors,
				topVolunteers,
			}
		);

		res.status(200).json(dashboardData);
	} catch (error) {
		console.error("Error fetching admin dashboard:", error);
		res.status(500).json({ message: "Failed to fetch dashboard data" });
	}
};
