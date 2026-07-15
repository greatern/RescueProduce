import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
} from "react-native";
import { COLORS, SIZES } from "../../../constants";

const PasswordChange = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
	const [passwordData, setPasswordData] = React.useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleSubmit = () => {
		onSubmit(passwordData);
	};

	return (
		<View style={styles.container}>
			<View style={styles.inputGroup}>
				<Text style={styles.label}>Current Password</Text>
				<TextInput
					style={styles.input}
					secureTextEntry
					value={passwordData.currentPassword}
					onChangeText={(text) =>
						setPasswordData({
							...passwordData,
							currentPassword: text,
						})
					}
				/>
			</View>

			<View style={styles.inputGroup}>
				<Text style={styles.label}>New Password</Text>
				<TextInput
					style={styles.input}
					secureTextEntry
					value={passwordData.newPassword}
					onChangeText={(text) =>
						setPasswordData({ ...passwordData, newPassword: text })
					}
				/>
				<Text style={styles.hintText}>
					Password must be at least 8 characters
				</Text>
			</View>

			<View style={styles.inputGroup}>
				<Text style={styles.label}>Confirm New Password</Text>
				<TextInput
					style={styles.input}
					secureTextEntry
					value={passwordData.confirmPassword}
					onChangeText={(text) =>
						setPasswordData({
							...passwordData,
							confirmPassword: text,
						})
					}
				/>
			</View>

			<TouchableOpacity style={styles.button} onPress={handleSubmit}>
				<Text style={styles.buttonText}>Change Password</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: COLORS.white,
		padding: SIZES.large,
		marginBottom: SIZES.medium,
		borderRadius: SIZES.small,
	},
	inputGroup: {
		marginBottom: SIZES.large,
	},
	label: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginBottom: SIZES.small / 2,
	},
	input: {
		borderWidth: 1,
		borderColor: COLORS.gray2,
		borderRadius: SIZES.small,
		padding: SIZES.medium,
		fontSize: SIZES.medium,
	},
	hintText: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginTop: SIZES.small / 2,
	},
	button: {
		backgroundColor: COLORS.primary,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		alignItems: "center",
	},
	buttonText: {
		color: COLORS.white,
		fontWeight: "600",
	},
});

export default PasswordChange;
