import { apiClient, type ApiResponse } from "./api";

export class DonorApi {
	async getDashboard(id: string): Promise<ApiResponse<any>> {
		try {
			const response = await apiClient.get<ApiResponse<any>>(
				`/api/donors/dashboard/${id}`
			);

			if (response.status === 200) {
				return {
					status: "success",
					message: response.data.message,
					data: response.data,
				};
			}
			return {
				status: "error",
				message: response.data.message,
			};
		} catch (error) {
			return {
				status: "error",
				message: "Error fetching dashboard",
				data: error,
			};
		}
	}

	async getDonationHistory(id: string): Promise<ApiResponse<any>> {
		try {
			const response = await apiClient.get<ApiResponse<any>>(
				`/api/donors/${id}/donations`
			);

			if (response.status === 200) {
				return {
					status: "success",
					message: response.data.status,
					data: response.data.data,
				};
			}
			return {
				status: "error",
				message: "",
			};
		} catch (error) {
			return {
				status: "error",
				message: "Error fetching donation history",
				data: error,
			};
		}
	}

	async getActiveDonations(id: string): Promise<ApiResponse> {
		try {
			const response = await apiClient.get<ApiResponse<any>>(
				`/api/donors/${id}/donations/active`
			);

			if (response.status === 200) {
				return {
					status: "success",
					message: response.data.status,
					data: response.data.data,
				};
			}
			return {
				status: "error",
				message: response.data.message,
			};
		} catch (error) {
			throw {
				status: "error",
				message: "Error fetching donation history",
				data: error,
			};
		}
	}

	async getActiveTasks(id: string): Promise<ApiResponse<any>> {
		try {
			const response = await apiClient.get<ApiResponse<any>>(
				`/api/donors/pickups/${id}`
			);
			if (response.status === 200) {
				return {
					status: "success",
					message: response.data.message,
					data: response.data.data,
				};
			}
			console.log("Id", id);
			return {
				status: "error",
				message: response.data.message,
			};
		} catch (error) {
			console.error("Error", error);
			return {
				status: "error",
				message: "Error fetching active tasks",
				data: error,
			};
		}
	}

	async deleteDonation(id: string): Promise<ApiResponse> {
		try {
			const response = await apiClient.delete<ApiResponse>(
				`/api/donors/donation/${id}`
			);

			if (response.status === 200 || response.status === 204) {
				return {
					message: response.data.message,
					status: "success",
				};
			}

			return {
				message: response.data.message,
				status: "error",
			};
		} catch (error) {
			console.error("Error deleting donation:", error);
			return {
				message: `Error deleting donation: ${error}`,
				status: "error",
			};
		}
	}
}

export const donorApi = new DonorApi();
