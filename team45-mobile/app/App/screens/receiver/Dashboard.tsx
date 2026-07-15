import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	Image,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../constants";

type Donation = {
	id: string;
	title: string;
	donor: string;
	expiry: string;
	quantity: string;
	status: "pending" | "in-transit";
	imageUri: string;
};

const Dashboard = () => {
	const [activeDonations, setActiveDonations] = useState<Donation[]>([
		{
			id: "1",
			title: "Fresh Vegetables",
			donor: "Green Grocers",
			expiry: "2025-08-15",
			quantity: "15kg",
			status: "pending",
			imageUri:
				"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
		},
		{
			id: "2",
			title: "Bakery Items",
			donor: "City Bakery",
			expiry: "2025-08-10",
			quantity: "8kg",
			status: "in-transit",
			imageUri:
				"https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=400&q=80",
		},
	]);

	const [stats, setStats] = useState({
		mealsProvided: 1260,
		co2Saved: 630,
		completedDonations: 42,
	});

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<ScrollView showsVerticalScrollIndicator={false}>
					<View style={styles.header}>
						<Text style={styles.headerTitle}>
							Receiver Dashboard
						</Text>
						<Text style={styles.headerSubtitle}>Welcome back!</Text>
					</View>

					<View style={styles.statsContainer}></View>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Quick Actions</Text>
						<View style={styles.actionsRow}>
							<TouchableOpacity
								style={styles.actionButton}
								onPress={() => {}}>
								<Ionicons
									name="add-circle-outline"
									size={32}
									color={COLORS.primary}
								/>
								<Text style={styles.actionButtonText}>
									New Claim
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.actionButton}
								onPress={() => {}}>
								<Ionicons
									name="time-outline"
									size={32}
									color={COLORS.primary}
								/>
								<Text style={styles.actionButtonText}>
									History
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.actionButton}
								onPress={() => {}}>
								<Ionicons
									name="alert-circle-outline"
									size={32}
									color={COLORS.primary}
								/>
								<Text style={styles.actionButtonText}>
									Report Issue
								</Text>
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							Active Donations
						</Text>
						{activeDonations.length > 0 ? (
							activeDonations.map((donation) => (
								<TouchableOpacity
									key={donation.id}
									style={styles.donationCard}
									onPress={() => {}}>
									<Image
										source={{ uri: donation.imageUri }}
										style={styles.donationImage}
									/>
									<View style={styles.donationInfo}>
										<Text style={styles.donationTitle}>
											{donation.title}
										</Text>
										<Text style={styles.donationDetail}>
											From: {donation.donor}
										</Text>
										<Text style={styles.donationDetail}>
											Expires: {donation.expiry}
										</Text>
										<Text style={styles.donationDetail}>
											Quantity: {donation.quantity}
										</Text>
										<View
											style={[
												styles.statusBadge,
												donation.status ===
													"in-transit" &&
													styles.statusInTransit,
												donation.status === "pending" &&
													styles.statusPending,
											]}>
											<Text style={styles.statusText}>
												{donation.status ===
												"in-transit"
													? "In Transit"
													: "Pending"}
											</Text>
										</View>
									</View>
								</TouchableOpacity>
							))
						) : (
							<View style={styles.emptyState}>
								<Ionicons
									name="receipt-outline"
									size={48}
									color={COLORS.gray}
								/>
								<Text style={styles.emptyStateText}>
									No active donations
								</Text>
							</View>
						)}
					</View>
				</ScrollView>
			</SafeAreaView>
		</SafeAreaProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.lightWhite,
		padding: SIZES.medium,
	},
	header: {
		marginBottom: SIZES.large,
	},
	headerTitle: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
	},
	headerSubtitle: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		marginTop: SIZES.small / 2,
	},
	statsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: SIZES.large,
	},
	statCard: {
		width: "30%",
		backgroundColor: COLORS.white,
		borderRadius: 12,
		padding: SIZES.medium,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	statValue: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
		marginVertical: SIZES.small,
	},
	statLabel: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		textAlign: "center",
	},
	section: {
		backgroundColor: COLORS.white,
		borderRadius: 12,
		padding: SIZES.medium,
		marginBottom: SIZES.large,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: SIZES.large,
		fontWeight: "600",
		color: COLORS.primary,
		marginBottom: SIZES.medium,
	},
	actionsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	actionButton: {
		alignItems: "center",
		width: "30%",
		padding: SIZES.small,
	},
	actionButtonText: {
		fontSize: SIZES.small,
		color: COLORS.primary,
		marginTop: SIZES.small,
		textAlign: "center",
	},
	donationCard: {
		flexDirection: "row",
		backgroundColor: COLORS.lightWhite,
		borderRadius: 12,
		padding: SIZES.medium,
		marginBottom: SIZES.medium,
	},
	donationImage: {
		width: 80,
		height: 80,
		borderRadius: 8,
		marginRight: SIZES.medium,
	},
	donationInfo: {
		flex: 1,
	},
	donationTitle: {
		fontSize: SIZES.medium,
		fontWeight: "bold",
		color: COLORS.primary,
		marginBottom: SIZES.small / 2,
	},
	donationDetail: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginBottom: SIZES.small / 2,
	},
	statusBadge: {
		alignSelf: "flex-start",
		paddingHorizontal: SIZES.small,
		paddingVertical: SIZES.small / 2,
		borderRadius: 20,
		marginTop: SIZES.small,
	},
	statusPending: {
		backgroundColor: "#FFF3E0",
	},
	statusInTransit: {
		backgroundColor: "#E8F5E9",
	},
	statusText: {
		fontSize: SIZES.small,
		fontWeight: "500",
	},
	emptyState: {
		alignItems: "center",
		padding: SIZES.large,
	},
	emptyStateText: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		marginTop: SIZES.medium,
	},
});

export default Dashboard;
