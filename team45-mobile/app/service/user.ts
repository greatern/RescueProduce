import AsyncStorage from "@react-native-async-storage/async-storage";
import { Address } from "../App/screens/profile/AddressScreen";
import apiClient from "./api";

export interface User {
	id?: string;
	name: string;
	email: string;
	password: string;
	role: "donor" | "volunteer" | "receiver" | null;
	is_backup: boolean;
	address?: Address;
	user_type: any;
	expo_push_token: string | null;
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
		[key: string]: string;
	};
}
class UserApi {
	async getUsers(): Promise<ApiResponse<User[]>> {
		try {
			const response = await apiClient.get<ApiResponse<User[]>>(
				"api/users/"
			);
			if (response.status === 404) {
				return {
					message: "Users not found",
					status: "error",
				};
			} else if (response.status !== 200) {
				return {
					message: "Error while fetching users",
					status: "error",
				};
			}

			return {
				message: "Users found",
				status: "success",
				data: response.data.data,
			};
		} catch (error) {
			return {
				message: `Error occurred: ${error}`,
				status: "error",
			};
		}
	}

	async login(
		credentials: LoginCredentials
	): Promise<ApiResponse<loginResponse>> {
		try {
			const response = await apiClient.post(
				"api/auth/login",
				credentials
			);

			if (response.status === 200) {
				return {
					status: "success",
					message: "Login Successful",
					data: response.data.data,
				};
			} else if (response.status === 404) {
				return {
					message: "Incorrect Credentials",
					status: "error",
				};
			}

			return {
				message: response.data,
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
			const response = await apiClient.post("api/auth/register", reqData);

			if (response.status === 201) {
				return {
					message: "Successful",
					status: "success",
				};
			}

			return {
				message: response.data,
				status: "error",
			};
		} catch (error) {
			return {
				message: "There was an error signing up.",
				status: "error",
			};
		}
	}

	async addAddress(addy: Address): Promise<ApiResponse<any>> {
		try {
			console.log("Address body: ", addy);

			const response = await apiClient.post<ApiResponse<any>>(
				"api/users/address",
				addy
			);

			return {
				status: "success",
				message: response.data.message,
				data: response.data.data,
			};
		} catch (error) {
			console.log("What?");

			throw new Error("Error adding address", { cause: error });
		}
	}

	async getAddress(id: string): Promise<ApiResponse<any>> {
		try {
			const response = await apiClient.get<ApiResponse<any>>(
				`api/users/address/${id}`
			);

			if (response.status === 200) {
				const ApiResponse = response.data;
				await AsyncStorage.setItem(
					"address_data",
					JSON.stringify(ApiResponse.data)
				);
				return {
					message: ApiResponse.message,
					status: ApiResponse.status,
					data: ApiResponse.data,
				};
			} else {
				return {
					message: "Could not get address",
					status: "error",
				};
			}
		} catch (error) {
			console.error("Error fetching user address");
			return {
				message: "Could not fetch user address",
				status: "error",
				data: error,
			};
		}
	}

	async updateProfile(
		userId: string,
		updateData: any
	): Promise<ApiResponse<any>> {
		try {
			const response = await apiClient.put(
				`api/users/${userId}/profile`,
				updateData
			);

			if (response.status === 200) {
				return {
					status: "success",
					message: "Profile updated successfully",
					data: response.data,
				};
			}

			return {
				status: "error",
				message: "Failed to update profile",
			};
		} catch (error: any) {
			console.error("Profile update error:", error);
			return {
				status: "error",
				message:
					error.response?.data?.message || "Failed to update profile",
			};
		}
	}

	async updateBackupStatus(
		option: "opt_in" | "opt_out",
		user_id: string,
		role: string
	): Promise<ApiResponse<any>> {
		try {
			const response = await apiClient.post("api/users/backup", {
				option: option,
				user_id: user_id,
				role: role,
			});

			if (response.status === 200) {
				return {
					status: "success",
					message: "Successfully updated your backup status",
				};
			}

			return {
				status: "error",
				message: "Could not update status",
			};
		} catch (error) {
			return {
				status: "error",
				message: "Error updating backup status",
			};
		}
	}

	async testNotification(payload: any) {
		console.log("Test notification");

		const response = await apiClient.post(
			"api/notifications/test/single",
			payload
		);
		console.log("Response:", response.data);
	}
}

export const userApi = new UserApi();
