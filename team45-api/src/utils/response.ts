import { Response } from "express";
import { ValidationError } from "class-validator";

// ========================
// === Type Definitions ===
// ========================

interface ApiResponse<T = any> {
	status: "success" | "error";
	message: string;
	data?: T;
	meta?: {
		timestamp: string;
		[key: string]: string; // metadata (e.g., paginations)
	};
}

/** Validation error format */
interface ValidationErrorItem {
	property: string;
	value?: any;
	constraints: Record<any, any>;
	children?: ValidationErrorItem[];
}

class ResponseUtils {
	// === Success Response ===

	/**
	 * Standardized success response.
	 */

	sendSuccessResponse<T>(
		res: Response,
		status_code: number = 200,
		data?: T,
		message: string = "success",
		meta?: Record<any, any>
	) {
		const response: ApiResponse<T> = {
			status: "success",
			message,
			meta: {
				timestamp: new Date().toISOString(),
				...meta,
			},
			data,
		};

		res.status(status_code).json(response);
	}

	setPaginatedResponse<T>(
		res: Response,
		data: T[],
		pagination: {
			page: number;
			limit: number;
			total: number;
		},
		message: string = "Data retrieved successfully"
	) {
		const totalPages = Math.ceil(pagination.total / pagination.limit);

		this.sendSuccessResponse(res, undefined, data, message, {
			pagination: {
				...pagination,
				totalPages,
				hasNextPage: pagination.page < totalPages,
				hasPrevPage: pagination.page > 1,
			},
		});
	}

	// === Error Response ===

	/**
	 * Standardized error response.
	 */
	sendErrorResponse(
		res: Response,
		status_code: number = 500,
		message: string = "An internal server error occured",
		errorDetails?: any
	) {
		const response: ApiResponse = {
			status: "error",
			message,
			...(errorDetails && { data: { error: errorDetails } }),
			meta: {
				timestamp: new Date().toISOString(),
			},
		};
		res.status(status_code).json(response);
	}

	/**
	 * Send a validation error response (for class-validator)
	 */
	sendValidationErrorResponse(
		res: Response,
		errors: ValidationError[],
		message: string = "Validation Error"
	) {
		const response: ApiResponse = {
			status: "error",
			message,
			data: {
				errors: this.formatValidationError(errors),
			},
			meta: {
				timestamp: new Date().toISOString(),
			},
		};

		res.status(400).json(response);
	}

	private formatValidationError(
		errors: ValidationError[]
	): ValidationErrorItem[] {
		return errors.map((error) => {
			const formattedError: any = {
				property: error.property,
				constraints: error.constraints || {},
			};

			if (error.children && error.children.length > 0) {
				formattedError.children = this.formatValidationError(
					error.children
				);
			}
			return formattedError;
		});
	}
}

export const responseUtils = new ResponseUtils();
