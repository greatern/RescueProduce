import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { COLORS, SIZES, FONT } from "../../../constants";
import {
	Alert,
	Image,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import { STATUS_MAP, Status } from "../../../constants/claim-statuses";
import { receiverApi, Task } from "../../../service/receiver";
import { useAuth } from "../../../contexts/AuthContext";
import PickupModal from "../../../components/common/modals/receiver/pickup_modal";
import { formatDate } from "./ClaimScreen";

interface TrackProps {
	onBack?: () => void;
}

const LoadingState = () => {
	return (
		<View style={styles.centerContainer}>
			<ActivityIndicator size="large" color={COLORS.primary} />
			<Text style={styles.loadingText}>Loading claims...</Text>
		</View>
	);
};

const ErrorState = ({ onRetry }: { onRetry: () => void }) => {
	return (
		<View style={styles.centerContainer}>
			<Ionicons
				name="alert-circle"
				size={60}
				color={COLORS.error || "#ff4444"}
			/>
			<Text style={styles.errorText}>Failed to load claims</Text>
			<TouchableOpacity style={styles.retryButton} onPress={onRetry}>
				<Text style={styles.retryButtonText}>Try Again</Text>
			</TouchableOpacity>
		</View>
	);
};

const TrackClaim = ({ onBack }: TrackProps) => {
	const [selectedFilter, setSelectedFilter] = useState("all");
	const [openModal, setOpenModal] = useState(false);
	const [confirmCode, setConfirmCode] = useState("");
	const [selectedTask, setSelectedTask] = useState<Task>();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const { user } = useAuth();

	const getStatusColor = (status: string) => {
		return STATUS_MAP[status]?.color || STATUS_MAP.default.color;
	};

	const getStatusText = (status: string) => {
		return STATUS_MAP[status]?.text || STATUS_MAP.default.text;
	};

	const filterDonations = () => {
		if (selectedFilter === "all") return tasks;
		return tasks.filter((x) => x.status === selectedFilter);
	};

	const handlePickup = async () => {
		try {
			const response = await receiverApi.confirmPickup(
				selectedTask?.id!,
				confirmCode
			);
			if (response.status === "success") {
				setOpenModal(false);
				Alert.alert("Success!", "Pickup Confirmed Successfully!");
				setTasks((prev) =>
					prev.filter((task) => task.id !== selectedTask?.id)
				);
			} else {
				Alert.alert("Error!", "Please try again later!");
			}
		} catch (error) {
			console.error("Error: ", error);
			Alert.alert(
				"Error!",
				"Failed to confirm pickup. Please try again."
			);
		}
	};

	const handleCancel = async (task: Task) => {
		let do_it = false;
		Alert.alert(
			"Cancel Claim",
			`Please confirm if you cancel the claim ${selectedTask?.id
				.slice(0, 6)
				.toUpperCase()}. This action cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Confirm",
					style: "destructive",
					onPress: async () => {
						setIsLoading(true);
						try {
							const response = await receiverApi.cancelTaks(
								task.id,
								user?.id!
							);
							if (response.status === "success") {
								Alert.alert(
									"Success",
									"Claim has been successfully cancelled"
								);
							} else {
								Alert.alert(
									"Unsuccessful",
									`${response.message}`
								);
							}
						} catch (error) {
							console.error("Error", error);
							Alert.alert(
								"Unsuccessful",
								`${JSON.stringify(error)}`
							);
						} finally {
							setIsLoading(false);
						}
					},
				},
			]
		);
	};

	const ClaimCard = ({ task }: { task: Task }) => {
		return (
			<View style={styles.claimCard}>
				<View style={styles.claimContent}>
					<View style={styles.claimHeader}>
						<Text style={styles.claimTitle}>{task.title}</Text>
						<View
							style={[
								styles.statusBadge,
								{
									backgroundColor: getStatusColor(
										task.status
									),
								},
							]}>
							<Text style={styles.statusText}>
								{getStatusText(task.status)}
							</Text>
						</View>
					</View>
					<View style={styles.detailsContainer}>
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>
								{task.description}
							</Text>
						</View>
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>
								ID: {task.id.slice(0, 6).toUpperCase()}
							</Text>
						</View>
						<View style={styles.detailRow}>
							<Text
								style={
									styles.detailLabel
								}>{`Distance: ${task.distance} km`}</Text>
						</View>
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>
								{`Pickup by: ${formatDate(task.due_date)}`}
							</Text>
						</View>
						<View style={styles.detailRow}>
							<Text style={styles.detailLabel}>
								Latest Pickup time:{" "}
								{task.latest_pickup_time?.slice(0, 5) ??
									"17:00"}
							</Text>
						</View>
					</View>
					<View style={styles.cardActions}>
						{task.status === "ready" && (
							<TouchableOpacity
								style={styles.primaryButton}
								onPress={() => {
									setOpenModal(true);
									setSelectedTask(task);
								}}>
								<Ionicons
									name="checkmark"
									size={16}
									color="white"
								/>
								<Text style={styles.primaryButtonText}>
									Collect
								</Text>
							</TouchableOpacity>
						)}

						{task.status === "pending" && (
							<TouchableOpacity
								style={styles.secondaryButton}
								onPress={() => {
									handleCancel(task);
								}}>
								<Ionicons
									name="close"
									size={16}
									color={COLORS.secondary}
								/>
								<Text style={styles.secondaryButtonText}>
									Cancel
								</Text>
							</TouchableOpacity>
						)}

						{task.status !== "pending" && task.can_cancel && (
							<TouchableOpacity
								style={styles.secondaryButton}
								onPress={() => {
									handleCancel(task);
								}}>
								<Ionicons name="close-circle" size={16} />
								<Text>Cancel</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
			</View>
		);
	};

	const getTasks = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await receiverApi.getTasks(user?.id!);
			if (response.status === "success") {
				setTasks(response.data!);
			} else {
				setError("Failed to load claims");
				setTasks([]);
			}
		} catch (error) {
			console.error("Error fetching tasks:", error);
			setError(
				"Error fetching claims. Please check your connection and try again."
			);
			setTasks([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRetry = async () => {
		await getTasks();
	};

	const onRefresh = async () => {
		setRefreshing(true);
		setError(null);
		try {
			await getTasks();
		} catch (err) {
			console.error("Refresh failed:", err);
		} finally {
			setRefreshing(false);
		}
	};

	useEffect(() => {
		getTasks();
	}, []);
	interface FilterProps {
		filter: string;
		label: string;
	}

	const FilterButton = ({ filter, label }: FilterProps) => {
		return (
			<TouchableOpacity
				style={[
					styles.filterButton,
					selectedFilter === filter && styles.filterButtonActive,
				]}
				onPress={() => setSelectedFilter(filter)}
				disabled={isLoading}>
				<Text
					style={[
						styles.filterButtonText,
						selectedFilter === filter &&
							styles.filterButtonTextActive,
					]}>
					{label}
				</Text>
			</TouchableOpacity>
		);
	};

	const EmptyState = () => {
		return (
			<View style={styles.emptyState}>
				<Ionicons name="reader-outline" size={64} color={COLORS.gray} />
				<Text style={styles.emptyStateText}>No claims found</Text>
				<Text style={styles.emptyStateSubtext}>
					Claims you make will appear here
				</Text>
			</View>
		);
	};

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<View style={styles.header}>
					{onBack && (
						<TouchableOpacity
							style={styles.backButton}
							onPress={onBack}>
							<Ionicons
								name="arrow-back"
								size={24}
								color={COLORS.primary}
							/>
							<Text style={styles.backText}>Back</Text>
						</TouchableOpacity>
					)}
					<Text style={styles.headerTitle}>Track Claims</Text>
				</View>

				<View style={styles.filterContainer}>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}>
						<FilterButton filter="all" label="All" />
						<FilterButton filter="pending" label="Pending" />
						<FilterButton filter="confirmed" label="Confirmed" />
						<FilterButton filter="ready" label="Ready" />
						<FilterButton filter="collected" label="Collected" />
					</ScrollView>
				</View>

				{isLoading ? (
					<LoadingState />
				) : error ? (
					<ErrorState onRetry={handleRetry} />
				) : (
					<ScrollView
						style={styles.claimsList}
						showsVerticalScrollIndicator={true}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={onRefresh}
								colors={[COLORS.primary]}
							/>
						}>
						{filterDonations().length > 0 ? (
							filterDonations().map((donation) => (
								<ClaimCard key={donation.id} task={donation} />
							))
						) : (
							<EmptyState />
						)}
					</ScrollView>
				)}

				<PickupModal
					title="Confirm Pickup"
					message="Please enter the confirmation code."
					onClose={() => {
						setOpenModal(false);
					}}
					onConfirm={handlePickup}
					setConfirmCode={setConfirmCode}
					visible={openModal}
				/>
			</SafeAreaView>
		</SafeAreaProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,

		backgroundColor: COLORS.lightWhite || "#f8f9fa",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		backgroundColor: COLORS.white || "#ffffff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	backButton: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 16,
	},
	backText: {
		marginLeft: 4,
		fontSize: 16,
		color: COLORS.primary || "#007AFF",
		fontWeight: "500",
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: SIZES?.xxLarge || 32,
	},
	loadingText: {
		marginTop: SIZES?.medium || 16,
		fontSize: SIZES?.medium || 14,
		color: COLORS.gray,
	},
	errorText: {
		fontSize: SIZES?.medium || 14,
		color: COLORS.error || "#ff4444",
		textAlign: "center",
		marginVertical: SIZES?.medium || 16,
	},
	retryButton: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: SIZES?.xLarge || 24,
		paddingVertical: SIZES?.small || 8,
		borderRadius: SIZES?.small || 8,
	},
	retryButtonText: {
		color: COLORS.white || "#ffffff",
		fontWeight: "bold",
	},
	detailsContainer: {
		flex: 1,
		marginTop: 8,
	},
	detailRow: {
		flex: 1,
		marginBottom: 4,
	},
	detailLabel: {
		fontSize: 14,
		fontWeight: "bold",
		color: COLORS.gray || "#666",
		width: "80%",
	},
	detailValue: {
		fontSize: 14,
		color: COLORS.black || "#333",
		width: "60%",
		textAlign: "right",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: COLORS.primary || "#333",
	},
	filterContainer: {
		backgroundColor: COLORS.white,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
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
		fontSize: 14,
		color: COLORS.primary,
		fontWeight: "500",
	},
	filterButtonTextActive: {
		color: "#ffffff",
	},
	claimsList: {
		flex: 1,
		padding: 16,
	},
	claimCard: {
		backgroundColor: COLORS.white,
		borderRadius: 12,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	claimImage: {
		width: "100%",
		height: 120,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
	},
	claimContent: {
		padding: 16,
	},
	claimHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 8,
	},
	claimTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: COLORS.primary || "#333",
		flex: 1,
		marginRight: 8,
	},
	statusBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		fontSize: 12,
		color: "#ffffff",
		fontWeight: "500",
	},
	donorName: {
		fontSize: 14,
		color: COLORS.gray || "#666",
		marginBottom: 4,
	},
	distance: {
		fontSize: 14,
		color: COLORS.gray || "#666",
		marginBottom: 4,
	},
	claimDate: {
		fontSize: 14,
		color: COLORS.gray || "#666",
		marginBottom: 4,
	},
	pickupDate: {
		fontSize: 14,
		color: COLORS.primary || "#007AFF",
		fontWeight: "500",
		marginBottom: 12,
	},
	cardActions: {
		flexDirection: "row",
		gap: 8,
	},
	primaryButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.primary || "#007AFF",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		gap: 4,
	},
	primaryButtonText: {
		color: "#ffffff",
		fontSize: 14,
		fontWeight: "500",
	},
	secondaryButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#ff4444",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		gap: 4,
	},
	secondaryButtonText: {
		color: "#ffffff",
		fontSize: 14,
		fontWeight: "500",
	},
	outlineButton: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: COLORS.primary || "#007AFF",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		gap: 4,
	},
	outlineButtonText: {
		color: COLORS.primary || "#007AFF",
		fontSize: 14,
		fontWeight: "500",
	},
	emptyState: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 64,
	},
	emptyStateText: {
		fontSize: 18,
		fontWeight: "bold",
		color: COLORS.gray || "#666",
		marginTop: 16,
		marginBottom: 8,
	},
	emptyStateSubtext: {
		fontSize: 14,
		color: COLORS.gray || "#666",
		textAlign: "center",
	},
});

export default TrackClaim;
