import apiClient from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VolunteerProfile, AvailabilitySlot } from "../types";
import { Task } from "./receiver";
import { ApiResponse } from "./user";
import { TaskData } from "../components/common/cards/volunteer/task";

const getAuthHeaders = async () => {
	const token = await AsyncStorage.getItem("auth_token");
	if (!token) throw new Error("Authentication token not found.");
	return { headers: { Authorization: `Bearer ${token}` } };
};

export const getAllTasks = async (): Promise<ApiResponse<TaskData[]>> => {
	try {
		const response = await apiClient.get<ApiResponse<TaskData[]>>(
			"api/volunteers/tasks/"
		);

		if (response.status === 200) {
			console.log("Response Data:", response.data);

			return {
				status: "success",
				message: response.data.message,
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
			message: `Error fetching task`,
			data: error,
		};
	}
};

export const getActiveTasks = async (
	id: string
): Promise<ApiResponse<Task[]>> => {
	try {
		const response = await apiClient.get<ApiResponse<Task[]>>(
			`api/volunteers/tasks/${id}`
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
			message: response.data.message,
		};
	} catch (error) {
		throw {
			status: "error",
			message: "Error fetching active tasks",
		};
	}
};

export const respondToTask = async (
	volunteerId: string,
	taskId: string,
	responseStatus: "accepted" | "declined"
) => {
	const config = await getAuthHeaders();
	const response = await apiClient.post(
		`/api/volunteers/${volunteerId}/tasks/${taskId}/response`,
		{ status: responseStatus },
		config
	);
	return response.data;
};

export const updateTaskStatus = async (
	taskId: string,
	newStatus: string
): Promise<ApiResponse<Task>> => {
	try {
		console.log("Hello");

		const response = await apiClient.patch<ApiResponse<Task>>(
			`/api/volunteers/tasks/${taskId}/${newStatus}`
		);
		if (response.status === 201) {
			return {
				status: "success",
				message: response.data.message,
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
			message: "Error updating tasks",
			errorDetails: error,
		};
	}
};

export const generateOTP = async (
	task_id: string,
	volunteer_id: string
): Promise<ApiResponse<any>> => {
	try {
		const response = await apiClient.post<ApiResponse<any>>(
			`api/otp/generate/${task_id}/${volunteer_id}`
		);

		console.log("OTP");
		if (response.status === 200) {
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
		throw {
			status: "error",
			message: `Error generating OTP: ${error}`,
		};
	}
};

export const getVolunteerProfile = async (
	volunteerId: string
): Promise<VolunteerProfile> => {
	const config = await getAuthHeaders();
	const response = await apiClient.get(
		`/api/volunteers/${volunteerId}`,
		config
	);
	return response.data.profile;
};

export const getAvailability = async (
	volunteerId: string
): Promise<AvailabilitySlot[]> => {
	const config = await getAuthHeaders();
	const response = await apiClient.get(
		`/api/volunteers/${volunteerId}/availability`,
		config
	);
	const data = response.data.availability;
	return Array.isArray(data) ? data : data ? [data] : [];
};

export const setAvailability = async (
	volunteerId: string,
	slot: Omit<AvailabilitySlot, "id" | "user_id">
) => {
	const config = await getAuthHeaders();
	const response = await apiClient.post(
		`/api/volunteers/${volunteerId}/availability`,
		slot,
		config
	);
	return response.data;
};

export const deleteAvailability = async (
	volunteerId: string,
	slot: { day_of_week: string }
) => {
	const config = await getAuthHeaders();
	const response = await apiClient.delete(
		`/api/volunteers/${volunteerId}/availability`,
		{ ...config, data: slot }
	);
	return response.data;
};

// New OTP functionality
export const sendDeliveryOtp = async (
	taskId: string,
	receiverId: string
): Promise<{ otp: string; success: boolean }> => {
	const config = await getAuthHeaders();
	const response = await apiClient.post(
		"/api/delivery/send-otp",
		{
			taskId,
			receiverId,
		},
		config
	);
	return response.data;
};

export const verifyDeliveryOtp = async (
	taskId: string,
	otp: string
): Promise<boolean> => {
	const config = await getAuthHeaders();
	const response = await apiClient.post(
		"/api/delivery/verify-otp",
		{
			taskId,
			otp,
		},
		config
	);
	return response.data.verified;
};

export const verifyCode = async (
	task_id: string,
	code: string
): Promise<ApiResponse<any>> => {
	try {
		console.log("body", { task_id, code });

		const response = await apiClient.post<ApiResponse<any>>(
			"api/volunteers/tasks/confirm",
			{ task_id: task_id, code: code }
		);
		console.log("Response code", response);

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
};
