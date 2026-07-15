import { Request, Response } from "express";
import { FoodListing } from "../models/food_listing";
import { Op } from "sequelize";
import { Donor } from "../models/donor";
import { Claim } from "../models/claim";

export const claims = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const claims = await Claim.findAll({
			where: { receiver_id: id },
		});
		res.status(200).json(claims);
	} catch (error) {
		res.status(500).json({
			message: error,
		});
	}
};

export const foodlistings = async (req: Request, res: Response) => {
	try {
		const listings = await FoodListing.findAll({
			where: {
				status: "available",
				expiry: { [Op.gte]: new Date() },
			},
			include: [
				{
					model: Donor,
					as: "donor",
					attributes: ["id", "name"],
				},
			],
		});

		if (listings.length <= 0) {
			res.status(404).json({
				message: "No foodlistings available",
			});
			return;
		}

		res.status(200).json(listings);
	} catch (error) {
		res.status(400).json({
			message: "Error fetching food listings",
			error: error,
		});
	}
};
