import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, SIZES, images } from "../../../constants";
import styles from "./welcome.style";
import { router, useRouter } from "expo-router";

const Welcome = () => {
	const router = useRouter();
	return (
		<View style={styles.container}>
			<Image
				source={images.hero}
				resizeMode="contain"
				style={styles.hero}
			/>
			<View style={styles.textOverlay}>
				<Text style={styles.title}>Welcome to RescueProduce</Text>
				<Text style={styles.subtitle}>Reduce food waste with us</Text>
				<TouchableOpacity
					onPress={() => router.push("../../../screens/auth/login")}
					style={{
						backgroundColor: "orange",
						padding: 15,
						borderRadius: 5,
					}}>
					<Text style={{ color: "white" }}>Get started</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default Welcome;
