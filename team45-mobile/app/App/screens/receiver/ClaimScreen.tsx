import {
  Alert,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
	Dimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../constants";
import { StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Donation, receiverApi } from "../../../service/receiver";
import { useAuth } from "../../../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Dimensions } from "react-native";

interface ClaimProp {
	donation: Donation;
	item_image: any;
	onBack?: () => void;
	onClaimSuccess?: () => void;
}

const backupImage =
	"https://www.shutterstock.com/image-vector/package-icon-trendy-modern-placeholder-260nw-1657310788.jpg";

export const formatDate = (dateString: string | Date) => {
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
	return "Fresh";
};

const { width } = Dimensions.get("window");

const ClaimScreen = ({ donation, onBack, item_image }: ClaimProp) => {
	const [isClaiming, setIsClaiming] = useState(false);
	const [claimAmount, setClaimAmount] = useState("");
	const [procurementMethod, setProcurementMethod] = useState<
		"pickup" | "delivery" | null
	>(null);

  const { address, user } = useAuth();

  const handleMethodSelection = (method: "pickup" | "delivery") => {
    setProcurementMethod(method);
  };

  const handleClaim = async () => {
    if (address === null) {
      Alert.alert(
        "Address Invalid",
        `Please ensure you have uploaded your address, please go to "Profile -> Edit Address" to upload your address`,
        [{ text: "OK", onPress: () => {} }]
      );
      return;
    }

		Alert.alert(
			"Confirm",
			`You are about to claim ${claimAmount} ${
				parseInt(claimAmount) > 1 ? "boxes" : "box"
			} worth ${parseInt(claimAmount) * donation.weight_per_unit} kg`,
			[
				{
					text: "Cancel",
					style: "cancel",
					onPress: () => {
						return;
					},
				},
				{
					text: "Ok",
					style: "default",
					onPress: async () => {
						const requestForm = {
							listing_id: donation.id,
							receiver_id: user?.id!,
							claimed_quantity: parseInt(claimAmount),
							procurement_type: procurementMethod as
								| "delivery"
								| "pickup",
							distance: 0,
						};

            const response = await receiverApi.claim(requestForm);

						if (response.status === "success") {
							Alert.alert(
								"Claim Successful",
								`You have successfully claimed ${donation.food_category} via ${procurementMethod}. Please wait for further instructions`,
								[
									{
										text: "OK",
										onPress: () => {
											onBack && onBack();
										},
									},
								]
							);
						} else {
							Alert.alert(
								"Claim Error",
								`There was an error claiming: ${response.message}`
							);
						}
					},
				},
			]
		);

		setIsClaiming(false);
	};

  const isClaimButtonDisabled = !procurementMethod || !claimAmount || isClaiming;

	const urgencyColor = donation?.expiry
		? getUrgencyColor(donation.expiry)
		: "#4CAF50";
	const urgencyText = donation?.expiry
		? getUrgencyText(donation.expiry)
		: "Available";

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

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity
						style={styles.closeButton}
						onPress={onBack}
						disabled={isClaiming}>
						<Ionicons
							name="arrow-back-outline"
							size={24}
							color={COLORS.gray}
						/>
					</TouchableOpacity>
					<Text style={styles.modalTitle}>{donation.title}</Text>
				</View>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<ScrollView showsVerticalScrollIndicator={false}>
						<View style={styles.content}>
							<View style={styles.imageContainer}>
								<Image
									source={item_image}
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
  return (
    <SafeAreaProvider>
      <LinearGradient colors={["#e8f9e9", "#fffde7"]} style={styles.gradientBackground}>
        <SafeAreaView style={styles.container}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={isClaiming}>
                  <Ionicons name="arrow-back" size={24} color="#333" />
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Claim Donation</Text>
                <Text style={styles.headerSubtitle}>Claim your selected food donation</Text>
              </View>

              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: "https://placehold.co/600x400" }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>

              <BlurView intensity={90} tint="light" style={styles.contentSection}>
                <View style={styles.contentHeader}>
                  <Ionicons name="restaurant-outline" size={24} color="#333" style={styles.contentIcon} />
                  <Text style={styles.title}>
                    {donation.food_category.charAt(0).toLocaleUpperCase() + donation.food_category.slice(1)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Donor Name:</Text>
                  <Text style={styles.donorInfo}>{donation.donor_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.donorInfo}>{donation.description}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Expected Expiry:</Text>
                  <Text style={styles.donorInfo}>{formatDate(donation.expiry)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Distance:</Text>
                  <Text style={styles.donorInfo}>
                    {donation.distance_km ? donation.distance_km + "km away" : "N/A"}
                  </Text>
                </View>
              </BlurView>
							<View style={styles.quickStats}>
								<View style={styles.statItem}>
									<Text style={styles.statNumber}>
										{donation.available_quantity}
									</Text>
									<Text style={styles.statLabel}>Items</Text>
								</View>
								<View style={styles.statItem}>
									<Text style={styles.statNumber}>
										{donation.weight_per_unit}kg
									</Text>
									<Text style={styles.statLabel}>
										Per item
									</Text>
								</View>
								<View style={styles.statItem}>
									<Text style={styles.statNumber}>
										{Math.floor(
											donation.available_quantity *
												donation.weight_per_unit
										)}
										kg
									</Text>
									<Text style={styles.statLabel}>Total</Text>
								</View>
							</View>

							{donation.description && (
								<View style={styles.section}>
									<Text style={styles.sectionTitle}>
										Description
									</Text>
									<Text style={styles.description}>
										{donation.description}
									</Text>
								</View>
							)}

							<View style={styles.section}>
								<Text style={styles.sectionTitle}>Details</Text>
								<InfoRow
									icon="person-outline"
									label="Donated by"
									value={donation.donor_name}
								/>
								<InfoRow
									icon="time-outline"
									label="Expires"
									value={formatDate(donation.expiry)}
									color={urgencyColor}
								/>
								<InfoRow
									icon="calendar-outline"
									label="Pickup by"
									value={formatDate(
										donation.cutoff_pickup_date
									)}
								/>
							</View>

              <BlurView intensity={90} tint="light" style={styles.procurementSection}>
                <Text style={styles.sectionTitle}>Claim Amount</Text>
                <Text style={styles.sectionSubtitle}>
                  Available: {`${donation.available_quantity} boxes (1 = ${Math.ceil(donation.weight_per_unit)} kg)`}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Total Available: {Math.floor(donation.available_quantity * donation.weight_per_unit)} kg
                </Text>
                <Text style={styles.description}>Please enter the amount you would like to receive:</Text>
                <TextInput
                  style={styles.input}
                  inputMode="numeric"
                  keyboardType="number-pad"
                  value={claimAmount.toString()}
                  placeholder="e.g. 10 boxes"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  onPress={() => setClaimAmount("")}
                  onChangeText={(text) => {
                    setClaimAmount(text);
                  }}
                />
              </BlurView>

              <BlurView intensity={90} tint="light" style={styles.procurementSection}>
                <Text style={styles.sectionTitle}>Procurement Method</Text>
                <Text style={styles.sectionSubtitle}>Choose how you'd like to receive this!</Text>
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>
									Procurement Method
								</Text>
								<Text style={styles.sectionSubtitle}>
									Choose how you'd like to receive this:
								</Text>

                <TouchableOpacity
                  style={[styles.methodButton, procurementMethod === "pickup" && styles.methodButtonSelected]}
                  onPress={() => handleMethodSelection("pickup")}
                  disabled={isClaiming}
                >
                  <Ionicons
                    name="car"
                    size={24}
                    color={procurementMethod === "pickup" ? "#4CAF50" : "#555"}
                  />
                  <View style={styles.methodTextContainer}>
                    <Text style={styles.methodTitle}>Pick-Up</Text>
                    <Text style={styles.methodDescription}>Pick this item up yourself</Text>
                  </View>
                  <Ionicons
                    name={procurementMethod === "pickup" ? "checkmark-circle" : "radio-button-off"}
                    size= {20}
                    color={procurementMethod === "pickup" ? "#4CAF50" : "#555"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.methodButton, procurementMethod === "delivery" && styles.methodButtonSelected]}
                  onPress={() => handleMethodSelection("delivery")}
                  disabled={isClaiming}
                >
                  <Ionicons
                    name="bicycle"
                    size={24}
                    color={procurementMethod === "delivery" ? "#4CAF50" : "#555"}
                  />
                  <View style={styles.methodTextContainer}>
                    <Text style={styles.methodTitle}>Delivery</Text>
                    <Text style={styles.methodDescription}>Request a delivery for this item</Text>
                  </View>
                  <Ionicons
                    name={procurementMethod === "delivery" ? "checkmark-circle" : "radio-button-off"}
                    size={20}
                    color={procurementMethod === "delivery" ? "#4CAF50" : "#555"}
                  />
                </TouchableOpacity>
              </BlurView>
								<TouchableOpacity
									style={[
										styles.methodButton,
										procurementMethod === "delivery" &&
											styles.methodButtonSelected,
									]}
									onPress={() =>
										handleMethodSelection("delivery")
									}
									disabled={isClaiming}>
									<Ionicons
										name="bicycle"
										size={24}
										color={
											procurementMethod === "delivery"
												? COLORS.primary
												: COLORS.gray
										}
									/>
									<View style={styles.methodTextContainer}>
										<Text style={styles.methodTitle}>
											Delivery
										</Text>
										<Text style={styles.methodDescription}>
											Request a delivery for this item
										</Text>
									</View>
									<Ionicons
										name={
											procurementMethod === "delivery"
												? "checkmark-circle"
												: "radio-button-off"
										}
										size={20}
										color={
											procurementMethod === "delivery"
												? COLORS.primary
												: COLORS.gray
										}
									/>
								</TouchableOpacity>
							</View>
						</View>

              <View style={styles.claimButtonContainer}>
                <TouchableOpacity
                  style={[styles.claimButton, isClaimButtonDisabled && styles.claimButtonDisabled]}
                  onPress={handleClaim}
                  disabled={isClaimButtonDisabled}
                >
                  <LinearGradient
                    colors={isClaimButtonDisabled ? ["#ccc", "#ccc"] : ["#c8facc", "#fef9c3"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.claimButtonText}>{isClaiming ? "Claiming..." : "Claim"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  imageContainer: {
    width: width * 0.9,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 16,
  },
  contentSection: {
    width: width * 0.9,
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 16,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contentIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  detailRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
    marginBottom: 4,
  },
  donorInfo: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  procurementSection: {
    width: width * 0.9,
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    width: "50%",
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  methodButtonSelected: {
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "rgba(76,175,80,0.1)",
  },
  methodTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: "#555",
  },
  claimButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: "center",
  },
  claimButton: {
    width: width * 0.9,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  claimButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 16,
  },
  claimButtonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default ClaimScreen;