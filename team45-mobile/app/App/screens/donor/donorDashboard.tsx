import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ActivityIndicator,
	Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../constants";
import { SafeAreaProvider } from "react-native-safe-area-context";
import donorApi from "../../../service/donor";
import { useAuth } from "../../../contexts/AuthContext";

type RootParamList = {
	Home: { mission?: string };
	Login: undefined;
	DonorDashboard: undefined;
	LogFood: undefined;
	DonationHistory: undefined;
	Report: undefined;
	Profile: undefined;
};

type NavigationProp = DrawerNavigationProp<RootParamList>;

type DashboardResponse = {
	donationStats: { total: number; thisMonth: number };
	impactStats: { mealsProvided: number; co2Saved: number };
	recentActivities: { id: number; text: string; date: string }[];
	// upcomingPickups: { id: number; date: string; time: string; location: string }[];
	donorProfile: { name: string; totalDonations: number; joinDate: string };
	communityStats: { rank: number; totalDonors: number };
	donationGoal: { current: number; target: number };
};

const DonorDashboard = () => {
	const navigation = useNavigation<NavigationProp>();
	const { user, token: contextToken, isAuthenticated, logout } = useAuth();
	const scale = useRef(new Animated.Value(1)).current;
	const cardScale = useRef(new Animated.Value(0)).current;

	const [data, setData] = useState<DashboardResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const donorId = user?.id || null;

	useEffect(() => {
		if (isAuthenticated && donorId && contextToken) {
			Animated.spring(cardScale, {
				toValue: 1,
				useNativeDriver: true,
			}).start();
			fetchDashboardData();
		} else {
			setError("Please log in to view your dashboard");
			setLoading(false);
		}
	}, [isAuthenticated, donorId, contextToken]);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			const dashboardData = await donorApi.getDashboard(
				donorId!,
				contextToken!
			);
			setData(dashboardData);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	};

	const handlePressIn = () => {
		Animated.spring(scale, {
			toValue: 0.95,
			useNativeDriver: true,
		}).start();
	};

	const handlePressOut = () => {
		Animated.spring(scale, {
			toValue: 1,
			useNativeDriver: true,
		}).start();
	};
	const handleLogFood = () => navigation.navigate("LogFood");
	const handleViewHistory = () => navigation.navigate("DonationHistory");
	const handleViewReports = () => navigation.navigate("Report");
	const handleEditProfile = () => navigation.navigate("Profile");
	const handleLogout = async () => {
		await logout();
		navigation.navigate("Login");
	};

	const animatedButtonStyle = {
		transform: [{ scale }],
	};

	const animatedCardStyle = {
		transform: [{ scale: cardScale }],
	};

	const StatCard = ({
		title,
		value,
	}: {
		title: string;
		value: string | number;
	}) => (
		<View style={styles.statCard}>
			<Ionicons
				name="stats-chart-outline"
				size={24}
				color={COLORS.primary}
			/>
			<Text style={styles.statValue}>
				{value !== null ? value : "Loading..."}
			</Text>
			<Text style={styles.statTitle}>{title}</Text>
		</View>
	);

	const ActionButton = ({
		icon,
		text,
		onPress,
	}: {
		icon: string;
		text: string;
		onPress: () => void;
	}) => (
		<TouchableOpacity
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			onPress={onPress}
			style={styles.actionButton}>
			<Ionicons name={icon as any} size={24} color={COLORS.primary} />
			<Text style={styles.actionButtonText}>{text}</Text>
		</TouchableOpacity>
	);

	const ActivityItem = ({
		icon,
		text,
		date,
	}: {
		icon: string;
		text: string;
		date: string;
	}) => (
		<View style={styles.activityItem}>
			<Ionicons name={icon as any} size={20} color={COLORS.primary} />
			<View style={styles.activityTextContainer}>
				<Text style={styles.activityText}>{text}</Text>
				<Text style={styles.activityDate}>{date}</Text>
			</View>
		</View>
	);

	if (loading)
		return <ActivityIndicator size="large" color={COLORS.primary} />;
	if (error) return <Text style={styles.errorText}>{error}</Text>;

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Donor Dashboard</Text>
					<Text style={styles.headerSubtitle}>
						Welcome back, {data?.donorProfile.name || "Loading..."}!
					</Text>
				</View>

				<ScrollView
					style={styles.content}
					showsVerticalScrollIndicator={false}>
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Quick Actions</Text>
						<View style={styles.actionsRow}>
							<ActionButton
								icon="add-circle-outline"
								text="Log Food"
								onPress={handleLogFood}
							/>
							<ActionButton
								icon="time-outline"
								text="History"
								onPress={handleViewHistory}
							/>
							<ActionButton
								icon="document-text-outline"
								text="Reports"
								onPress={handleViewReports}
							/>
							<ActionButton
								icon="log-out-outline"
								text="Logout"
								onPress={handleLogout}
							/>
						</View>
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Donation Stats</Text>
						<View style={styles.statsRow}>
							<StatCard
								title="Total Donations"
								value={data?.donationStats.total || 0}
							/>
							<StatCard
								title="This Month"
								value={data?.donationStats.thisMonth || 0}
							/>
						</View>
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Impact Stats</Text>
						<View style={styles.statsRow}>
							<StatCard
								title="Meals Provided"
								value={data?.impactStats.mealsProvided || 0}
							/>
							<StatCard
								title="CO2 Saved (kg)"
								value={data?.impactStats.co2Saved || 0}
							/>
						</View>
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Your Profile</Text>
						<Animated.View
							style={[styles.profileCard, animatedCardStyle]}>
							<View style={styles.profileHeader}>
								<Ionicons
									name="person-circle-outline"
									size={48}
									color={COLORS.primary}
								/>
								<View style={styles.profileInfo}>
									<Text style={styles.profileName}>
										{data?.donorProfile.name ||
											"Loading..."}
									</Text>
									<Text style={styles.profileDetail}>
										Member since{" "}
										{data?.donorProfile.joinDate ||
											"Loading..."}
									</Text>
								</View>
							</View>
							<TouchableOpacity
								onPress={handleEditProfile}
								style={styles.editButton}>
								<Text style={styles.editButtonText}>
									Edit Profile
								</Text>
							</TouchableOpacity>
						</Animated.View>
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Donation Goal</Text>
						<Animated.View
							style={[styles.goalCard, animatedCardStyle]}>
							<View style={styles.goalHeader}>
								<Text style={styles.goalText}>
									{data?.donationGoal.current || 0} /{" "}
									{data?.donationGoal.target || 100} kg
								</Text>
								<Text style={styles.goalPercentage}>
									{data?.donationGoal
										? Math.round(
												(data.donationGoal.current /
													data.donationGoal.target) *
													100
										  )
										: 0}
									%
								</Text>
							</View>
							<View style={styles.progressBar}>
								<View
									style={[
										styles.progressFill,
										{
											width: `${
												data?.donationGoal
													? (data.donationGoal
															.current /
															data.donationGoal
																.target) *
													  100
													: 0
											}%`,
										},
									]}
								/>
							</View>
						</Animated.View>
					</View>
					{/* 
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Pickups</Text>
            {data?.upcomingPickups.map((pickup) => (
              <ActivityItem
                key={pickup.id}
                icon="car-outline"
                text={`${pickup.date} at ${pickup.time}`}
                date={pickup.location}
              />
            ))}
          </View>*/}

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Recent Activity</Text>
						{data?.recentActivities.map((activity) => (
							<ActivityItem
								key={activity.id}
								icon="checkmark-circle-outline"
								text={activity.text}
								date={activity.date}
							/>
						))}
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Community</Text>
						<Animated.View
							style={[styles.communityCard, animatedCardStyle]}>
							<View style={styles.communityContent}>
								<Ionicons
									name="trophy-outline"
									size={32}
									color={COLORS.primary}
								/>
								<View style={styles.communityText}>
									<Text style={styles.communityRank}>
										#
										{data?.communityStats.rank ||
											"Loading..."}
									</Text>
									<Text style={styles.communitySubtext}>
										out of{" "}
										{data?.communityStats.totalDonors ||
											"Loading..."}{" "}
										donors
									</Text>
								</View>
							</View>
						</Animated.View>
					</View>
				</ScrollView>
			</SafeAreaView>
		</SafeAreaProvider>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.lightWhite },
	header: {
		padding: SIZES.medium,
		backgroundColor: COLORS.white,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	headerTitle: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
	},
	headerSubtitle: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
	},
	content: { flex: 1, padding: SIZES.medium },
	section: { marginBottom: SIZES.large },
	sectionTitle: {
		fontSize: SIZES.medium,
		fontWeight: "600",
		color: COLORS.primary,
		marginBottom: SIZES.small,
	},
	actionsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: SIZES.small,
	},
	actionButton: {
		flex: 1,
		backgroundColor: COLORS.white,
		borderRadius: 12,
		padding: SIZES.small,
		marginHorizontal: 4,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
	},
	actionButtonText: {
		fontSize: SIZES.small,
		color: COLORS.primary,
		marginTop: 4,
	},
	statsRow: { flexDirection: "row", justifyContent: "space-between" },
	statCard: {
		width: "48%",
		backgroundColor: COLORS.white,
		borderRadius: 12,
		padding: SIZES.medium,
		marginBottom: SIZES.small,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
	},
	statValue: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
		marginVertical: 4,
	},
	statTitle: {
		fontSize: SIZES.small,
		color: COLORS.gray,
	},
	profileCard: {
		backgroundColor: COLORS.white,
		borderRadius: 12,
		padding: SIZES.medium,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
	},
	profileHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SIZES.medium,
	},
	profileInfo: { marginLeft: SIZES.medium },
	profileName: {
		fontSize: SIZES.medium,
		fontWeight: "bold",
		color: COLORS.primary,
	},
	profileDetail: {
		fontSize: SIZES.small,
		color: COLORS.gray,
	},
	editButton: {
		backgroundColor: COLORS.orange,
		borderRadius: 8,
		padding: SIZES.small,
		alignItems: "center",
	},
	editButtonText: {
		color: COLORS.white,
		fontSize: SIZES.small,
		fontWeight: "600",
	},
	goalCard: {
		backgroundColor: COLORS.white,
		borderRadius: 12,
		padding: SIZES.medium,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
	},
	goalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: SIZES.small,
	},
	goalText: {
		fontSize: SIZES.medium,
		color: COLORS.primary,
		fontWeight: "600",
	},
	goalPercentage: {
		fontSize: SIZES.medium,
		color: COLORS.primary,
		fontWeight: "bold",
	},
	progressBar: {
		height: 8,
		backgroundColor: "#e0e0e0",
		borderRadius: 4,
		overflow: "hidden",
	},
	progressFill: { height: "100%", backgroundColor: COLORS.orange },
	activityItem: {
		flexDirection: "row",
		backgroundColor: COLORS.white,
		borderRadius: 12,
		padding: SIZES.medium,
		marginBottom: SIZES.small,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
	},
	activityTextContainer: { marginLeft: SIZES.small, flex: 1 },
	activityText: { fontSize: SIZES.small, color: COLORS.primary },
	activityDate: { fontSize: SIZES.xSmall, color: COLORS.gray, marginTop: 2 },
	communityCard: {
		backgroundColor: COLORS.white,
		borderRadius: 12,
		padding: SIZES.medium,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
	},
	communityContent: { flexDirection: "row", alignItems: "center" },
	communityText: { marginLeft: SIZES.medium },
	communityRank: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
	},
	communitySubtext: { fontSize: SIZES.small, color: COLORS.gray },
	errorText: {
		textAlign: "center",
		color: COLORS.error,
		fontSize: SIZES.medium,
		padding: SIZES.medium,
	},
});

export default DonorDashboard;
