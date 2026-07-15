import { Request, Response } from "express";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import { responseUtils } from "../utils/response";
import { PasswordUtils } from "../utils/password";

export const login = async (req: Request, res: Response) => {
	try {
		const auth: { email: string; password: string } = req.body;
		console.log(auth);

		const user = await User.findOne({
			where: {
				email: auth.email,
			},
		});

		if (!user) {
			responseUtils.sendErrorResponse(
				res,
				404,
				"Invalid Credentials, please try again"
			);
			return;
		}

		const isPasswordValid = await PasswordUtils.verifyPassword(
			auth.password,
			user.password_hash
		);

		if (isPasswordValid === false) {
			responseUtils.sendErrorResponse(
				res,
				404,
				"Invalid Credentials, please try again"
			);
			return;
		}

		user.last_active = new Date(Date.now());
		await user.save();

		const token = jwt.sign(
			{
				id: user.id,
				role: user.user_type,
			},
			process.env.JWT_SECRET as string,
			{ expiresIn: "5h" }
		);
		let associated: any;
		try {
			associated = await user.$get(user.user_type);
		} catch (error) {
			console.error("Error", error);
			associated = null;
		}
		const data = {
			token: token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				role: user.user_type,
				user_type: associated,
			},
		};
		responseUtils.sendSuccessResponse(res, undefined, data);
	} catch (error) {
		responseUtils.sendErrorResponse(res, undefined, undefined, error);
	}
};
