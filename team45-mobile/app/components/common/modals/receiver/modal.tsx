import {
	Modal,
	StyleSheet,
	View,
	Text,
	Image,
	TouchableOpacity,
	ScrollView,
	Alert,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../../constants";
import { Donation } from "../../../../service/receiver";
import { formatTitle } from "../../cards/receiver/donation";

const backupImage =
	"https://www.shutterstock.com/image-vector/package-icon-trendy-modern-placeholder-260nw-1657310788.jpg";

interface DetailModalProps {
	visible: boolean;
	onClose: () => void;
	onClaim: (donation: Donation) => void;
	donation: Donation | null;
}

const { width, height } = Dimensions.get("window");
console.log("Height:", height);

const formatDate = (dateString: string | Date) => {
	if (!dateString) return "Not specified";
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "Invalid date";

	return date.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

const formatTime = (dateString: string | Date) => {
	if (!dateString) return "Not specified";
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "Invalid date";

	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getDaysUntilExpiry = (expiryDate: string | Date) => {
	if (!expiryDate) return 999;
	const now = new Date();
	const expiry = new Date(expiryDate);
	if (isNaN(expiry.getTime())) return 999;

	const diffTime = expiry.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
};

const getUrgencyColor = (expiryDate: string | Date) => {
	const daysLeft = getDaysUntilExpiry(expiryDate);
	if (daysLeft <= 1) return "#ff4444"; // Red - urgent
	if (daysLeft <= 3) return "#ff9800"; // Orange - soon
	return "#4CAF50"; // Green - good
};

const getUrgencyText = (expiryDate: string | Date) => {
	const daysLeft = getDaysUntilExpiry(expiryDate);
	if (daysLeft <= 0) return "Expired";
	if (daysLeft === 1) return "Expires today";
	if (daysLeft <= 3) return `${daysLeft} days left`;
	return "Fresh";
};

const DetailModal = ({
	visible,
	donation,
	onClose,
	onClaim,
}: DetailModalProps) => {
	if (!donation && !visible) {
		return null;
	}

	const handleClaim = () => {
		const daysLeft = donation?.expiry
			? getDaysUntilExpiry(donation.expiry)
			: 999;
		const urgencyMessage =
			daysLeft <= 1
				? "This food expires soon! Are you sure you can collect it in time?"
				: `Are you sure you want to claim this ${donation?.food_category}?`;

		Alert.alert("Confirm Claim", urgencyMessage, [
			{
				text: "Cancel",
				style: "cancel",
			},
			{
				text: "Claim",
				style: daysLeft <= 1 ? "destructive" : "default",
				onPress: () => onClaim(donation!),
			},
		]);
	};

	const InfoRow = ({
		icon,
		label,
		value,
		color,
	}: {
		icon: string;
		label: string;
		value: string | number;
		color?: string;
	}) => (
		<View style={styles.infoRow}>
			<Ionicons
				name={icon as any}
				size={20}
				color={color || COLORS.primary}
			/>
			<View style={styles.infoContent}>
				<Text style={styles.infoLabel}>{label}</Text>
				<Text style={[styles.infoValue, color && { color }]}>
					{value}
				</Text>
			</View>
		</View>
	);

	// Safe property access with fallbacks
	const urgencyColor = donation?.expiry
		? getUrgencyColor(donation.expiry)
		: "#4CAF50";
	const urgencyText = donation?.expiry
		? getUrgencyText(donation.expiry)
		: "Available";

	const availableQuantity = donation?.available_quantity ?? 0;
	const weightPerUnit = donation?.weight_per_unit ?? 0;
	const distanceKm = 0;
	const donorName = donation?.donor_name || "Anonymous";
	const description = donation?.description;
	const expiry = donation?.expiry;
	const cutoffPickupDate = donation?.cutoff_pickup_date;

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={styles.modalContainer}>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.modalTitle}>
							{donation
								? formatTitle(
										donation.food_category || "Food Item"
								  )
								: "Food Details"}
						</Text>
						<TouchableOpacity
							style={styles.closeButton}
							onPress={onClose}>
							<Ionicons
								name="close"
								size={24}
								color={COLORS.gray}
							/>
						</TouchableOpacity>
					</View>

					{/* Content */}
					<ScrollView
						style={styles.content}
						showsVerticalScrollIndicator={false}
						bounces={false}>
						{/* Image */}
						<View style={styles.imageContainer}>
							<Image
								source={{ uri: backupImage }}
								style={styles.image}
								resizeMode="cover"
							/>
							<View
								style={[
									styles.statusBadge,
									{ backgroundColor: urgencyColor },
								]}>
								<Text style={styles.statusText}>
									{urgencyText}
								</Text>
							</View>
						</View>

						{/* Quick Stats */}
						<View style={styles.quickStats}>
							<View style={styles.statItem}>
								<Text style={styles.statNumber}>
									{availableQuantity}
								</Text>
								<Text style={styles.statLabel}>Items</Text>
							</View>
							<View style={styles.statItem}>
								<Text style={styles.statNumber}>
									{weightPerUnit}kg
								</Text>
								<Text style={styles.statLabel}>Per item</Text>
							</View>
							<View style={styles.statItem}>
								<Text style={styles.statNumber}>
									{distanceKm ? `${distanceKm}km` : "Near"}
								</Text>
								<Text style={styles.statLabel}>Distance</Text>
							</View>
						</View>

						{/* Description */}
						{description && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>
									Description
								</Text>
								<Text style={styles.description}>
									{description}
								</Text>
							</View>
						)}

						{/* Details */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Details</Text>
							<InfoRow
								icon="person-outline"
								label="Donated by"
								value={donorName}
							/>
							<InfoRow
								icon="location-outline"
								label="Distance"
								value={
									distanceKm
										? `${distanceKm} km away`
										: "Distance not available"
								}
							/>
							{expiry && (
								<InfoRow
									icon="time-outline"
									label="Expires"
									value={formatDate(expiry)}
									color={urgencyColor}
								/>
							)}
							{cutoffPickupDate && (
								<InfoRow
									icon="calendar-outline"
									label="Pickup by"
									value={formatTime(cutoffPickupDate)}
								/>
							)}
						</View>

						{/* Debug Section - Remove this in production */}
						{__DEV__ && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>
									Debug Info
								</Text>
								<Text style={styles.debugText}>
									{JSON.stringify(donation, null, 2)}
								</Text>
							</View>
						)}
					</ScrollView>

					{/* Action Buttons */}
					<View style={styles.actionContainer}>
						<TouchableOpacity
							style={[styles.button, styles.cancelButton]}
							onPress={onClose}>
							<Text
								style={[
									styles.buttonText,
									styles.cancelButtonText,
								]}>
								Cancel
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.button, styles.claimButton]}
							onPress={handleClaim}>
							<Ionicons
								name="checkmark"
								size={20}
								color="white"
							/>
							<Text style={styles.buttonText}>Claim Food</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default DetailModal;

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	modalContainer: {
		backgroundColor: COLORS.white,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: height * 0.9,
		paddingBottom: 20,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: COLORS.primary,
		flex: 1,
	},
	closeButton: {
		padding: 4,
	},
	content: {
		paddingHorizontal: 20,
	},
	imageContainer: {
		position: "relative",
		marginVertical: 16,
		borderRadius: 12,
		overflow: "hidden",
	},
	image: {
		width: "100%",
		height: 200,
		borderRadius: 12,
	},
	statusBadge: {
		position: "absolute",
		top: 12,
		right: 12,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		color: "white",
		fontSize: 12,
		fontWeight: "600",
	},
	quickStats: {
		flexDirection: "row",
		justifyContent: "space-around",
		backgroundColor: "#f8f9fa",
		borderRadius: 12,
		padding: 16,
		marginBottom: 20,
	},
	statItem: {
		alignItems: "center",
	},
	statNumber: {
		fontSize: 18,
		fontWeight: "bold",
		color: COLORS.primary,
	},
	statLabel: {
		fontSize: 12,
		color: "#666",
		marginTop: 4,
	},
	section: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.primary,
		marginBottom: 12,
	},
	description: {
		fontSize: 15,
		lineHeight: 22,
		color: "#333",
		backgroundColor: "#f8f9fa",
		padding: 12,
		borderRadius: 8,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#f5f5f5",
	},
	infoContent: {
		marginLeft: 12,
		flex: 1,
	},
	infoLabel: {
		fontSize: 12,
		color: "#666",
		textTransform: "uppercase",
		fontWeight: "500",
	},
	infoValue: {
		fontSize: 15,
		color: "#333",
		fontWeight: "500",
		marginTop: 2,
	},
	actionContainer: {
		flexDirection: "row",
		paddingHorizontal: 20,
		paddingTop: 16,
		gap: 12,
		borderTopWidth: 1,
		borderTopColor: "#f0f0f0",
	},
	button: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		borderRadius: 12,
		gap: 6,
	},
	claimButton: {
		backgroundColor: COLORS.secondary,
	},
	cancelButton: {
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: COLORS.gray,
	},
	buttonText: {
		color: COLORS.white,
		fontWeight: "600",
		fontSize: 16,
	},
	cancelButtonText: {
		color: COLORS.gray,
	},
	debugText: {
		fontSize: 10,
		fontFamily: "monospace",
		backgroundColor: "#f0f0f0",
		padding: 8,
		borderRadius: 4,
	},
});
