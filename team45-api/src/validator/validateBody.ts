import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { responseUtils } from "../utils/response";

export function validateBody<T extends object>(dtoClass: new () => T) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			console.log("Body being validated", req.body);

			const dtoInstance = plainToInstance(dtoClass, req.body);
			const errors = await validate(dtoInstance, {
				whitelist: true,
				forbidNonWhitelisted: true,
				skipMissingProperties: false,
			});

			if (errors.length > 0) {
				console.log("Errors", errors);

				responseUtils.sendErrorResponse(
					res,
					undefined,
					"Error validating dto body",
					errors
				);
				req.body = dtoInstance;
				return;
			}
			next();
		} catch (error) {
			console.error("Validation Error", error);
			res.status(500).json({
				status: "error",
				message: "Internal server error during validation",
			});
			return;
		}
	};
}
