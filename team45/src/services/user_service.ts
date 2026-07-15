import { apiClient } from "./api";
import type { Address } from "./maps";

export interface User {
	id: string;
	name: string;
	email: string;
	password: string;
	role: "donor" | "volunteer" | "receiver" | null;
	user_type: any;
}

interface loginResponse {
	token: string;
	user: User;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface ApiResponse<T = any> {
	status: "success" | "error";
	message: string;
	data?: T;
	meta?: {
		timestamp: string;
		[key: string]: string; // metadata (e.g., paginations)
	};
}
class UserApi {
	async getUsers(): Promise<ApiResponse<User[]>> {
		try {
			const response = await apiClient.get("/api/users");
			if (!response.data || !Array.isArray(response.data)) {
				return {
					data: [],
					message: "No users found",
					status: "error",
				};
			}

			if (response.data.length === 0) {
				return {
					data: [],
					message: "No users available",
					status: "error",
				};
			}

			return {
				data: response.data,
				message: "Success",
				status: "success",
			};
		} catch (error) {
			return {
				message: `Error occurred: ${error}`,
				status: "error",
			};
		}
	}

	async login(credentials: LoginCredentials): Promise<ApiResponse<any>> {
		try {
			const response = await apiClient.post<ApiResponse<loginResponse>>(
				"/api/auth/login",
				credentials
			);
			if (response.status === 200) {
				const data = response.data;

				return {
					data: data,
					message: "Success",
					status: "success",
				};
			} else if (response.status === 404) {
				return {
					message: "Incorrect Credentials",
					status: "error",
				};
			}

			return {
				message: response.data.message,
				status: "error",
			};
		} catch (error) {
			return {
				message: `Error occurred: ${error}`,
				status: "error",
			};
		}
	}

	async register(userData: User): Promise<ApiResponse<null>> {
		try {
			const reqData = {
				...userData,
				password_hash: userData.password,
			};
			const response = await apiClient.post(
				"/api/auth/register",
				reqData
			);
			const data = response.data;
			if (response.status === 201) {
				return {
					message: "Successful",
					status: "success",
				};
			}

			return {
				message: data.message,
				status: "error",
			};
		} catch (error) {
			return {
				message: "Sign up unsuccesful",
				status: "error",
			};
		}
	}

	async addAddress(address: Address): Promise<ApiResponse> {
		try {
			const response = await apiClient.post<ApiResponse>(
				"/api/users/address",
				address
			);

			if (response.data.status === "success") {
				return {
					status: "success",
					message: response.data.message,
					data: response.data.data,
				};
			}

			return {
				message: response.data.message,
				data: response.data.data,
				meta: response.data.meta,
				status: "error",
			};
		} catch (error) {
			return {
				message: "There was an error adding your address",
				status: "error",
				data: error,
			};
		}
	}

	async getUserAddress(id: string): Promise<ApiResponse> {
		try {
			const response = await apiClient.get<ApiResponse<Address>>(
				`/api/users/address/${id}`
			);
			if (response.data.status === "success") {
				return {
					status: "success",
					message: response.data.message,
					data: response.data.data,
				};
			}
			return {
				message: response.data.message,
				status: "error",
				data: response.data.data,
			};
		} catch (error) {
			return {
				status: "error",
				message: "Error fetching address",
				data: error,
			};
		}
	}
}

export const userApi = new UserApi();
