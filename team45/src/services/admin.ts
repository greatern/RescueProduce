import type { Donation, Task } from "../components/donor/missedTable";
import { apiClient, type ApiResponse } from "./api";

class AdminApi {
	async getMissedTasks(): Promise<ApiResponse<any>> {
		try {
			const response = await apiClient.get<ApiResponse<Task[]>>(
				`/api/admin/missed_tasks`
			);

			if (response.status === 200) {
				const data = response.data;
				return {
					status: "success",
					message: data.message,
					data: data.data,
				};
			}

			return {
				status: "error",
				message: response.data.message,
			};
		} catch (error) {
			return {
				status: "error",
				message: "Error fetching missed tasks",
			};
		}
	}

	async getCancelledTasks(
		type: "pickup" | "delivery"
	): Promise<ApiResponse<any>> {
		try {
			const response = await apiClient.get<ApiResponse<any>>(
				`/api/admins/cancelled_tasks/${type}`
			);
			if (response.status === 200) {
				const data = response.data;
				return {
					status: "success",
					message: data.message,
					data: data.data,
				};
			}
			return {
				status: "error",
				message: response.data.message,
			};
		} catch (error) {
			return {
				status: "error",
				message: "Error fetching cancelled tasks",
			};
		}
	}

	async getUnclaimedFood(): Promise<ApiResponse<any>> {
		try {
			const response = await apiClient.get<ApiResponse<Donation[]>>(
				"/api/admin/unclaimed"
			);
			if (response.status === 200) {
				const unclaimedResponse = response.data;
				return {
					status: "success",
					message: unclaimedResponse.message,
					data: unclaimedResponse.data,
				};
			}
			return {
				status: "error",
				message: response.data.message,
			};
		} catch (error) {
			return {
				status: "error",
				message: "Error fetching missed tasks",
			};
		}
	}

	async reassign() {}
}

export const adminApi = new AdminApi();
