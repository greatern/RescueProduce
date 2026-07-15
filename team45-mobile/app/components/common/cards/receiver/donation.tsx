import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../../../assets/styles/receiver";
import { COLORS } from "../../../../constants";
import { Donation } from "../../../../service/receiver";

const backupImage =
	"https://www.shutterstock.com/image-vector/package-icon-trendy-modern-placeholder-260nw-1657310788.jpg";

interface CardProps {
	donation: Donation;
	category_image: any;
	on_claim: () => void;
}

export const formatTitle = (title: string) => {
	const split = title.split(/\s|_|-/);
	let words: string[] = [];
	for (const f of split) {
		words.push(f.charAt(0).toUpperCase() + f.slice(1));
	}
	return words.join(" ");
};

const formatDate = (dateString: string | Date) => {
	if (!dateString) return "Not specified";
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return "Invalid date";

	const now = new Date();
	const diffTime = date.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 0) return "Expired";
	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Tomorrow";
	if (diffDays <= 7) return `${diffDays} days`;

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
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
	if (daysLeft <= 1) return "#ff4444";
	if (daysLeft <= 3) return "#ff9800";
	return "#4CAF50";
};

const getUrgencyText = (expiryDate: string | Date) => {
	const daysLeft = getDaysUntilExpiry(expiryDate);
	if (daysLeft <= 0) return "Expired";
	if (daysLeft === 1) return "Expires today";
	if (daysLeft <= 3) return `${daysLeft} days left`;
	return "Available";
};

const DonationCard = ({ donation, on_claim, category_image }: CardProps) => {
	const urgencyColor = getUrgencyColor(donation.expiry);
	const urgencyText = getUrgencyText(donation.expiry);
	const totalWeight = donation.weight_per_unit;

	return (
		<View style={[styles.card, localStyle.cardContainer]}>
			<View style={[styles.imageContainer, localStyle.imageContainer]}>
				<Image
					source={category_image}
					style={styles.image}
					resizeMode="cover"
				/>
				<View
					style={[
						localStyle.statusBadge,
						{ backgroundColor: urgencyColor },
					]}>
					<Text style={localStyle.statusText}>{urgencyText}</Text>
				</View>
			</View>

			<View style={localStyle.contentContainer}>
				<Text style={localStyle.title}>{donation.title}</Text>

				<Text style={localStyle.donorName}>
					Donated by {donation.donor_name}
				</Text>

				{/* Quantity and Weight Info */}
				<View style={localStyle.statsRow}>
					<View style={localStyle.statItem}>
						<Ionicons
							name="cube-outline"
							size={16}
							color={COLORS.primary}
						/>
						<Text style={localStyle.statText}>
							{donation.available_quantity}{" "}
							{donation.available_quantity > 1 ? "boxes" : "box"}
						</Text>
					</View>
					<View style={localStyle.statItem}>
						<Ionicons
							name="barbell-outline"
							size={16}
							color={COLORS.primary}
						/>
						<Text style={localStyle.statText}>
							{totalWeight}kg/box
						</Text>
					</View>
				</View>

				{/* Expiry and Pickup Info */}
				<View style={localStyle.dateRow}>
					<View style={localStyle.dateItem}>
						<Ionicons name="time-outline" size={14} color="#666" />
						<Text style={localStyle.dateLabel}>Expires:</Text>
						<Text
							style={[
								localStyle.dateValue,
								{ color: urgencyColor },
							]}>
							{formatDate(donation.expiry)}
						</Text>
					</View>
					<View style={localStyle.dateItem}>
						<Ionicons
							name="calendar-outline"
							size={14}
							color="#666"
						/>
						<Text style={localStyle.dateLabel}>Pickup by:</Text>
						<Text style={localStyle.dateValue}>
							{formatDate(donation.cutoff_pickup_date)}
						</Text>
					</View>
				</View>

				{/* Description (if available) */}
				{donation.description && (
					<Text style={localStyle.description} numberOfLines={2}>
						{donation.description}
					</Text>
				)}

				<TouchableOpacity
					onPress={on_claim}
					style={localStyle.detailButton}>
					<Text style={localStyle.buttonText}>View Details</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const localStyle = StyleSheet.create({
	cardContainer: {
		marginBottom: 16,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		backgroundColor: "white",
	},
	imageContainer: {
		position: "relative",
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		overflow: "hidden",
		height: 160,
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
	contentContainer: {
		padding: 16,
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1a1a1a",
		marginBottom: 4,
		lineHeight: 24,
	},
	donorName: {
		fontSize: 14,
		color: "#666",
		marginBottom: 12,
		fontStyle: "italic",
	},
	statsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
		backgroundColor: "#f8f9fa",
		padding: 10,
		borderRadius: 8,
	},
	statItem: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	statText: {
		fontSize: 13,
		color: "#333",
		marginLeft: 6,
		fontWeight: "500",
	},
	dateRow: {
		marginBottom: 12,
	},
	dateItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
	},
	dateLabel: {
		fontSize: 12,
		color: "#666",
		marginLeft: 6,
		marginRight: 4,
		fontWeight: "500",
	},
	dateValue: {
		fontSize: 12,
		color: "#333",
		fontWeight: "600",
	},
	description: {
		fontSize: 14,
		color: "#555",
		lineHeight: 20,
		marginBottom: 16,
		backgroundColor: "#f8f9fa",
		padding: 10,
		borderRadius: 6,
		fontStyle: "italic",
	},
	detailButton: {
		backgroundColor: COLORS.primary,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: "center",
		elevation: 2,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default DonationCard;
