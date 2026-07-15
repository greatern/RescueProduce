import { Response } from "express";
import { ValidationError } from "sequelize";

export function ErrorResponse(res: Response, error: ValidationError): void {
	const message = error.errors.map((err) => ({
		propery: err.path,
		message: err.message,
		type: err.type,
	}));
	res.status(400).json(message);
	console.log(message);
}
