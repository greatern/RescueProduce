import { api } from "./api";

interface Login {
	email: string;
	password: string;
}

export const authService = {
	login: (login: Login) => api.post("/api/auth/login", login),
};
