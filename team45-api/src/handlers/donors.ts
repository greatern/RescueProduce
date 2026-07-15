import { Request, Response } from "express";
import { Donor } from "../models/donor";
import { Claim } from "../models/claim";
import { Address } from "../models/address";
import { Receiver } from "../models/receiver";
import { ErrorResponse } from "../validator/validationErrorResponse";
import { ValidationError } from "sequelize";
import { DonorDashboardDto } from "../dtos/donorDto";
import { Op } from "sequelize";
import { Task } from "../models/task";
import { User } from "../models/user";
import { plainToInstance } from "class-transformer";
import { responseUtils } from "../utils/response";
import { Volunteer } from "../models/volunteer";
import { FoodListing, FoodStatus } from "../models/food_listing";
import { sequelize } from "../config/sequelize";
import { Pickup, PickupStatus } from "../models/pickup";
import { pushNotificationUtil } from "../utils/push_notifications";

export const formatText = (title: string) => {
	const split = title.split(/\s|_|-/);
	let words: string[] = [];
	for (const f of split) {
		words.push(f.charAt(0).toUpperCase() + f.slice(1));
	}
	return words.join(" ");
};

export const getDonations = async (req: Request, res: Response) => {
	const donorId = req.params.id;

	if (!donorId) {
		res.status(400).json({
			message: "Donor ID is required",
		});
		return;
	}

	try {
		const donations = await FoodListing.findAll({
			where: { donor_id: donorId },
			order: [["created_at", "DESC"]],
			attributes: [
				"id",
				"food_category",
				"posted_quantity",
				"weight_per_unit",
				"cutoff_pickup_time",
				"status",
				"created_at",
			],
		});

		if (!donations || donations.length === 0) {
			res.status(404).json({
				message: "No donations found for this donor",
			});
			return;
		}

		const transformedDonations = donations.map((donation) => ({
			id: donation.id,
			food_category: donation.food_category,
			created_at: donation.created_at,
			weight_per_unit: donation.weight_per_unit,
			cutoff_pickup_date: donation.cutoff_pickup_date,
			status: donation.status,
			//	collected_by: donation.task?.assignedVolunteer?.user?.name || null
		}));

		res.status(200).json(transformedDonations);
	} catch (error) {
		console.error("Error fetching donations:", error);
		res.status(500).json({
			message: "Failed to fetch donations",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

export const donateFood = async (req: Request, res: Response) => {
	const transaction = await sequelize.transaction();
	try {
		const {
			donor_id,
			food_category,
			posted_quantity,
			weight_per_unit,
			quantity_type,
			cutoff_pickup_date,
			expiry,
			cutoff_pickup_time,
			storage_requirements,
		} = req.body;

		if (
			!donor_id ||
			!food_category ||
			!posted_quantity ||
			!weight_per_unit ||
			!quantity_type ||
			!cutoff_pickup_date ||
			!expiry ||
			!cutoff_pickup_time ||
			!storage_requirements
		) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"Missing required fields"
			);
			return;
		}

		const new_food_listing = await FoodListing.create({
			donor_id,
			food_category,
			posted_quantity,
			weight_per_unit,
			quantity_type,
			cutoff_pickup_date,
			expiry,
			cutoff_pickup_time,
			storage_requirements,
		});

		const donor = await User.findByPk(new_food_listing.donor_id);
		const users = await User.findAll({
			where: { user_type: "receiver" },
			attributes: ["id"],
			transaction,
		});

		const user_ids = users.map((u) => u.id);
		pushNotificationUtil.sendToMultipleUsers(
			user_ids,
			"New Donation",
			`New ${formatText(new_food_listing.food_category)} donation from ${
				donor?.name
			} is available.`,
			{
				listing_id: new_food_listing.id,
				food_category: new_food_listing.food_category,
				quantity: new_food_listing.posted_quantity,
				type: "new_donation",
			}
		);
		responseUtils.sendSuccessResponse(
			res,
			undefined,
			undefined,
			"Donation successful",
			new_food_listing
		);
		await transaction.commit();
	} catch (error) {
		if (error instanceof ValidationError) {
			ErrorResponse(res, error);
		} else {
			console.error("Error donating food:", error);
			responseUtils.sendErrorResponse(res, undefined, undefined, error);
		}
		transaction.rollback();
	}
};

export const getDashboard = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id) {
			responseUtils.sendErrorResponse(res, 404, "Donor ID is required");
			return;
		}

		// Check if donor exists first
		const donor = await Donor.findByPk(id, {
			include: [{ model: User, as: "user" }],
		});

		if (!donor) {
			responseUtils.sendErrorResponse(res, 404, "Donor not found");
			return;
		}

		const donations = await FoodListing.findAll({
			where: { donor_id: id },
		});

		const totalBoxesResult = (await FoodListing.findOne({
			where: { donor_id: id },
			attributes: [
				[
					sequelize.fn("SUM", sequelize.col("posted_quantity")),
					"total",
				],
			],
			raw: true,
		})) as { total: number | null } | null;

		const totalBoxes = totalBoxesResult?.total || 0;

		const impactStats = calculateImpactStats(donations);

		const formatString = (title: string) => {
			const split = title.split(/[\s-_]/);
			let words: string[] = [];
			for (const f of split) {
				words.push(f.charAt(0).toUpperCase() + f.slice(1));
			}
			return words.join(" ");
		};

		const recentActivities = donations
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() -
					new Date(a.created_at).getTime()
			)
			.slice(0, 3)
			.map((d) => ({
				id: d.id,
				text: `Donated ${parseInt(
					d.posted_quantity.toString()
				)} boxes of ${formatString(d.food_category)}`,
				date: d.created_at,
			}));

		const donorProfile = {
			name: donor.user?.name || "Unknown Donor",
			totalDonations: donations.length,
			joinDate: donor.user?.created_at || donor.created_at,
		};

		const communityStats = await calculateCommunityStats(id);

		const donationGoal = {
			current: donations.reduce(
				(sum, d) =>
					sum +
					(parseInt(
						(d.posted_quantity * d.weight_per_unit).toString()
					) || 0),
				0
			),
			target: 2000,
		};

		const dashboardData = plainToInstance(DonorDashboardDto, {
			donationStats: {
				total: donations.length,
				totalBoxes: parseInt(totalBoxes.toString()),
				thisMonth: donations.filter(
					(d) =>
						new Date(d.created_at).getMonth() ===
						new Date().getMonth()
				).length,
			},
			impactStats,
			recentActivities,
			donorProfile,
			communityStats,
			donationGoal,
		});

		responseUtils.sendSuccessResponse(
			res,
			200,
			dashboardData,
			"Dashboard data retrieved successfully"
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		responseUtils.sendErrorResponse(
			res,
			500,
			"Error fetching dashboard data",
			errorMessage
		);
	}
};

function calculateImpactStats(donations: FoodListing[]): {
	mealsProvided: number;
	co2Saved: number;
} {
	const totalWeightKg = donations.reduce(
		(sum, d) => sum + (d.claimed_quantity * d.weight_per_unit || 0),
		0
	);

	const mealsPerKg = 3;
	const co2SavedPerKg = 0.5;

	const mealsProvided = Math.ceil(totalWeightKg * mealsPerKg);
	const co2Saved = totalWeightKg * co2SavedPerKg;

	return { mealsProvided, co2Saved };
}

async function calculateCommunityStats(
	donorId: string
): Promise<{ rank: number; totalDonors: number }> {
	const allDonors = await Donor.findAll();
	const totalDonors = allDonors.length;

	//  rank is based on total donations
	const donorDonations = await FoodListing.count({
		where: { donor_id: donorId },
	});
	const donorRanks = await Promise.all(
		allDonors.map(async (d) => ({
			id: d.id,
			donationCount: await FoodListing.count({
				where: { donor_id: d.id },
			}),
		}))
	);
	const rank =
		donorRanks
			.sort((a, b) => b.donationCount - a.donationCount)
			.findIndex((d) => d.id === donorId) + 1;

	return { rank: rank > 0 ? rank : totalDonors, totalDonors };
}

export const getDonorStats = async (req: Request, res: Response) => {
	try {
		const donorId = req.params.donorId;

		const donations = await FoodListing.findAll({
			where: { donor_id: donorId },
		});

		const totalKgDonated = donations.reduce((total, donation) => {
			const kg = donation.weight_per_unit * donation.posted_quantity;
			return total + kg;
		}, 0);

		const totalMealsProvided = Math.floor(totalKgDonated / 0.5);
		const totalCarbonSaved = totalKgDonated * 0.5;
		const totalNGOsSupported = Math.min(
			Math.floor(donations.length / 2),
			15
		);

		const totalValue = donations.reduce((total, donation) => {
			return (
				total + donation.weight_per_unit * donation.posted_quantity * 15
			);
		}, 0);

		const claimedDonations = donations.filter(
			(d) => d.claimed_quantity > 0
		).length;
		const utilizationRate =
			donations.length > 0
				? (claimedDonations / donations.length) * 100
				: 0;

		const activeDonations = donations.filter(
			(d) =>
				d.posted_quantity - d.claimed_quantity > 0 &&
				new Date(d.expiry) > new Date()
		).length;

		const completedDonations = donations.filter(
			(d) => d.claimed_quantity >= d.posted_quantity
		).length;

		res.status(200).json({
			totalKgDonated: Math.round(totalKgDonated),
			totalMealsProvided,
			totalCarbonSaved: Math.round(totalCarbonSaved),
			totalNGOsSupported,
			totalValue: Math.round(totalValue),
			utilizationRate: Math.round(utilizationRate),
			donationCount: donations.length,
			activeDonations,
			completedDonations,
		});
	} catch (error) {
		console.error("Error fetching donor stats:", error);
		res.status(500).json({
			message: "Failed to fetch donor statistics",
			error,
		});
	}
};

export const getDonationHistory = async (req: Request, res: Response) => {
	const id = req.params.donorId;
	if (!id) {
		responseUtils.sendErrorResponse(
			res,
			400,
			"Please provide the donor id"
		);
		return;
	}
	try {
		const donations = await FoodListing.findAll({
			where: { donor_id: id },
			order: [["expiry", "DESC"]],
		});

		if (donations.length === 0) {
			responseUtils.sendSuccessResponse(
				res,
				200,
				[],
				"No available donations"
			);
			return;
		}

		const expiredIds = donations
			.filter((d) => d.expiry && new Date(d.expiry) < new Date())
			.map((d) => d.id);

		if (expiredIds.length > 0) {
			await FoodListing.update(
				{ status: FoodStatus.EXPIRED },
				{ where: { id: { [Op.in]: expiredIds } } }
			);
		}
		responseUtils.sendSuccessResponse(res, 200, donations);
	} catch (error) {
		console.error("Error fetching donation history:", error);
		res.status(500).json({
			message: "Failed to fetch donation history",
			error,
		});
	}
};

export const getActiveDonations = async (req: Request, res: Response) => {
	try {
		const donorId = req.params.donorId;

		if (!donorId) {
			return responseUtils.sendErrorResponse(
				res,
				400,
				"Donor ID is required"
			);
		}

		// Check if donor exists
		const donor = await Donor.findByPk(donorId);
		if (!donor) {
			return responseUtils.sendErrorResponse(res, 404, "Donor not found");
		}
		const activeDonations = await FoodListing.findAll({
			where: {
				donor_id: donorId,
				status: ["available", "partially_claimed", "claimed"],
				expiry: { [Op.gt]: new Date() },
			},
			include: [
				{
					model: Claim,
					as: "claims",
					attributes: ["id", "claimed_quantity", "created_at"],
				},
			],
			order: [["expiry", "ASC"]],
			limit: 20,
		});

		const formattedDonations = activeDonations.map((donation) => {
			const hoursElapsed =
				(Date.now() - new Date(donation.created_at).getTime()) /
				(1000 * 60 * 60);

			const claimCount = donation.claims ? donation.claims.length : 0;
			const hasBeenClaimed = claimCount > 0;
			const canDelete = hoursElapsed < 3;

			return {
				id: donation.id,
				food_category: donation.food_category,
				posted_quantity: donation.posted_quantity,
				claimed_quantity: donation.claimed_quantity,
				available_quantity:
					donation.posted_quantity - donation.claimed_quantity,
				weight_per_unit: donation.weight_per_unit,
				total_weight:
					donation.posted_quantity * donation.weight_per_unit,
				quantity_type: donation.quantity_type,
				cutoff_pickup_date: donation.cutoff_pickup_date,
				cutoff_pickup_time: donation.cutoff_pickup_time,
				expiry: donation.expiry,
				status: donation.status,
				created_at: donation.created_at,
				storage_requirements: donation.storage_requirements,
				requires_refrigeration: donation.requires_refrigeration,
				contains_allergens: donation.contains_allergens,
				description: donation.description,
				expiry_days_left: donation.expiry_days_left,
				urgency_level: donation.expiry_status,
				can_delete:
					(canDelete && !hasBeenClaimed) ||
					donation.status === FoodStatus.AVAILABLE, // Can only delete if not claimed
				hours_since_created: Math.round(hoursElapsed * 100) / 100,
				claim_count: claimCount,
				has_been_claimed: hasBeenClaimed,
				claim_details:
					donation.claims?.map((claim) => ({
						id: claim.id,
						quantity_claimed: claim.claimed_quantity,
						claimed_at: claim.created_at,
					})) || [],
			};
		});

		responseUtils.sendSuccessResponse(
			res,
			200,
			formattedDonations,
			"Active donations retrieved successfully"
		);
	} catch (error) {
		console.error("Error fetching active donations:", error);
		responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to fetch active donations",
			error instanceof Error ? error.message : "Unknown error"
		);
	}
};

export const getRecentDonations = async (req: Request, res: Response) => {
	try {
		const donorId = req.params.donorId;
		const limit = parseInt(req.body.limit as string) || 5;

		const recentDonations = await FoodListing.findAll({
			where: { donor_id: donorId },
			order: [["created_at", "DESC"]],
			limit,
		});

		const formattedDonations = recentDonations.map((donation) => ({
			...donation.toJSON(),
			quantity: donation.posted_quantity,
			quantity_unit: donation.quantity_type,
			expiry_date: donation.expiry,
			estimated_value:
				donation.weight_per_unit * donation.posted_quantity * 15,
			estimated_meals: Math.floor(
				(donation.weight_per_unit * donation.posted_quantity) / 0.5
			),
			estimated_carbon_saved:
				donation.weight_per_unit * donation.posted_quantity * 0.5,
		}));

		res.status(200).json({ donations: formattedDonations });
	} catch (error) {
		console.error("Error fetching recent donations:", error);
		res.status(500).json({
			message: "Failed to fetch recent donations",
			error,
		});
	}
};

export const getImpactData = async (req: Request, res: Response) => {
	try {
		const donorId = req.params.donorId;
		const { period = "year" } = req.query;

		let dateFilter = {};
		const now = new Date();

		switch (period) {
			case "month":
				dateFilter = {
					created_at: {
						[Op.gte]: new Date(
							now.getFullYear(),
							now.getMonth(),
							1
						),
					},
				};
				break;
			case "quarter":
				const quarterStart = new Date(
					now.getFullYear(),
					Math.floor(now.getMonth() / 3) * 3,
					1
				);
				dateFilter = {
					created_at: {
						[Op.gte]: quarterStart,
					},
				};
				break;
			case "year":
				dateFilter = {
					created_at: {
						[Op.gte]: new Date(now.getFullYear(), 0, 1),
					},
				};
				break;
		}

		const donations = await FoodListing.findAll({
			where: {
				donor_id: donorId,
				...dateFilter,
			},
		});

		const totalWeight = donations.reduce(
			(sum, d) => sum + d.weight_per_unit * d.posted_quantity,
			0
		);
		const carbonSaved = Math.round(totalWeight * 0.5);
		const mealsProvided = Math.floor(totalWeight / 0.5);
		const wasteReduced = totalWeight;
		const ngoCount = Math.min(Math.floor(donations.length / 2), 15);

		// Generate monthly trends
		const monthlyTrends = [];
		for (let i = 5; i >= 0; i--) {
			const monthDate = new Date(
				now.getFullYear(),
				now.getMonth() - i,
				1
			);
			const monthDonations = donations.filter((d) => {
				const donationDate = new Date(d.created_at);
				return (
					donationDate.getMonth() === monthDate.getMonth() &&
					donationDate.getFullYear() === monthDate.getFullYear()
				);
			});

			const monthWeight = monthDonations.reduce(
				(sum, d) => sum + d.weight_per_unit * d.posted_quantity,
				0
			);

			monthlyTrends.push({
				month: monthDate.toLocaleDateString("en-US", { month: "long" }),
				year: monthDate.getFullYear(),
				donations: monthDonations.length,
				impact: Math.round(monthWeight * 2),
				weight: Math.round(monthWeight),
				carbonSaved: Math.round(monthWeight * 0.5),
				mealsProvided: Math.floor(monthWeight / 0.5),
			});
		}

		const categoryMap = new Map();
		donations.forEach((d) => {
			const category = d.food_category;
			const weight = d.weight_per_unit * d.posted_quantity;

			if (categoryMap.has(category)) {
				categoryMap.set(category, categoryMap.get(category) + weight);
			} else {
				categoryMap.set(category, weight);
			}
		});

		const categoryImpact = Array.from(categoryMap.entries()).map(
			([category, weight]) => ({
				category,
				weight: Math.round(weight),
				meals: Math.floor(weight / 0.5),
				carbon: Math.round(weight * 0.5),
				percentage: Math.round((weight / totalWeight) * 100) || 0,
			})
		);

		res.status(200).json({
			carbonSaved,
			mealsProvided,
			wasteReduced: Math.round(wasteReduced),
			ngoCount,
			totalDonations: donations.length,
			totalWeight: Math.round(totalWeight),
			averageImpactPerDonation:
				donations.length > 0
					? Math.round((mealsProvided / donations.length) * 10) / 10
					: 0,
			monthlyTrends,
			categoryImpact,
		});
	} catch (error) {
		console.error("Error fetching impact data:", error);
		res.status(500).json({ message: "Failed to fetch impact data", error });
	}
};

export const getDonationAnalytics = async (req: Request, res: Response) => {
	try {
		const donorId = req.params.donorId;
		const { period = "year" } = req.query;

		let dateFilter = {};
		const now = new Date();

		switch (period) {
			case "month":
				dateFilter = {
					created_at: {
						[Op.gte]: new Date(
							now.getFullYear(),
							now.getMonth(),
							1
						),
					},
				};
				break;
			case "year":
				dateFilter = {
					created_at: {
						[Op.gte]: new Date(now.getFullYear(), 0, 1),
					},
				};
				break;
		}

		const donations = await FoodListing.findAll({
			where: {
				donor_id: donorId,
				...dateFilter,
			},
		});

		const donationTrends = [];
		const categoryBreakdown = new Map();

		donations.forEach((donation) => {
			const category = donation.food_category;
			if (categoryBreakdown.has(category)) {
				categoryBreakdown.set(
					category,
					categoryBreakdown.get(category) + 1
				);
			} else {
				categoryBreakdown.set(category, 1);
			}
		});

		const totalDonations = donations.length;
		const categoryArray = Array.from(categoryBreakdown.entries()).map(
			([category, count]) => ({
				category,
				count,
				percentage:
					totalDonations > 0
						? Math.round((count / totalDonations) * 100)
						: 0,
				impact: Math.round(count * 15),
			})
		);

		// Generate trends for last 7 days
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);

			const dayDonations = donations.filter((d) => {
				const donationDate = new Date(d.created_at);
				return donationDate.toDateString() === date.toDateString();
			});

			donationTrends.push({
				date: date,
				count: dayDonations.length,
				volume: Math.round(
					dayDonations.reduce(
						(sum, d) => sum + d.weight_per_unit * d.posted_quantity,
						0
					)
				),
				impact: Math.round(dayDonations.length * 15),
			});
		}

		const totalWeight = donations.reduce(
			(sum, d) => sum + d.weight_per_unit * d.posted_quantity,
			0
		);

		const claimedDonations = donations.filter(
			(d) => d.claimed_quantity > 0
		).length;
		const efficiencyScore =
			donations.length > 0
				? Math.round((claimedDonations / donations.length) * 100)
				: 0;

		const impactMetrics = [
			{
				metric: "efficiency_score",
				value: efficiencyScore,
				trend: Math.random() * 20 - 5,
				unit: "%",
			},
			{
				metric: "waste_reduction_rate",
				value: Math.round(totalWeight),
				trend: Math.random() * 25 - 10,
				unit: "kg",
			},
			{
				metric: "community_reach",
				value: Math.floor(totalWeight / 0.5),
				trend: Math.random() * 15 - 5,
				unit: " meals",
			},
		];

		const comparisonData = {
			previousPeriod: Math.round(totalWeight * 0.8),
			currentPeriod: Math.round(totalWeight),
			percentageChange:
				totalWeight > 0
					? Math.round(
							((totalWeight - totalWeight * 0.8) /
								(totalWeight * 0.8)) *
								100
					  )
					: 0,
		};

		res.status(200).json({
			donationTrends,
			categoryBreakdown: categoryArray,
			impactMetrics,
			comparisonData,
		});
	} catch (error) {
		console.error("Error fetching analytics:", error);
		res.status(500).json({ message: "Failed to fetch analytics", error });
	}
};

export const getTaxRecords = async (req: Request, res: Response) => {
	try {
		const donorId = req.params.donorId;
		const { year } = req.query;

		let dateFilter = {};
		if (year) {
			const targetYear = parseInt(year as string);
			dateFilter = {
				created_at: {
					[Op.gte]: new Date(targetYear, 0, 1),
					[Op.lt]: new Date(targetYear + 1, 0, 1),
				},
			};
		}

		const donations = await FoodListing.findAll({
			where: {
				donor_id: donorId,
				...dateFilter,
			},
		});

		const taxRecords: any[] = [];
		const yearlyData = new Map();

		donations.forEach((donation) => {
			const date = new Date(donation.created_at);
			const donationYear = date.getFullYear();
			const quarter = Math.floor(date.getMonth() / 3) + 1;
			const value =
				donation.weight_per_unit * donation.posted_quantity * 15;

			if (!yearlyData.has(donationYear)) {
				yearlyData.set(donationYear, {
					year: donationYear,
					totalValue: 0,
					donationCount: 0,
					quarters: new Map(),
				});
			}

			const yearData = yearlyData.get(donationYear);
			yearData.totalValue += value;
			yearData.donationCount += 1;

			if (!yearData.quarters.has(quarter)) {
				yearData.quarters.set(quarter, {
					year: donationYear,
					quarter,
					totalValue: 0,
					donationCount: 0,
				});
			}

			const quarterData = yearData.quarters.get(quarter);
			quarterData.totalValue += value;
			quarterData.donationCount += 1;
		});

		yearlyData.forEach((yearData: any) => {
			taxRecords.push({
				year: yearData.year,
				totalValue: Math.round(yearData.totalValue),
				estimatedDeduction: Math.round(yearData.totalValue * 0.9),
				potentialSavings: Math.round(yearData.totalValue * 0.9 * 0.28),
				donationCount: yearData.donationCount,
			});

			yearData.quarters.forEach((quarterData: any) => {
				taxRecords.push({
					year: quarterData.year,
					quarter: quarterData.quarter,
					totalValue: Math.round(quarterData.totalValue),
					estimatedDeduction: Math.round(
						quarterData.totalValue * 0.9
					),
					potentialSavings: Math.round(
						quarterData.totalValue * 0.9 * 0.28
					),
					donationCount: quarterData.donationCount,
				});
			});
		});

		res.status(200).json({ records: taxRecords });
	} catch (error) {
		console.error("Error fetching tax records:", error);
		res.status(500).json({ message: "Failed to fetch tax records", error });
	}
};

export const getNotifications = async (req: Request, res: Response) => {
	try {
		const donorId = req.params.donorId;
		const limit = parseInt(req.query.limit as string) || 5;

		const notifications = [
			{
				id: "1",
				message:
					"Your fresh vegetables donation was successfully picked up by Community Kitchen",
				type: "success",
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 2),
				read: false,
			},
			{
				id: "2",
				message:
					"Reminder: Your bread donation expires tomorrow. Please arrange pickup.",
				type: "warning",
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
				read: false,
			},
			{
				id: "3",
				message:
					"You've reached 100 meals provided this month! Thank you for your impact.",
				type: "info",
				created_at: new Date(Date.now() - 1000 * 60 * 60 * 48),
				read: true,
			},
		];

		res.status(200).json({ notifications: notifications.slice(0, limit) });
	} catch (error) {
		console.error("Error fetching notifications:", error);
		res.status(500).json({
			message: "Failed to fetch notifications",
			error,
		});
	}
};

export const getPickups = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const pickups = await Pickup.findAll({
			where: {
				donor_id: id,
				pickup_status: { [Op.ne]: PickupStatus.COMPLETED },
			},
			order: [["created_at", "DESC"]],
		});
		if (pickups.length === 0) {
			responseUtils.sendSuccessResponse(
				res,
				200,
				[],
				"No pickups were found"
			);
			return;
		}
		responseUtils.sendSuccessResponse(
			res,
			undefined,
			pickups,
			"Retrieval Successful"
		);
	} catch (error) {
		responseUtils.sendErrorResponse(res, undefined, "Server error", error);
	}
};

export const deleteDonation = async (req: Request, res: Response) => {
	const { id } = req.params;
	if (!id) {
		responseUtils.sendErrorResponse(
			res,
			400,
			"Please provide the donation id"
		);
	}
	try {
		const food_listing = await FoodListing.findByPk(id);
		if (!food_listing) {
			responseUtils.sendErrorResponse(res, 404, "Food listing not found");
			return;
		}
		await food_listing.update({
			status: FoodStatus.CLAIMED,
			posted_quantity: 0.01,
			weight_per_unit: 0.01,
		});

		responseUtils.sendSuccessResponse(
			res,
			undefined,
			undefined,
			"Successfully removed donation"
		);
	} catch (error) {
		console.error("Could not delete donation:", error);
		responseUtils.sendErrorResponse(res);
	}
};
