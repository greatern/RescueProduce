import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

const API_URL = import.meta.env.VITE_API_URL;
console.log(API_URL);

if (!API_URL) {
	console.error(
		"VITE_API_URL is not defined in your .env file. Please check your .env configuration."
	);
}
console.log(API_URL);

export const apiClient = axios.create({
	baseURL: API_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

export interface ApiResponse<T = any> {
	status: "success" | "error";
	message: string;
	data?: T;
	meta?: {
		timestamp: string;
		[key: string]: string;
	};
}

apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("authToken");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			console.warn(
				"Unauthorized request, possibly redirecting to login."
			);
		}else{
			console.error("Response data:", error.response.data);
			console.error("Response status:", error.response.status);
		}
		return Promise.reject(error);
	}
);

export const api = {
	get: <T>(url: string, config?: AxiosRequestConfig) =>
		apiClient
			.get<T, AxiosResponse<T>>(url, config)
			.then((response) => response.data),

	post: <T>(url: string, data?: object, config?: AxiosRequestConfig) =>
		apiClient
			.post<T, AxiosResponse<T>>(url, data, config)
			.then((response) => response.data),
	put: <T>(url: string, data?: object, config?: AxiosRequestConfig) =>
		apiClient
			.put<T, AxiosResponse<T>>(url, data, config)
			.then((response) => response.data),

	patch: <T>(url: string, data?: object, config?: AxiosRequestConfig) =>
		apiClient
			.patch<T, AxiosResponse<T>>(url, data, config)
			.then((response) => response.data),

	delete: <T>(url: string, config?: AxiosRequestConfig) =>
		apiClient
			.delete<T, AxiosResponse<T>>(url, config)
			.then((response) => response.data),
};
