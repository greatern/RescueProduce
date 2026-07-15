import React, { useState } from "react";
import Login from "../App/screens/Login";
import Signup from "../App/screens/Signup";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants";

const AuthLayout = () => {
	const [activeScreen, setActiveScreen] = useState<"Login" | "Signup">(
		"Login"
	);

	const onLoginChange = () => {
		setActiveScreen("Login");
	};

	const onSignupScreen = () => {
		setActiveScreen("Signup");
	};

	const renderContent = () => {
		switch (activeScreen) {
			case "Login":
				return <Login onChange={onSignupScreen} />;
			case "Signup":
				return <Signup onChange={onLoginChange} />;
			default:
				return <Login onChange={onSignupScreen} />;
		}
	};

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<View style={styles.contentArea}>{renderContent()}</View>
			</SafeAreaView>
		</SafeAreaProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.lightWhite,
	},
	contentArea: {
		flex: 1,
	},
});

export default AuthLayout;
