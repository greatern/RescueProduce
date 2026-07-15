import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Dimensions,
	Pressable,
	Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES } from "../../../constants";
import { SafeAreaProvider } from "react-native-safe-area-context";

type RootParamList = {
	Home: { mission?: string };
	Login: undefined;
	DonorDashboard: undefined;
	LogFood: undefined;
	DonationHistory: undefined;
};

type NavigationProp = DrawerNavigationProp<RootParamList>;

type DonationStatus = "active" | "completed" | "collected";

type Donation = {
	id: string;
	foodCategory: string;
	quantity: number;
	quantityUnit: string;
	units: number;
	expiryDate: string;
	storageReq: string;
	pickupDate: string;
	pickupTime: string;
	specialInstructions: string;
	status: DonationStatus;
	createdAt: string;
};

const { width } = Dimensions.get("window");

const mockDonations: Donation[] = [
	{
		id: "1",
		foodCategory: "fresh_produce",
		quantity: 5,
		quantityUnit: "kg",
		units: 2,
		expiryDate: "2025-08-15",
		storageReq: "refrigerated",
		pickupDate: "2025-08-10",
		pickupTime: "morning",
		specialInstructions: "Please bring containers",
		status: "active",
		createdAt: "2025-07-25",
	},
	{
		id: "2",
		foodCategory: "bakery",
		quantity: 10,
		quantityUnit: "kg",
		units: 1,
		expiryDate: "2025-08-05",
		storageReq: "ambient",
		pickupDate: "2025-08-01",
		pickupTime: "afternoon",
		specialInstructions: "",
		status: "collected",
		createdAt: "2025-07-20",
	},
	{
		id: "3",
		foodCategory: "canned",
		quantity: 15,
		quantityUnit: "kg",
		units: 3,
		expiryDate: "2025-09-01",
		storageReq: "ambient",
		pickupDate: "2025-08-20",
		pickupTime: "evening",
		specialInstructions: "No nuts please",
		status: "completed",
		createdAt: "2025-07-15",
	},
];

const DonationHistory = () => {
	const navigation = useNavigation<NavigationProp>();
	const [donations, setDonations] = useState<Donation[]>(mockDonations);
	const [selectedStatus, setSelectedStatus] = useState<
		DonationStatus | "all"
	>("all");
	const cardScale = useRef(new Animated.Value(0)).current;
	useEffect(() => {
		Animated.spring(cardScale, {
			toValue: 1,
			useNativeDriver: true,
		}).start();
	}, []);

	const animatedCardStyle = {
		transform: [{ scale: cardScale }],
	};

	const getDisplayValue = (key: keyof Donation, value: string) => {
		const options: { [key: string]: { [value: string]: string } } = {
			foodCategory: {
				fresh_produce: "Fresh Produce",
				dairy: "Dairy Products",
				meat: "Meat & Poultry",
				bakery: "Bakery Items",
				canned: "Canned Goods",
				dry_goods: "Dry Goods",
				prepared: "Prepared Foods",
				other: "Other",
			},
			storageReq: {
				ambient: "Ambient Temperature",
				refrigerated: "Refrigerated (2-8°C)",
				frozen: "Frozen (-18°C or below)",
			},
			pickupTime: {
				morning: "Morning (8am-12pm)",
				afternoon: "Afternoon (12pm-4pm)",
				evening: "Evening (4pm-8pm)",
			},
		};
		return options[key] && options[key][value]
			? options[key][value]
			: value;
	};

	const getStatusColor = (status: DonationStatus) => {
		switch (status) {
			case "active":
				return COLORS.orange;
			case "collected":
				return COLORS.green;
			case "completed":
				return COLORS.primary;
			default:
				return COLORS.gray;
		}
	};

	const getStatusIcon = (status: DonationStatus) => {
		switch (status) {
			case "active":
				return "time-outline";
			case "collected":
				return "checkmark-circle-outline";
			case "completed":
				return "checkmark-done-outline";
			default:
				return "help-circle-outline";
		}
	};

	const filteredDonations = donations.filter(
		(donation) =>
			selectedStatus === "all" || donation.status === selectedStatus
	);

	const renderStatusFilter = () => {
		const statuses = [
			{ key: "all", label: "All" },
			{ key: "active", label: "Active" },
			{ key: "collected", label: "Collected" },
			{ key: "completed", label: "Completed" },
		];

		return (
			<View style={styles.filterContainer}>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{statuses.map((item) => (
						<Pressable
							key={item.key}
							style={[
								styles.filterButton,
								selectedStatus === item.key &&
									styles.filterButtonActive,
							]}
							onPress={() =>
								setSelectedStatus(
									item.key as DonationStatus | "all"
								)
							}>
							<Text
								style={[
									styles.filterButtonText,
									selectedStatus === item.key &&
										styles.filterButtonTextActive,
								]}>
								{item.label}
							</Text>
						</Pressable>
					))}
				</ScrollView>
			</View>
		);
	};

	const renderDonationItem = ({ item }: { item: Donation }) => (
		<Animated.View style={[styles.card, animatedCardStyle]}>
			<View style={styles.cardHeader}>
				<View style={styles.statusBadge}>
					<Ionicons
						name={getStatusIcon(item.status)}
						size={16}
						color={getStatusColor(item.status)}
					/>
					<Text
						style={[
							styles.statusText,
							{ color: getStatusColor(item.status) },
						]}>
						{item.status.charAt(0).toUpperCase() +
							item.status.slice(1)}
					</Text>
				</View>
				<Text style={styles.dateText}>{item.createdAt}</Text>
			</View>

			<View style={styles.cardContent}>
				<View style={styles.cardRow}>
					<Ionicons
						name="restaurant-outline"
						size={16}
						color={COLORS.primary}
					/>
					<Text style={styles.cardLabel}>Category:</Text>
					<Text style={styles.cardValue}>
						{getDisplayValue("foodCategory", item.foodCategory)}
					</Text>
				</View>

				<View style={styles.cardRow}>
					<Ionicons
						name="cube-outline"
						size={16}
						color={COLORS.primary}
					/>
					<Text style={styles.cardLabel}>Quantity:</Text>
					<Text style={styles.cardValue}>
						{item.quantity} {item.quantityUnit} × {item.units} units
					</Text>
				</View>

				<View style={styles.cardRow}>
					<Ionicons
						name="calendar-outline"
						size={16}
						color={COLORS.primary}
					/>
					<Text style={styles.cardLabel}>Pickup:</Text>
					<Text style={styles.cardValue}>
						{item.pickupDate} (
						{getDisplayValue("pickupTime", item.pickupTime)})
					</Text>
				</View>

				{item.specialInstructions && (
					<View style={styles.cardRow}>
						<Ionicons
							name="document-text-outline"
							size={16}
							color={COLORS.primary}
						/>
						<Text style={styles.cardLabel}>Instructions:</Text>
						<Text style={styles.cardValue}>
							{item.specialInstructions}
						</Text>
					</View>
				)}

				<TouchableOpacity
					style={[
						styles.trackButton,
						{
							backgroundColor:
								item.status === "active"
									? COLORS.primary
									: "#f0f0f0",
							borderColor:
								item.status === "active"
									? COLORS.primary
									: "#ddd",
						},
					]}
					disabled={item.status !== "active"}>
					<Text
						style={[
							styles.trackButtonText,
							{
								color:
									item.status === "active"
										? COLORS.white
										: COLORS.gray,
							},
						]}>
						{item.status === "active"
							? "Track Donation"
							: item.status === "collected"
							? "Collected"
							: "Completed"}
					</Text>
				</TouchableOpacity>
			</View>
		</Animated.View>
	);

	return (
		<SafeAreaProvider>
			<LinearGradient
				colors={["#f5f7fa", "#8fb18bff"]}
				style={styles.gradientBackground}>
				<SafeAreaView style={styles.container}>
					<View style={styles.header}>
						<View>
							<Text style={styles.headerTitle}> History</Text>
							<Text style={styles.headerSubtitle}>
								{" "}
								View your past and current donations
							</Text>
						</View>
						<TouchableOpacity
							onPress={() => navigation.goBack()}
							style={styles.backButton}>
							<Ionicons
								name="arrow-back"
								size={24}
								color={COLORS.primary}
							/>
						</TouchableOpacity>
					</View>

					{renderStatusFilter()}

					<FlatList
						data={filteredDonations}
						renderItem={renderDonationItem}
						keyExtractor={(item) => item.id}
						contentContainerStyle={styles.listContent}
						ListEmptyComponent={
							<View style={styles.emptyState}>
								<Ionicons
									name="receipt-outline"
									size={48}
									color={COLORS.gray}
								/>
								<Text style={styles.emptyStateText}>
									No{" "}
									{selectedStatus === "all"
										? ""
										: selectedStatus}{" "}
									donations found
								</Text>
							</View>
						}
					/>
				</SafeAreaView>
			</LinearGradient>
		</SafeAreaProvider>
	);
};

const styles = StyleSheet.create({
	gradientBackground: {
		flex: 1,
	},
	container: {
		flex: 1,
		padding: SIZES.medium,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SIZES.medium,
	},
	headerTitle: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
	},
	headerSubtitle: {
		fontSize: SIZES.small,
		color: COLORS.gray,
	},
	backButton: {
		backgroundColor: COLORS.white,
		borderRadius: 20,
		padding: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	filterContainer: {
		backgroundColor: COLORS.white,
		paddingVertical: 12,
		paddingHorizontal: 16,
		marginBottom: SIZES.medium,
		borderRadius: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	filterButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: COLORS.primary,
		marginRight: 8,
	},
	filterButtonActive: {
		backgroundColor: COLORS.primary,
	},
	filterButtonText: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		fontWeight: "500",
	},
	filterButtonTextActive: {
		color: COLORS.white,
	},
	card: {
		backgroundColor: COLORS.white,
		borderRadius: 12,
		marginBottom: SIZES.medium,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: SIZES.medium,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		backgroundColor: "#f8f9fa",
	},
	statusText: {
		fontSize: SIZES.small,
		fontWeight: "500",
		marginLeft: 4,
	},
	dateText: {
		fontSize: SIZES.small,
		color: COLORS.gray,
	},
	cardContent: {
		padding: SIZES.medium,
	},
	cardRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SIZES.small,
		flexWrap: "wrap",
	},
	cardLabel: {
		fontSize: SIZES.small,
		fontWeight: "500",
		color: COLORS.primary,
		marginLeft: SIZES.small,
		minWidth: 80,
	},
	cardValue: {
		fontSize: SIZES.small,
		color: COLORS.primary,
		flex: 1,
	},
	trackButton: {
		marginTop: SIZES.medium,
		padding: SIZES.small,
		borderRadius: 8,
		borderWidth: 1,
		alignItems: "center",
	},
	trackButtonText: {
		fontSize: SIZES.small,
		fontWeight: "600",
	},
	listContent: {
		paddingBottom: SIZES.large,
	},
	emptyState: {
		alignItems: "center",
		padding: SIZES.xxLarge,
	},
	emptyStateText: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		marginTop: SIZES.medium,
		textAlign: "center",
	},
});

export default DonationHistory;
