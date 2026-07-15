import { NextFunction, Request, Response } from "express";

export const logMessage =
	(message: string) => (req: Request, res: Response, next: NextFunction) => {
		console.log(`Hello from ${message}`);
		next();
	};
