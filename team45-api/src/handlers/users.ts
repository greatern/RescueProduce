import { Request, Response } from "express";
import { User } from "../models/user";
import { Donor } from "../models/donor";
import { Receiver } from "../models/receiver";
import { Volunteer } from "../models/volunteer";
import { Address } from "../models/address";
import { sequelize } from "../config/sequelize";
import { responseUtils } from "../utils/response";
import { PasswordUtils } from "../utils/password";
import { Op, ValidationError } from "sequelize";
import { ErrorResponse } from "../validator/validationErrorResponse";
import { AddressDto } from "../dtos/addressDto";
import { UserAvailability } from "../models/user_availability";
import Expo from "expo-server-sdk";
import { mapUtils } from "../utils/maps";
import { Proximity } from "../models/proximity";

const TYPE = {
	DONOR: "donor",
	RECEIVER: "receiver",
	VOLUNTEER: "volunteer",
};

interface UpdateProfileDto {
	name?: string;
	first_name?: string;
	last_name?: string;
	phone?: string;
	phone_number?: string;
	email?: string;
	address?: {
		address_line1: string;
		address_line2?: string;
		city: string;
		state_province: string;
		postal_code: string;
		country: string;
		latitude?: number;
		longitude?: number;
	};
}

export const registerUser = async (req: Request, res: Response) => {
	const transaction = await sequelize.transaction();
	try {
		console.log(req.body);

		const { email, name, password, role, user_type } = req.body;
		const exits = await User.findOne({
			where: { email: email },
			attributes: ["id"],
			transaction,
		});
		if (exits) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"A users with this email already exits"
			);
			transaction.rollback();
			return;
		}

		const hashedPassword = await PasswordUtils.hashPassword(password);

		const newUser = await User.create(
			{
				name: name,
				email: email,
				password_hash: hashedPassword,
				user_type: role,
			},
			{ transaction }
		);
		console.log("2: ", newUser);

		let userType: Donor | Receiver | Volunteer | null = null;
		switch (newUser.user_type) {
			case TYPE.DONOR:
				userType = await Donor.create(
					{
						id: newUser.id,
						tax_number: user_type.tax_number,
						health_certification_url:
							user_type.health_certification_url,
					},
					{ transaction }
				);
				console.log("donor");
				break;
			case TYPE.RECEIVER:
				userType = await Receiver.create(
					{
						id: newUser.id,
						registration_number: user_type.registration_number,
						storage_capacity: user_type.storage_capacity,
					},
					{ transaction }
				);
				console.log("receiver");
				break;
			case TYPE.VOLUNTEER:
				userType = await Volunteer.create(
					{
						id: newUser.id,
						license_number: user_type.license_number,
						license_expiry_date: user_type.license_expiry_date,
					},
					{ transaction }
				);
				console.log("volunteer");
				break;
			default:
				userType = null;
				transaction.rollback();
				responseUtils.sendErrorResponse(
					res,
					undefined,
					"You don't have a valid user role somehow"
				);
		}

		transaction.commit();
		responseUtils.sendSuccessResponse(res, 201);
	} catch (error) {
		transaction.rollback();
		if (error instanceof ValidationError) {
			const message = error.errors.map((err) => ({
				property: err.path,
				message: err.message,
				type: err.type,
			}));
			responseUtils.sendErrorResponse(
				res,
				400,
				"Please ensure your request is formarted properly",
				message
			);
			console.log(message);
		} else {
			console.error("Error: ", error);

			responseUtils.sendErrorResponse(
				res,
				500,
				"Server error occured",
				error
			);
		}
	}
};
export const getUsers = async (req: Request, res: Response) => {
	try {
		const users = await User.findAll({
			attributes: { exclude: ["password_hash"] },
		});
		if (users.length === 0) {
			responseUtils.sendErrorResponse(res, 404, "Users not found");
		}
		responseUtils.sendSuccessResponse(
			res,
			200,
			users,
			"Successfuly fetched users"
		);
	} catch (error) {
		if (error instanceof ValidationError) {
			ErrorResponse(res, error);
		} else {
			responseUtils.sendErrorResponse(
				res,
				500,
				"Internal Server Error",
				error
			);
		}
	}
};

export const addAdress = async (req: Request, res: Response) => {
	const transaction = await sequelize.transaction();
	try {
		const addressReq: AddressDto = req.body;
		console.log(addressReq);

		if (!addressReq.user_id) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"Please provide the user id"
			);
			return;
		}
		const id = addressReq.user_id;
		const userExists = await User.findOne({
			where: { id: id },
			attributes: ["id", "user_type"],
			transaction,
		});

		if (!userExists) {
			transaction.rollback();
			responseUtils.sendErrorResponse(res, 400, "User not found");
			return;
		}

		if (addressReq.country.trim().length <= 0) {
			addressReq.country = "South Africa";
		}

		const addy = {
			address_line1: addressReq.address_line1,
			address_line2: addressReq.address_line2,
			city: addressReq.city,
			province: addressReq.province,
			postal_code: addressReq.postal_code,
			country: addressReq.country,
			latitude: addressReq.latitude,
			longitude: addressReq.longitude,
			user_id: addressReq.user_id,
		};
		console.log(addy);

		const newAddress = await Address.create(addy, { transaction });

		responseUtils.sendSuccessResponse(res, 201, newAddress);
		await transaction.commit();

		const addresses = await Address.findAll({
			where: {
				user_id: { [Op.ne]: addressReq.user_id },
				province: addressReq.province,
			},
			include: [
				{
					model: User,
					attributes: ["id", "user_type"],
				},
			],
		});

		if (addresses.length > 0) {
			calculateProximities(newAddress, addresses, userExists);
		}
	} catch (error) {
		await transaction.rollback();
		console.error("Error creating address", error);
		responseUtils.sendErrorResponse(res);
	}
};

export const recalculateProximities = async (req: Request, res: Response) => {
	try {
		const { user_id } = req.params;

		const user = await User.findByPk(user_id);
		const userAddress = await Address.findOne({ where: { user_id } });

		if (!user || !userAddress) {
			return responseUtils.sendErrorResponse(
				res,
				404,
				"User or address not found"
			);
		}

		const otherAddresses = await Address.findAll({
			where: {
				user_id: { [Op.ne]: user_id },
				province: userAddress.province,
			},
			include: [{ model: User, attributes: ["id", "user_type"] }],
		});

		// Delete existing proximities for this user
		await Proximity.destroy({
			where: {
				[Op.or]: [{ user_a_id: user_id }, { user_b_id: user_id }],
			},
		});

		// Recalculate
		await calculateProximities(userAddress, otherAddresses, user);

		responseUtils.sendSuccessResponse(res, 200, "Proximities recalculated");
	} catch (error) {
		console.error("Error recalculating proximities:", error);
		responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to recalculate proximities"
		);
	}
};

const calculateProximities = async (
	address: Address,
	other_addresses: Address[],
	user: User
) => {
	try {
		console.log("Calculating proximities between users");

		const origin = {
			lat: address.latitude,
			lng: address.longitude,
		};

		for (const adrs of other_addresses) {
			try {
				const destination = {
					lat: adrs.latitude,
					lng: adrs.longitude,
				};

				const result = await mapUtils.calculateDistance(
					origin,
					destination
				);

				if (result) {
					await Proximity.create({
						user_a_id: user.id,
						user_b_id: address.user_id,
						user_a_type: user.user_type,
						user_b_type: address.user?.user_type,
						distance: mapUtils.metersToKm(result.distance),
						duration: mapUtils.secondsToMinutes(result.duration),
					});

					console.log(
						`Proximity calculated: ${mapUtils.metersToKm(
							result.distance
						)}km, ${mapUtils.secondsToMinutes(result.duration)}min`
					);
				}
			} catch (proximityError) {
				console.error(
					`Error calculating proximity for address ${address.id}:`,
					proximityError
				);
			}
		}
		console.log("Proximity calculations completed");
	} catch (error) {
		console.error("Error in calculateProximities:", error);
	}
};

export const updateProfile = async (req: Request, res: Response) => {
	const transaction = await sequelize.transaction();

	try {
		const user_id = req.params.user_id;
		const updateData: UpdateProfileDto = req.body;

		console.log("Updating profile for user:", user_id);
		console.log("Update data:", updateData);

		// Find user first
		const user = await User.findByPk(user_id, { transaction });
		if (!user) {
			await transaction.rollback();
			return responseUtils.sendErrorResponse(res, 404, "User not found");
		}

		// Update user data if provided
		const userUpdateData: any = {};
		if (updateData.first_name || updateData.name) {
			userUpdateData.name = updateData.first_name || updateData.name;
		}
		if (updateData.phone_number || updateData.phone) {
			userUpdateData.phone = updateData.phone_number || updateData.phone;
		}
		if (updateData.email) {
			userUpdateData.email = updateData.email;
		}

		if (Object.keys(userUpdateData).length > 0) {
			await user.update(userUpdateData, { transaction });
			console.log("Updated user data:", userUpdateData);
		}

		// SIMPLE ADDRESS HANDLING - Create new address with user_id
		if (updateData.address) {
			console.log("Processing address update:", updateData.address);

			// Check if user already has an address with direct user_id
			let existingAddress = await Address.findOne({
				where: { user_id: user_id },
				transaction,
			});

			const addressData = {
				address_line1: updateData.address.address_line1,
				address_line2: updateData.address.address_line2 || "",
				city: updateData.address.city,
				province: updateData.address.state_province,
				postal_code: updateData.address.postal_code,
				country: updateData.address.country || "South Africa",
				latitude: updateData.address.latitude || 0,
				longitude: updateData.address.longitude || 0,
				user_id: user_id, // Direct link
			};

			if (existingAddress) {
				// Update existing address
				await existingAddress.update(addressData, { transaction });
				console.log("Updated existing address");
			} else {
				// Create new address
				const newAddress = await Address.create(addressData, {
					transaction,
				});
				console.log("Created new address:", newAddress.id);
			}
		}

		await transaction.commit();

		return responseUtils.sendSuccessResponse(res, 200, {
			message: "Profile updated successfully",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				phone: user.phone,
			},
		});

		//await UserAddress.create(bridge, { transaction });
		await transaction.commit();
		console.log("Success?");

		//responseUtils.sendSuccessResponse(res, 201, newAddress);
		return;
	} catch (error) {
		await transaction.rollback();
		console.error("Profile update error:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to update profile",
			error
		);
	}
};

export const getUserAddress = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		if (!id || id.trim().length == 0) {
			responseUtils.sendErrorResponse(res, 400, "Please provide user id");
			return;
		}

		const user_address = await Address.findOne({
			where: { user_id: id },
		});

		if (!user_address) {
			console.log("No address");

			responseUtils.sendErrorResponse(
				res,
				404,
				"User has no associated address"
			);
			return;
		}

		responseUtils.sendSuccessResponse(res, 200, user_address);
	} catch (error) {
		console.error("Error fetching address", error);
		responseUtils.sendErrorResponse(
			res,
			undefined,
			"Could not find address",
			error
		);
	}
};

export const getUserProfile = async (req: Request, res: Response) => {
	try {
		const user_id = req.params.user_id;

		// Find user
		const user = await User.findByPk(user_id, {
			attributes: { exclude: ["password_hash"] },
		});

		if (!user) {
			return responseUtils.sendErrorResponse(res, 404, "User not found");
		}

		// Try to get address using direct link
		let address = await Address.findOne({
			where: { user_id: user_id },
		});

		return responseUtils.sendSuccessResponse(res, 200, {
			user: {
				...user.toJSON(),
				address: address || null,
			},
		});
	} catch (error) {
		console.error("Get profile error:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to get user profile",
			error
		);
	}
};

export const updateBackupStatus = async (req: Request, res: Response) => {
	try {
		const transaction = await sequelize.transaction();

		const { option, user_id, role } = req.body;
		const user = await User.findOne({
			where: { id: user_id },
			transaction,
		});
		if (!user) {
			responseUtils.sendErrorResponse(
				res,
				404,
				"User with provided id does not exist"
			);
			transaction.rollback();
			return;
		}

		switch (role) {
			case "volunteer":
				const volunteer = await Volunteer.findByPk(user.id, {
					transaction,
				});
				if (!volunteer) {
					responseUtils.sendErrorResponse(
						res,
						404,
						"Volunteer not found"
					);
					return;
				}
				await volunteer.update(
					{
						is_backup: option === "opt_in" ? true : false,
					},
					{ transaction }
				);
				break;
			case "receiver":
				const receiver = await Receiver.findByPk(user.id, {
					transaction,
				});
				if (!receiver) {
					responseUtils.sendErrorResponse(
						res,
						404,
						"Receiver not found"
					);
					return;
				}
				await receiver.update(
					{
						is_backup: option === "opt_in" ? true : false,
					},
					{ transaction }
				);
				break;
			default:
				await transaction.rollback();
				responseUtils.sendErrorResponse(res, 400, "Invalid role given");
				return;
		}
		await transaction.commit();
		responseUtils.sendSuccessResponse(
			res,
			200,
			undefined,
			"Backup status updated successfully"
		);
	} catch (error) {
		console.error("Error updating backup status: ", error);
		responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to update status",
			error
		);
	}
};

export const registerPushToken = async (req: Request, res: Response) => {
	try {
		const { user_id, token } = req.body;
		const payload = req.body;

		if (!user_id || !token) {
			responseUtils.sendErrorResponse(
				res,
				400,
				"User Id and push token are required"
			);
			return;
		}

		if (!Expo.isExpoPushToken(token)) {
			responseUtils.sendErrorResponse(res, 400, "Invalid push token");
			return;
		}

		const user = await User.findByPk(user_id);
		if (!user) {
			responseUtils.sendErrorResponse(
				res,
				404,
				`User ${user_id} not found`
			);
			return;
		}
		await user.update({ expo_push_token: token });
		responseUtils.sendSuccessResponse(
			res,
			undefined,
			undefined,
			"Push token registered successfully"
		);
	} catch (error) {
		console.error("Error registering push token:", error);
		responseUtils.sendErrorResponse(
			res,
			undefined,
			"Failed to register push token",
			error
		);
	}
};

export const unregisterPushToken = async (req: Request, res: Response) => {
	try {
		const { user_id } = req.params;
		const user = await User.findByPk(user_id);

		if (!user) {
			responseUtils.sendErrorResponse(res, 404, "User not found");
			return;
		}
		await user.update({ expo_push_token: null });
		responseUtils.sendSuccessResponse(
			res,
			undefined,
			undefined,
			"Push token unregistered successfully"
		);
	} catch (error) {
		console.error("Error unregistering push token:", error);
		return responseUtils.sendErrorResponse(
			res,
			500,
			"Failed to unregister push token",
			error
		);
	}
};
