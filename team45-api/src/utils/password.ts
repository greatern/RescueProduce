import bcrypt from "bcrypt";

export class PasswordUtils {
	static hashPassword = async (password: string) => {
		try {
			const saltRounds = 5;
			const hashedPassword = await bcrypt.hash(password, saltRounds);
			return hashedPassword;
		} catch (error) {
			throw new Error("Error hashing password: " + error);
		}
	};

	static verifyPassword = async (
		plainPassword: string,
		hashedPassword: string
	) => {
		try {
			const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
			return isMatch;
		} catch (error) {
			throw new Error("Error verifying password: " + error);
		}
	};
}
