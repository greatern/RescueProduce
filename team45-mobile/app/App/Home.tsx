import { useState } from "react";
import { useRouter } from "expo-router";
import { View, ScrollView, SafeAreaView, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS, icons, images, SIZES } from "../constants";
import ScreenHeaderBtn from "../components/common/header/ScreenHeaderBtn";
import Welcome from "../components/home/welcome/Welcome";
import Mission from "../components/home/ourMission/mission";
import HowItWorks from "../components/home/howItWorks/howItWorks";
import Footer from "../components/common/footer/footer";
const Home = () => {
	const router = useRouter();

	return (
		<SafeAreaProvider>
			<SafeAreaView
				style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
				<ScrollView showsVerticalScrollIndicator={false}>
					<View style={{ flex: 1, padding: SIZES.medium }}>
						<Welcome />
					</View>

					<View>
						<Mission />
					</View>

					<View>
						<HowItWorks />
					</View>

					<View>
						<Footer />
					</View>
				</ScrollView>
			</SafeAreaView>
		</SafeAreaProvider>
	);
};

export default Home;
