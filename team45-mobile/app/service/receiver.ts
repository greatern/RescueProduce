import { Address } from "../App/screens/profile/AddressScreen";
import { Status } from "../constants/claim-statuses";
import apiClient from "./api";
import { ApiResponse, User } from "./user";

export interface Donation {
	id: string;
	donor_id: string;
	donor_name: string;
	title: string;
	food_category: string;
	description: string;
	available_quantity: number;
	weight_per_unit: number;
	expiry: Date;
	cutoff_pickup_date: Date;
	created_at: Date;
}

export interface Proximity {
	distance: number;
	duration: number;
}

export interface ProximityDonation {
	donation: Donation;
	donor: User;
	proximity: Proximity;
}

export enum PickupStatus {
	SCHEDULED = "scheduled",
	CONFIRMED = "confirmed",
	IN_PROGRESS = "in_progress",
	COMPLETED = "completed",
	MISSED = "missed",
	CANCELLED = "cancelled",
}

export interface Task {
	id: string;
	title: string;
	assigned_volunteer_id?: string;
	claimed_quantity: number;
	description: string;
	status: Status;
	task_type: string;
	due_date: Date;
	distance: number;
	claim_date: Date;
	can_cancel: boolean;
	latest_pickup_time?: string;
	pickup_location?: string;
	dropoff_location: string;
	updated_at: Date;
	pickup: Pickup;
}

export interface Pickup {
	id: string;
	task_id: string;
	pickup_status: PickupStatus;
}

interface ClaimData {
	listing_id: string;
	receiver_id: string;
	claimed_quantity: number;
	procurement_type: "delivery" | "pickup";
	distance: number;
}

export interface ClaimRequest {
	listing_id: string;
	receiver_id: string;
	claimed_quantity: number;
	procurement_type: "delivery" | "pickup";
}

class ReceiverApi {
	async getDonations(id: string): Promise<ApiResponse<Donation[]>> {
		try {
			const response = await apiClient.get<ApiResponse<Donation[]>>(
				`api/receivers/${id}/foodListings`
			);
			if (response.status === 200) {
				const ApiResponse = response.data;
				return {
					data: ApiResponse.data,
					status: "success",
					message: ApiResponse.message,
				};
			}

			return {
				status: "error",
				message: "Could not get donations",
			};
		} catch (error) {
			console.error("Error fetching donations:", error);
			throw new Error("Error fetching donations", { cause: error });
		}
	}

	async getClosestDonations(
		receiver_id: string,
		maximum: number = 25
	): Promise<ApiResponse<ProximityDonation[]>> {
		try {
			const response = await apiClient.get<
				ApiResponse<ProximityDonation[]>
			>(`api/receivers/closest-donations/${receiver_id}/${maximum}`);

			if (response.status !== 200) {
				return {
					status: "error",
					message: "Unexpected response status",
				};
			}

			return {
				message: response.data.message,
				status: response.data.status,
				data: response.data.data,
			};
		} catch (error) {
			throw {
				message: "Error getting donations within proximity",
				status: "error",
				data: error,
			};
		}
	}

	async claim(claim_data: ClaimData): Promise<ApiResponse<null>> {
		try {
			const response = await apiClient.post<ApiResponse<null>>(
				"api/receivers/claim",
				claim_data
			);
			if (response.status === 201) {
				return {
					status: "success",
					message: response.data.message,
				};
			}
			return {
				status: "error",
				message: response.data.message,
			};
		} catch (error) {
			return {
				status: "error",
				message: "Error claiming donation",
			};
		}
	}

	async getTasks(id: string): Promise<ApiResponse<Task[]>> {
		try {
			const response = await apiClient.get<ApiResponse<Task[]>>(
				`api/receivers/tasks/${id}`
			);
			if (response.status === 200) {
				console.log("tasks", response.data);

				return {
					status: "success",
					message: response.data.message,
					data: response.data.data,
				};
			} else if (response.status === 404) {
				return {
					status: "error",
					message: "No tasks were found",
					data: [],
				};
			}
			return {
				message: response.data.message,
				status: "error",
				data: response.data.data,
			};
		} catch (error) {
			console.error("Error fetching taks", error);

			return {
				status: "error",
				message: "Error fetching tasks",
			};
		}
	}

	async confirmPickup(id: string, code: string): Promise<ApiResponse<any>> {
		try {
			const request = { task_id: id, code: code };
			const response = await apiClient.post<ApiResponse<any>>(
				"api/receivers/pickup",
				request
			);
			if (response.status === 200) {
				return {
					status: "success",
					message: response.data.message,
					data: response.data.data,
				};
			}

			return {
				status: "error",
				message: "",
			};
		} catch (error) {
			throw {
				status: "error",
				message: "Error",
				data: error,
			};
		}
	}

	async cancelTaks(
		task_id: string,
		receiver_id: string
	): Promise<ApiResponse> {
		try {
			const response = await apiClient.delete<ApiResponse>(
				`api/receivers/task/${task_id}/${receiver_id}`
			);

			return {
				message: response.data.message,
				status: response.data.status,
				data: response.data.data,
			};
		} catch (error) {
			throw {
				message: "Error occured while cancelling",
				status: "error",
				data: error,
			};
		}
	}
}

export const receiverApi = new ReceiverApi();
