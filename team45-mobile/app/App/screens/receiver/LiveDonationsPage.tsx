import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
	RefreshControl,
	ActivityIndicator,
	Text,
	StyleSheet,
	View,
	TouchableOpacity,
	FlatList,
} from "react-native";
import DonationCard from "../../../components/common/cards/receiver/donation";
import { ScrollView } from "react-native-gesture-handler";
import { useCallback, useEffect, useState } from "react";
import DetailModal from "../../../components/common/modals/receiver/modal";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Donation, receiverApi } from "../../../service/receiver";
import { useAuth } from "../../../contexts/AuthContext";
import { SIZES, COLORS, FONT } from "../../../constants";
import { Ionicons } from "@expo/vector-icons";
import SortModal from "../../../components/common/modals/receiver/donation_filter_modal";

// Import category images
const preparedImage = require("../../../assets/images/display/prepared.jpg");
const bakeryImage = require("../../../assets/images/display/bakery.jpg");
const dairyImage = require("../../../assets/images/display/dairy.jpg");
const freshProduceImage = require("../../../assets/images/display/fresh-produce.jpg");
const cannedImage = require("../../../assets/images/display/canned.jpg");
const meatImage = require("../../../assets/images/display/meat.jpg");

// Category image mapping
export const getCategoryImage = (category: string) => {
	const categoryMap: { [key: string]: any } = {
		fresh_produce: freshProduceImage,
		"fresh produce": freshProduceImage,
		"fruits & veg": freshProduceImage,
		dairy: dairyImage,
		"dairy products": dairyImage,
		meat: meatImage,
		"meat & poultry": meatImage,
		bakery: bakeryImage,
		"bakery items": bakeryImage,
		bread: bakeryImage,
		canned: cannedImage,
		"canned goods": cannedImage,
		dry_goods: cannedImage,
		"dry goods": cannedImage,
		prepared: preparedImage,
		"prepared foods": preparedImage,
		other: preparedImage,
	};

	return categoryMap[category.toLowerCase()] || preparedImage;
};

// Updated filter categories to match donation types
const FILTER_CATEGORIES = [
	{ key: "all", label: "All" },
	{ key: "fresh_produce", label: "Fresh Produce" },
	{ key: "dairy", label: "Dairy" },
	{ key: "meat", label: "Meat & Poultry" },
	{ key: "bakery", label: "Bakery" },
	{ key: "canned", label: "Canned Goods" },
	{ key: "prepared", label: "Prepared Foods" },
	{ key: "other", label: "Other" },
];

type RootStackParamList = {
	Home: undefined;
	Claim: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HomePageProps {
	onDonationSelect?: (donation: Donation) => void;
	setError: React.Dispatch<React.SetStateAction<string | null>>;
	error: string | null;
	donations?: [] | Donation[];
	onRetry: () => void;
	isLoading?: boolean;
}

const LoadingState = () => {
	return (
		<View style={styles.centerContainer}>
			<ActivityIndicator size="large" color={COLORS.primary} />
			<Text style={styles.loadingText}>Loading donations...</Text>
		</View>
	);
};

const ErrorState = ({
	error,
	onRetry,
}: {
	error: string;
	onRetry: () => void;
}) => {
	return (
		<View style={styles.centerContainer}>
			<Ionicons name="alert-circle" size={60} color={COLORS.error} />
			<Text style={styles.errorText}>{error}</Text>
			<TouchableOpacity style={styles.retryButton} onPress={onRetry}>
				<Text style={styles.retryButtonText}>Try Again</Text>
			</TouchableOpacity>
		</View>
	);
};

const EmptyState = () => {
	return (
		<View style={styles.centerContainer}>
			<Ionicons name="gift" size={80} color={COLORS.gray} />
			<Text style={styles.emptyTitle}>No Donations Available!</Text>
			<Text style={styles.emptySubtitle}>
				Check back later for new donations in your area
			</Text>
		</View>
	);
};

const DonationsScreen = ({
	error,
	setError,
	donations = [],
	onDonationSelect,
	onRetry,
	isLoading: externalLoading = false,
}: HomePageProps) => {
	const { user } = useAuth();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [donationModal, setDonationModal] = useState<Donation | null>(null);
	const [internalLoading, setInternalLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterCategory, setFilterCategory] = useState("all");
	const [sortBy, setSortBy] = useState("newest");
	const [showSortModal, setShowSortModal] = useState(false);

	// Use external loading prop or internal loading state
	const isLoading = externalLoading || internalLoading;

	const handleDonationDetail = useCallback(
		(donation: Donation) => {
			onDonationSelect?.(donation!);
			setIsModalOpen(false);
		},
		[onDonationSelect]
	);

	// Enhanced sort donations function with direction support
	const sortDonations = (donations: Donation[], sortKey: string) => {
		const sorted = [...donations];

		switch (sortKey) {
			case "newest":
				return sorted.sort(
					(a, b) =>
						new Date(b.cutoff_pickup_date).getTime() -
						new Date(a.cutoff_pickup_date).getTime()
				);
			case "oldest":
				return sorted.sort(
					(a, b) =>
						new Date(a.cutoff_pickup_date).getTime() -
						new Date(b.cutoff_pickup_date).getTime()
				);
			case "expiry_asc":
				return sorted.sort(
					(a, b) =>
						new Date(a.expiry).getTime() -
						new Date(b.expiry).getTime()
				);
			case "expiry_desc":
				return sorted.sort(
					(a, b) =>
						new Date(b.expiry).getTime() -
						new Date(a.expiry).getTime()
				);
			case "quantity_desc":
				return sorted.sort(
					(a, b) => b.available_quantity - a.available_quantity
				);
			case "quantity_asc":
				return sorted.sort(
					(a, b) => a.available_quantity - b.available_quantity
				);
			case "weight_desc":
				return sorted.sort(
					(a, b) => b.weight_per_unit - a.weight_per_unit
				);
			case "weight_asc":
				return sorted.sort(
					(a, b) => a.weight_per_unit - b.weight_per_unit
				);
			default:
				return sorted;
		}
	};

	// Helper function to get current sort label for display
	const getCurrentSortLabel = () => {
		const sortLabels: { [key: string]: string } = {
			newest: "Newest First",
			oldest: "Oldest First",
			expiry_asc: "Expiring Soon",
			expiry_desc: "Expiring Later",
			quantity_desc: "Most Available",
			quantity_asc: "Least Available",
			weight_desc: "Heaviest Items",
			weight_asc: "Lightest Items",
		};
		return sortLabels[sortBy] || "Sort";
	};

	const filteredAndSortedDonations = sortDonations(
		donations.filter((donation) => {
			if (Object.keys(donation).length === 0) {
				return false;
			}

			const foodCategory = donation.food_category;
			const donorName = donation.donor_name;
			const searchLower = searchQuery.toLowerCase();

			const match =
				foodCategory.toLowerCase().includes(searchLower) ||
				donorName.toLowerCase().includes(searchLower);

			const matchesCategory =
				filterCategory === "all" ||
				foodCategory.toLowerCase().includes(filterCategory) ||
				foodCategory
					.toLowerCase()
					.replace("_", " ")
					.includes(filterCategory) ||
				foodCategory
					.toLowerCase()
					.replace(" ", "_")
					.includes(filterCategory);

			return match && matchesCategory;
		}),
		sortBy
	);

	const handleRetry = useCallback(async () => {
		setInternalLoading(true);
		setError(null);
		try {
			await onRetry();
		} catch (err) {
			console.error("Retry failed:", err);
		} finally {
			setInternalLoading(false);
		}
	}, [onRetry, setError]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		setError(null);
		try {
			await onRetry();
		} catch (err) {
			console.error("Refresh failed:", err);
		} finally {
			setRefreshing(false);
		}
	}, [onRetry, setError]);

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.headerTop}>
						<Text style={styles.headerTitle}>
							Available Donations
						</Text>
						<TouchableOpacity
							style={styles.sortButton}
							onPress={() => setShowSortModal(true)}
							disabled={isLoading}>
							<Ionicons
								name="funnel-outline"
								size={20}
								color={COLORS.primary}
							/>
							<Text style={styles.sortButtonText}>
								{getCurrentSortLabel()}
							</Text>
							<Ionicons
								name="chevron-down"
								size={16}
								color={COLORS.primary}
							/>
						</TouchableOpacity>
					</View>

					{/* Filter buttons */}
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.filterContainer}>
						{FILTER_CATEGORIES.map((category) => (
							<TouchableOpacity
								key={category.key}
								style={[
									styles.filterButton,
									filterCategory === category.key &&
										styles.activeFilterButton,
								]}
								onPress={() => setFilterCategory(category.key)}
								disabled={isLoading}>
								<Text
									style={[
										styles.filterButtonText,
										filterCategory === category.key &&
											styles.activeFilterButtonText,
									]}>
									{category.label}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>

				{/* Content */}
				{isLoading ? (
					<LoadingState />
				) : error ? (
					<ErrorState error={error} onRetry={handleRetry} />
				) : filteredAndSortedDonations.length === 0 ? (
					<EmptyState />
				) : (
					<FlatList
						data={filteredAndSortedDonations}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<DonationCard
								donation={item}
								category_image={getCategoryImage(
									item.food_category
								)}
								on_claim={() => {
									handleDonationDetail(item);
								}}
							/>
						)}
						showsVerticalScrollIndicator={false}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={onRefresh}
								colors={[COLORS.primary]}
							/>
						}
						contentContainerStyle={styles.listContainer}
					/>
				)}
			</SafeAreaView>

			<DetailModal
				donation={donationModal}
				onClose={() => {
					setIsModalOpen(false);
				}}
				onClaim={handleDonationDetail}
				visible={isModalOpen}
			/>

			<SortModal
				visible={showSortModal}
				currentSort={sortBy}
				onSortChange={setSortBy}
				onClose={() => setShowSortModal(false)}
			/>
		</SafeAreaProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		padding: SIZES.medium,
		paddingBottom: SIZES.small,
		backgroundColor: COLORS.white,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	headerTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SIZES.small,
	},
	headerTitle: {
		fontSize: SIZES.large,
		fontFamily: FONT.bold,
		color: COLORS.primary,
		flex: 1,
	},
	sortButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: SIZES.small,
		paddingVertical: SIZES.xSmall,
		borderRadius: SIZES.small,
		borderWidth: 1,
		borderColor: COLORS.primary,
		backgroundColor: "transparent",
		maxWidth: 140,
	},
	sortButtonText: {
		color: COLORS.primary,
		fontSize: SIZES.xSmall,
		marginLeft: 4,
		marginRight: 4,
		fontWeight: "500",
		flex: 1,
		textAlign: "center",
	},
	filterContainer: {
		marginTop: SIZES.xSmall,
	},
	filterButton: {
		paddingHorizontal: SIZES.medium,
		paddingVertical: SIZES.small,
		marginRight: SIZES.small,
		borderRadius: 20,
		backgroundColor: "#f5f5f5",
		borderWidth: 1,
		borderColor: "transparent",
	},
	activeFilterButton: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	filterButtonText: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		fontWeight: "500",
	},
	activeFilterButtonText: {
		color: COLORS.white,
		fontWeight: "600",
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: SIZES.large,
	},
	loadingText: {
		marginTop: SIZES.medium,
		fontSize: SIZES.medium,
		color: COLORS.gray,
		textAlign: "center",
	},
	errorText: {
		fontSize: SIZES.medium,
		color: COLORS.error,
		textAlign: "center",
		marginVertical: SIZES.medium,
		lineHeight: 24,
	},
	retryButton: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: SIZES.large,
		paddingVertical: SIZES.medium,
		borderRadius: SIZES.small,
		marginTop: SIZES.small,
	},
	retryButtonText: {
		color: COLORS.white,
		fontSize: SIZES.medium,
		fontWeight: "600",
	},
	emptyTitle: {
		fontSize: SIZES.large,
		fontFamily: FONT.bold,
		color: COLORS.gray,
		marginTop: SIZES.medium,
		marginBottom: SIZES.small,
		textAlign: "center",
	},
	emptySubtitle: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		textAlign: "center",
		lineHeight: 22,
	},
	listContainer: {
		padding: SIZES.medium,
		paddingTop: SIZES.small,
	},
});

export default DonationsScreen;
