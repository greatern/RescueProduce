import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ApiResponse, User, userApi } from "../service/user";
import { useNotifications } from "./NotificationContext";

interface AuthContextType {
	user: User | null;
	token: string | null;
	address: any;
	isLoading: boolean;
	isAuthenticated: boolean;
	setAddress: React.Dispatch<any>;
	login: (email: string, password: string) => Promise<void>;
	register: (userData: any) => Promise<ApiResponse<null>>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined)
		throw new Error("useAuth must be used within an AuthProvider");

	return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [address, setAddress] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const { initialiseNotifications } = useNotifications();

	useEffect(() => {
		void checkAuthState();
	}, []);

	const checkAuthState = async () => {
		try {
			const token = await AsyncStorage.getItem("auth_token");
			const userData = await AsyncStorage.getItem("user_data");
			const addressData = await AsyncStorage.getItem("user_address");

			if (token && userData) {
				setToken(token);
				setUser(JSON.parse(userData));
				console.log("User", JSON.parse(userData));
			}

			await new Promise((r) => setTimeout(r, 2000)); // wait 2 seconds

			if (addressData && userData) {
				setAddress(JSON.parse(addressData));
				console.log("Address", JSON.parse(addressData));
			} else {
				const response = await userApi.getAddress(user?.id!);
				if (response.status === "success") {
					setAddress(response.data);
				}
			}
		} catch (error) {
			console.error("Error checking auth state", error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchUserAddress = async (id: string) => {
		const addressRes = await userApi.getAddress(id);

		try {
			if (addressRes.status === "success") {
				setAddress(addressRes.data);
				console.log("Address", address);
			} else {
				//logout();
				setAddress(null);
			}
		} catch (error) {
			//logout();
			throw new Error("Could not find address", { cause: error });
		}
	};

	const login = async (email: string, password: string) => {
		try {
			const response = await userApi.login({ email, password });
			console.log("response", response);

			if (response.status === "success") {
				const data = response.data;
				setUser(data?.user!);

				await AsyncStorage.setItem("auth_token", data?.token!);
				await AsyncStorage.setItem(
					"user_data",
					JSON.stringify(data?.user)
				);
				fetchUserAddress(data?.user.id!);
				initialiseNotifications(data?.user!);
				console.log("User data", data?.user);
			} else {
				throw new Error("Could not login", { cause: response.message });
			}
		} catch (error) {
			console.error("Login error details:", error);
			throw error;
		}
	};

	const register = async (userData: User) => {
		try {
			setIsLoading(true);
			const data = await userApi.register(userData);

			if (data.status === "success") {
				console.log(data.message);
				return data;
			}
			throw data.message;
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		try {
			setIsLoading(true);
			await AsyncStorage.removeItem("auth_token");
			await AsyncStorage.removeItem("user_data");
			setToken(null);
			setUser(null);
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isLoading,
				address,
				setAddress,
				isAuthenticated: !!user,
				login,
				register,
				logout,
			}}>
			{children}
		</AuthContext.Provider>
	);
};