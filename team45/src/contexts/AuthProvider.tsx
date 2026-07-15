import React, { createContext, useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
//import Footer from "../components/footer";
import { userApi } from "../services/user_service";

export interface User {
	id: string;
	name: string;
	email: string;
	password: string;
	role: "donor" | "volunteer" | "receiver" | null;
	user_type: any;
}

export interface Address {
	id: string;
	user_id: string;
	address_line1: string;
	address_line2: string;
	city: string;
	province: string;
	country: string;
	latitude: number;
	longitude: number;
	place_id: string;
	postal_code: string;
}

interface AuthContextType {
	user: User | null;
	address: Address | null | undefined;
	isAuthenticated: boolean;
	isLoading: boolean;
	setAddress: React.Dispatch<
		React.SetStateAction<Address | null | undefined>
	>;
	login: (email: string, password: string) => Promise<void>;
	register: () => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = () => {
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [address, setAddress] = useState<Address | null>();
	const [isLoading, setIsLoading] = useState(false);

	const checkAuthState = () => {
		const user = localStorage.getItem("user_data");
		const address = localStorage.getItem("user_address");

		if (user) {
			try {
				const parsed_user = JSON.parse(user);
				console.log("Parsed User", parsed_user);
				setUser(parsed_user);
			} catch (error) {
				console.error(
					"Error parsing user data from localstorage",
					error
				);
				localStorage.removeItem("user_data");
			}
		}

		if (address) {
			try {
				const parsed_address = JSON.parse(address);
				console.log("Parsed Address", parsed_address);

				setAddress(parsed_address);
			} catch (error) {
				console.error(
					"Error parsing user address from localstorage",
					error
				);
				localStorage.removeItem("user_address");
			}
		}
	};

	useEffect(() => {
		checkAuthState();
	}, []);

	const login = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const response = await userApi.login({ email, password });
			console.log("Response:", response);

			if (response.status === "success") {
				const data = response.data.data;
				console.log("Login data", data);

				setUser(data.user);
				localStorage.setItem("user_data", JSON.stringify(data.user));

				const response_address = await userApi.getUserAddress(
					data.user.id
				);
				if (response_address.status === "success") {
					setAddress(response_address.data);
					localStorage.setItem(
						"user_address",
						JSON.stringify(response_address.data)
					);
				}
				navigate(`/${data.user.role}/`);
			} else {
				console.log("Could not login", response);
			}
		} catch (error) {
			console.error("Error logging in", error);
		} finally {
			setIsLoading(false);
		}
	};

	const register = async () => {};

	const logout = async () => {
		localStorage.removeItem("user_data");
		localStorage.removeItem("user_address");
		setUser(null);
	};

	const value = {
		user,
		address,
		isAuthenticated: !!user,
		isLoading,
		setAddress,
		login,
		register,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>
			<Header />
			<Outlet />
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be defined within an AuthProvider");
	}
	return context;
};
