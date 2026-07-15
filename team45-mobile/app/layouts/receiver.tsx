import React, { useEffect, useState } from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import DonationsScreen, {
	getCategoryImage,
} from "../App/screens/receiver/LiveDonationsPage";
import ClaimScreen from "../App/screens/receiver/ClaimScreen";
import TrackScreen from "../App/screens/receiver/ClaimTracker";
import ReceiverHistory from "../App/screens/receiver/history";
import { createStackNavigator } from "@react-navigation/stack";
import EditAddress from "../App/screens/profile/AddressScreen";
import EditProfile from "../App/screens/profile/ProfileScreen";
import Profile from "../App/screens/profile/index";
import ReportIssue from "../App/screens/receiver/ReportIssue";
import { TabButton } from "./donor";
import ProfileStack from "./profile_stack";
import Dashboard from "../App/screens/receiver/Dashboard";
import NotificationCenter from "../components/NotificationCenter";
import { useAuth } from "../contexts/AuthContext";
import { Donation, ProximityDonation, receiverApi } from "../service/receiver";

const ReceiverLayout = () => {
	const [activeTab, setActiveTab] = useState<
		| "Home"
		| "Details"
		| "Profile"
		| "History"
		| "Donations"
		| "Track"
		| "Report"
		| "Notifications"
	>("Home");
	const [hideTab, setHideTab] = useState(false);
	const [donations, setDonations] = useState<Donation[]>([]);
	const [closestDonations, setClosestDonations] = useState<
		ProximityDonation[]
	>([]);
	const [error, setError] = useState<string | null>("");
	const [isLoading, setIsLoading] = useState(false);
	const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
		null
	);
	const [lastFetch, setLastFetch] = useState(0);
	const CACHE_DURATION = 0.5 * 60 * 1000; // 30 seconds

	const { user, address } = useAuth();

	const getDonations = async (force_refresh = false) => {
		/* const now = Date.now();
		const should_refresh =
			force_refresh || now - lastFetch > CACHE_DURATION;

		if (!should_refresh && donations.length > 0) {
			return; // Use cached data
		} */

		try {
			setIsLoading(true);
			setError(null);

			const [donation_response, proximity_response] = await Promise.all([
				receiverApi.getDonations(user?.id!),
				receiverApi.getClosestDonations(user?.id!),
			]);

			if (donation_response.status === "success") {
				console.log("Donation Response", donation_response);
				setDonations(donation_response.data ?? []);
			}

			if (proximity_response.status === "success") {
				console.log("Proximity Response", proximity_response);
				setClosestDonations(proximity_response.data ?? []);
			}
		} catch (error) {
			console.error("Error fetching donations:", error);
			setError(
				"Error fetching donations. Please check your connection and try again."
			);
			setDonations([]);
		} finally {
			setIsLoading(false);
		}
	};

	const filterPages = () => {
		return ["Details", "Report"].includes(activeTab);
	};
	const showTabs = filterPages() || hideTab;

	useEffect(() => {
		getDonations();
	}, []);

	useEffect(() => {
		if (activeTab === "Donations" && donations.length === 0) {
			getDonations();
		}
	}, [activeTab]);

	const handleDonationSelect = (donation: Donation) => {
		setSelectedDonation(donation);
		setActiveTab("Details");
	};

	const handleBackHome = () => {
		setSelectedDonation(null);
		setActiveTab("Home");
	};

	const renderContent = () => {
		switch (activeTab) {
			case "Home":
				return <Dashboard />;
			case "Donations":
				return (
					<DonationsScreen
						onDonationSelect={handleDonationSelect}
						donations={donations}
						error={error}
						setError={setError}
						onRetry={getDonations}
						isLoading={isLoading}
					/>
				);
			case "Details":
				return (
					<ClaimScreen
						item_image={getCategoryImage(
							selectedDonation?.food_category!
						)}
						donation={selectedDonation!}
						onBack={handleBackHome}
					/>
				);
			case "Track":
				return <TrackScreen />;
			case "History":
				return <ReceiverHistory />;
			case "Profile":
				return <ProfileStack setHideTab={setHideTab} />;
			case "Notifications":
				return <NotificationCenter userId={user?.id || ""} />;
			case "Report":
				return <ReportIssue />;
			default:
				return <Dashboard />;
		}
	};

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<View style={styles.contentArea}>{renderContent()}</View>
				<View style={styles.tabBar}>
					{!showTabs && (
						<>
							<TabButton
								name="Home"
								icon="home"
								label="Home"
								activeTab={activeTab}
								setActiveTab={setActiveTab}
							/>
							<TabButton
								name="Donations"
								icon="battery-dead"
								label="Donations"
								activeTab={activeTab}
								setActiveTab={setActiveTab}
							/>
							<TabButton
								name="Track"
								icon="checkmark"
								label="Track"
								activeTab={activeTab}
								setActiveTab={setActiveTab}
							/>
							<TabButton
								name="Notifications"
								icon="notifications"
								label="Notifications"
								activeTab={activeTab}
								setActiveTab={setActiveTab}
							/>
							<TabButton
								name="Profile"
								icon="person"
								label="Profile"
								activeTab={activeTab}
								setActiveTab={setActiveTab}
							/>
						</>
					)}
				</View>
			</SafeAreaView>
		</SafeAreaProvider>
	);
};

export default ReceiverLayout;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.lightWhite,
	},
	contentArea: {
		flex: 1,
	},
	contentView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	tabBar: {
		flexDirection: "row",
		backgroundColor: COLORS.white,
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
		paddingBottom: 5,
		paddingTop: 5,
	},
	tabItem: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	tabLabel: {
		fontSize: 11,
		marginTop: 4,
	},
});
