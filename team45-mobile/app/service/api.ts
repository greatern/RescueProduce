import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

interface ApiConfig extends AxiosRequestConfig {
	baseURL: string;
	timeout: number;
}

const apiConfig: ApiConfig = {
	baseURL: process.env.EXPO_PUBLIC_API_URL! + "/",
	timeout: 10000,
};

const apiClient = axios.create(apiConfig);
console.log("API Base URL:", apiConfig.baseURL);

export const externalApiClient = axios.create({
	timeout: 10000,
});

// Request interceptors for main API client
apiClient.interceptors.request.use(
	async (config) => {
		const token = await AsyncStorage.getItem("auth_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
		console.log(
			`Making ${config.method?.toUpperCase()} request to: ${
				config.baseURL
			}${config.url}`
		);
		console.log("Request data:", config.data);
	},
	(error: AxiosError) => {
		console.error("Request error:", error.message);
		return Promise.reject(error);
	}
);

// Response interceptor for main API client
apiClient.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	(error: AxiosError) => {
		//console.error("Error from api", error);
		return Promise.reject(error);
	}
);

// Request interceptors for external API client
externalApiClient.interceptors.request.use(
	(config) => {
		console.log(`Making external API request to: ${config.url}`);
		return config;
	},
	(error: AxiosError) => {
		console.error("External API request error:", error.message);
		return Promise.reject(error);
	}
);

export default apiClient;
