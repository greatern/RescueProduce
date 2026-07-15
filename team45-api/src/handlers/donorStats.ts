import { Request, Response } from "express";
import { Donor } from "../models/donor";
import { User } from "../models/user";
import { FoodListing } from "../models/food_listing";
import { Claim } from "../models/claim";
import { Task } from "../models/task";
import { Address } from "../models/address";
import { Receiver } from "../models/receiver";
import { responseUtils } from "../utils/response";
import { Op } from "sequelize";

// Get donor statistics for dashboard
export const getDonorStats = async (req: Request, res: Response) => {
	try {
		const donorId = req.params.donorId;

		// Get total donations count and weight
		const donations = await FoodListing.findAll({
			where: { donor_id: donorId },
			attributes: [
				"posted_quantity",
				"quantity_type",
				"available_quantity",
				"status",
				"weight_per_unit",
			],
		});

		// Calculate stats using correct field names
		const totalKgDonated = donations.reduce((total, donation) => {
			// Use weight_per_unit * posted_quantity to get total kg
			const kg = donation.weight_per_unit * donation.posted_quantity;
			return total + kg;
		}, 0);

		const totalMealsProvided = Math.floor(totalKgDonated / 0.5); // 0.5kg per meal estimate
		const totalCarbonSaved = totalKgDonated * 0.5; // 0.5kg CO2 per kg food

		// Count unique NGOs (this would need a proper relationship in real implementation)
		const totalNGOsSupported = Math.min(
			Math.floor(donations.length / 2),
			15
		); // estimate

		const totalValue = donations.reduce((total, donation) => {
			return (
				total + donation.weight_per_unit * donation.posted_quantity * 15
			); // R15 per kg estimate
		}, 0);

		const utilizationRate =
			donations.length > 0
				? (donations.filter(
						(d) => d.available_quantity < d.posted_quantity
				  ).length /
						donations.length) *
				  100
				: 0;

		return responseUtils.sendSuccessResponse(res, 200, {
			totalKgDonated: Math.round(totalKgDonated),
			totalMealsProvided,
			totalCarbonSaved: Math.round(totalCarbonSaved),
			totalNGOsSupported,
			totalValue: Math.round(totalValue),
			utilizationRate: Math.round(utilizationRate),
		});
	} catch (error) {
		console.error("Error fetching donor stats:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to fetch donor statistics",
			error
		);
	}
};

// Get donation history with filters and pagination
export const getDonationHistory = async (req: Request, res: Response) => {
	try {
		const donorId = req.params.donorId;
		const { status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

		const offset =
			(parseInt(page as string) - 1) * parseInt(limit as string);

		const whereClause: any = { donor_id: donorId };

		if (status && status !== "all") {
			whereClause.status = status;
		}

		if (dateFrom || dateTo) {
			whereClause.created_at = {};
			if (dateFrom) {
				whereClause.created_at[Op.gte] = new Date(dateFrom as string);
			}
			if (dateTo) {
				whereClause.created_at[Op.lte] = new Date(dateTo as string);
			}
		}

		const { count, rows: donations } = await FoodListing.findAndCountAll({
			where: whereClause,
			include: [
				{
					model: Claim,
					as: "claims",
					required: false,
					include: [
						{
							model: Receiver,
							as: "receiver",
							include: [
								{
									model: User,
									as: "user",
									attributes: ["name"],
								},
							],
						},
					],
				},
			],
			order: [["created_at", "DESC"]],
			limit: parseInt(limit as string),
			offset,
		});

		// Format the response
		const formattedDonations = donations.map((donation) => ({
			...donation.toJSON(),
			recipient_name: donation.claims?.[0]?.receiver?.user?.name || null,
			estimated_value:
				donation.weight_per_unit * donation.posted_quantity * 15, // R15 per kg estimate
			estimated_meals: Math.floor(
				(donation.weight_per_unit * donation.posted_quantity) / 0.5
			),
			estimated_carbon_saved:
				donation.weight_per_unit * donation.posted_quantity * 0.5,
			// Use the actual quantity fields from your model
			quantity: donation.posted_quantity,
			quantity_unit: donation.quantity_type,
			// Map status to match frontend expectations
			status:
				donation.available_quantity === 0
					? "completed"
					: donation.available_quantity < donation.posted_quantity
					? "claimed"
					: new Date(donation.expiry) < new Date()
					? "expired"
					: "active",
		}));

		const totalPages = Math.ceil(count / parseInt(limit as string));

		return responseUtils.sendSuccessResponse(res, 200, {
			donations: formattedDonations,
			total: count,
			page: parseInt(page as string),
			totalPages,
		});
	} catch (error) {
		console.error("Error fetching donation history:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to fetch donation history",
			error
		);
	}
};

// Get active donations for dashboard
export const getActiveDonations = async (req: Request, res: Response) => {
	try {
		const donorId = req.params.donorId;

		const activeDonations = await FoodListing.findAll({
			where: {
				donor_id: donorId,
				available_quantity: { [Op.gt]: 0 },
				expiry: { [Op.gt]: new Date() },
			},
			order: [["created_at", "DESC"]],
			limit: 5,
		});

		const formattedDonations = activeDonations.map((donation) => ({
			...donation.toJSON(),
			status: "active",
			quantity: donation.posted_quantity,
			quantity_unit: donation.quantity_type,
		}));

		return responseUtils.sendSuccessResponse(res, 200, formattedDonations);
	} catch (error) {
		console.error("Error fetching active donations:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to fetch active donations",
			error
		);
	}
};

// Get impact data for reports
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
			// 'all' means no date filter
		}

		const donations = await FoodListing.findAll({
			where: {
				donor_id: donorId,
				...dateFilter,
			},
		});

		// Calculate impact metrics using correct field names
		const totalWeight = donations.reduce(
			(sum, d) => sum + d.weight_per_unit * d.posted_quantity,
			0
		);
		const carbonSaved = Math.round(totalWeight * 0.5);
		const mealsProvided = Math.floor(totalWeight / 0.5);
		const wasteReduced = totalWeight;
		const ngoCount = Math.min(Math.floor(donations.length / 2), 15);

		// Generate monthly trends (simplified)
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

			monthlyTrends.push({
				month: monthDate.toLocaleDateString("en-US", {
					month: "short",
					year: "numeric",
				}),
				donations: monthDonations.length,
				impact: Math.round(
					monthDonations.reduce(
						(sum, d) => sum + d.weight_per_unit * d.posted_quantity,
						0
					) * 2
				), // impact points
			});
		}

		return responseUtils.sendSuccessResponse(res, 200, {
			carbonSaved,
			mealsProvided,
			wasteReduced: Math.round(wasteReduced),
			ngoCount,
			monthlyTrends,
		});
	} catch (error) {
		console.error("Error fetching impact data:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to fetch impact data",
			error
		);
	}
};

// Get donation analytics
export const getDonationAnalytics = async (req: Request, res: Response) => {
	try {
		const donorId = req.params.donorId;
		const { period = "year" } = req.query;

		// Similar date filtering as impact data
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

		// Generate donation trends (daily for month, weekly for year)
		const donationTrends = [];
		const categoryBreakdown = new Map();

		donations.forEach((donation) => {
			// Category breakdown
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

		// Convert category breakdown to array with percentages
		const totalDonations = donations.length;
		const categoryArray = Array.from(categoryBreakdown.entries()).map(
			([category, count]) => ({
				category,
				count,
				percentage:
					totalDonations > 0 ? (count / totalDonations) * 100 : 0,
			})
		);

		// Generate trends (simplified - just last 7 days/weeks)
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);

			const dayDonations = donations.filter((d) => {
				const donationDate = new Date(d.created_at);
				return donationDate.toDateString() === date.toDateString();
			});

			donationTrends.push({
				date: date.toISOString().split("T")[0],
				count: dayDonations.length,
				volume: dayDonations.reduce(
					(sum, d) => sum + d.weight_per_unit * d.posted_quantity,
					0
				),
			});
		}

		// Impact metrics with trends (simplified)
		const impactMetrics = [
			{
				metric: "total_donations",
				value: donations.length,
				trend: Math.random() * 20 - 5, // Random trend for demo
			},
			{
				metric: "total_weight",
				value: donations.reduce(
					(sum, d) => sum + d.weight_per_unit * d.posted_quantity,
					0
				),
				trend: Math.random() * 25 - 10,
			},
			{
				metric: "utilization_rate",
				value:
					donations.length > 0
						? (donations.filter(
								(d) => d.available_quantity < d.posted_quantity
						  ).length /
								donations.length) *
						  100
						: 0,
				trend: Math.random() * 15 - 5,
			},
		];

		return responseUtils.sendSuccessResponse(res, 200, {
			donationTrends,
			categoryBreakdown: categoryArray,
			impactMetrics,
		});
	} catch (error) {
		console.error("Error fetching analytics:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to fetch analytics",
			error
		);
	}
};

// Get tax records
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

		// Group by year and quarter
		const taxRecords: any[] = [];
		const yearlyData = new Map();

		donations.forEach((donation) => {
			const date = new Date(donation.created_at);
			const donationYear = date.getFullYear();
			const quarter = Math.floor(date.getMonth() / 3) + 1;
			const value =
				donation.weight_per_unit * donation.posted_quantity * 15; // R15 per kg estimate

			// Yearly totals
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

			// Quarterly totals
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

		// Convert to array format
		yearlyData.forEach((yearData: any) => {
			// Add annual record
			taxRecords.push({
				year: yearData.year,
				totalValue: Math.round(yearData.totalValue),
				estimatedDeduction: Math.round(yearData.totalValue * 0.3), // 30% deductible estimate
				potentialSavings: Math.round(yearData.totalValue * 0.3 * 0.28), // 28% tax rate
				donationCount: yearData.donationCount,
			});

			// Add quarterly records
			yearData.quarters.forEach((quarterData: any) => {
				taxRecords.push({
					year: quarterData.year,
					quarter: quarterData.quarter,
					totalValue: Math.round(quarterData.totalValue),
					estimatedDeduction: Math.round(
						quarterData.totalValue * 0.3
					),
					potentialSavings: Math.round(
						quarterData.totalValue * 0.3 * 0.28
					),
					donationCount: quarterData.donationCount,
				});
			});
		});

		return responseUtils.sendSuccessResponse(res, 200, taxRecords);
	} catch (error) {
		console.error("Error fetching tax records:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to fetch tax records",
			error
		);
	}
};

// Generate tax certificate (mock implementation)
export const generateTaxCertificate = async (req: Request, res: Response) => {
	try {
		const donorId = req.params.donorId;
		const { year } = req.params;
		const { quarter } = req.query;

		// In a real implementation, this would generate a PDF certificate
		// For now, we'll return a mock download URL
		const filename = quarter
			? `tax-certificate-${year}-Q${quarter}-${donorId}.pdf`
			: `tax-certificate-${year}-${donorId}.pdf`;

		// Mock URL - in reality this would be a generated PDF stored in cloud storage
		const downloadUrl = `/api/downloads/tax-certificates/${filename}`;

		return responseUtils.sendSuccessResponse(res, 200, {
			downloadUrl,
			filename,
			generatedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error generating tax certificate:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to generate tax certificate",
			error
		);
	}
};
