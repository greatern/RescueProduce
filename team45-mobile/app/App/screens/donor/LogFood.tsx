import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Alert,
	Dimensions,
	Animated,
	Modal,
	Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES } from "../../../constants";
import donorApi from "../../../service/donor";
import { SafeAreaProvider } from "react-native-safe-area-context";

export interface donorDonation {
	foodCategory: string;
	quantity: number;
	quantityUnit: string;
	units: number;
	expiryDate: string;
	storageReq: string;
	pickupDate: string;
	pickupTime: string;
	specialInstructions: string;
}

type RootParamList = {
	Home: { mission?: string };
	Login: undefined;
	DonorDashboard: undefined;
	LogFood: undefined;
	DonationHistory: undefined;
};

type NavigationProp = DrawerNavigationProp<RootParamList>;

const { width } = Dimensions.get("window");

const LogFood = () => {
	const navigation = useNavigation<NavigationProp>();
	const cardScale = useRef(new Animated.Value(0)).current;
	const buttonScale = useRef(new Animated.Value(0)).current;

	const [foodCategory, setFoodCategory] = useState("");
	const [quantity, setQuantity] = useState("");
	const [quantityUnit, setQuantityUnit] = useState("kg");
	const [units, setUnits] = useState("");
	const [expiryDate, setExpiryDate] = useState("");
	const [storageReq, setStorageReq] = useState("");
	const [pickupDate, setPickupDate] = useState("");
	const [pickupTime, setPickupTime] = useState("");
	const [specialInstructions, setSpecialInstructions] = useState("");

	const [showFoodCategoryDropdown, setShowFoodCategoryDropdown] =
		useState(false);
	const [showQuantityUnitDropdown, setShowQuantityUnitDropdown] =
		useState(false);
	const [showStorageReqDropdown, setShowStorageReqDropdown] = useState(false);
	const [showPickupTimeDropdown, setShowPickupTimeDropdown] = useState(false);

	useEffect(() => {
		Animated.spring(cardScale, {
			toValue: 1,
			useNativeDriver: true,
		}).start();
	}, []);

	const animatedCardStyle = {
		transform: [{ scale: cardScale }],
	};

	const animatedButtonStyle = {
		transform: [{ scale: buttonScale }],
	};

	const handlePressIn = () => {
		Animated.spring(buttonScale, {
			toValue: 0.95,
			useNativeDriver: true,
		}).start();
	};

	const handlePressOut = () => {
		Animated.spring(buttonScale, {
			toValue: 0.95,
			useNativeDriver: true,
		}).start();
	};

	const toggleFoodCategoryDropdown = () => {
		setShowFoodCategoryDropdown(!showFoodCategoryDropdown);
		setShowQuantityUnitDropdown(false);
		setShowStorageReqDropdown(false);
		setShowPickupTimeDropdown(false);
	};

	const toggleQuantityUnitDropdown = () => {
		setShowQuantityUnitDropdown(!showQuantityUnitDropdown);
		setShowFoodCategoryDropdown(false);
		setShowStorageReqDropdown(false);
		setShowPickupTimeDropdown(false);
	};

	const toggleStorageReqDropdown = () => {
		setShowStorageReqDropdown(!showStorageReqDropdown);
		setShowFoodCategoryDropdown(false);
		setShowQuantityUnitDropdown(false);
		setShowPickupTimeDropdown(false);
	};

	const togglePickupTimeDropdown = () => {
		setShowPickupTimeDropdown(!showPickupTimeDropdown);
		setShowFoodCategoryDropdown(false);
		setShowQuantityUnitDropdown(false);
		setShowStorageReqDropdown(false);
	};

	const handleSubmit = async () => {
		if (!foodCategory) {
			Alert.alert("Error", "Please select a food category.");
			return;
		}
		if (!quantity || parseFloat(quantity) <= 0) {
			Alert.alert("Error", "Please enter a valid quantity.");
			return;
		}
		if (!units || parseFloat(units) <= 0) {
			Alert.alert("Error", "Please enter a valid number of units.");
			return;
		}
		if (!expiryDate) {
			Alert.alert("Error", "Please select an expiry date.");
			return;
		}
		if (!storageReq) {
			Alert.alert("Error", "Please select storage requirements.");
			return;
		}
		if (!pickupDate) {
			Alert.alert("Error", "Please select a pickup date.");
			return;
		}
		if (!pickupTime) {
			Alert.alert("Error", "Please select a pickup time window.");
			return;
		}

		const donationData: donorDonation = {
			foodCategory,
			quantity: parseFloat(quantity),
			quantityUnit,
			units: parseFloat(units),
			expiryDate,
			storageReq,
			pickupDate,
			pickupTime,
			specialInstructions,
		};

		try {
			const token = await AsyncStorage.getItem("userToken");
			if (!token) {
				Alert.alert("Error", "No auth token found. Please log in.");
				return;
			}
			const success = await donorApi.postDonation(donationData);
			if (success) {
				Alert.alert("Success", "Donation submitted successfully!", [
					{
						text: "OK",
						onPress: () => navigation.navigate("DonorDashboard"),
					},
				]);
				setFoodCategory("");
				setQuantity("");
				setQuantityUnit("kg");
				setUnits("");
				setExpiryDate("");
				setStorageReq("");
				setPickupDate("");
				setPickupTime("");
				setSpecialInstructions("");
			} else {
				Alert.alert("Error", "Failed to log food.");
			}
		} catch (error) {
			console.error("Log food error:", error);
			Alert.alert("Error", "An error occurred while logging food");
		}
	};

	const handleCancel = () => {
		navigation.navigate("DonorDashboard");
	};

	const foodCategoryOptions = [
		{ label: "Select category", value: "" },
		{ label: "Fresh Produce", value: "fresh_produce" },
		{ label: "Dairy Products", value: "dairy" },
		{ label: "Meat & Poultry", value: "meat" },
		{ label: "Bakery Items", value: "bakery" },
		{ label: "Canned Goods", value: "canned" },
		{ label: "Dry Goods", value: "dry_goods" },
		{ label: "Prepared Foods", value: "prepared" },
		{ label: "Other", value: "other" },
	];

	const quantityUnitOptions = [
		{ label: "Select unit", value: "" },
		{ label: "kg", value: "kg" },
		{ label: "liters", value: "liters" },
	];

	const storageReqOptions = [
		{ label: "Select requirements", value: "" },
		{ label: "Ambient Temperature", value: "ambient" },
		{ label: "Refrigerated (2-8°C)", value: "refrigerated" },
		{ label: "Frozen (-18°C or below)", value: "frozen" },
	];

	const pickupTimeOptions = [
		{ label: "Select time window", value: "" },
		{ label: "Morning (8am-12pm)", value: "morning" },
		{ label: "Afternoon (12pm-4pm)", value: "afternoon" },
		{ label: "Evening (4pm-8pm)", value: "evening" },
	];

	const getFoodCategoryDisplay = () => {
		const option = foodCategoryOptions.find(
			(opt) => opt.value === foodCategory
		);
		return option ? option.label : "Select category";
	};

	const getQuantityUnitDisplay = () => {
		const option = quantityUnitOptions.find(
			(opt) => opt.value === quantityUnit
		);
		return option ? option.label : "Select unit";
	};

	const getStorageReqDisplay = () => {
		const option = storageReqOptions.find(
			(opt) => opt.value === storageReq
		);
		return option ? option.label : "Select requirements";
	};

	const getPickupTimeDisplay = () => {
		const option = pickupTimeOptions.find(
			(opt) => opt.value === pickupTime
		);
		return option ? option.label : "Select time window";
	};

	const renderDropdownModal = (
		visible: boolean,
		options: { label: string; value: string }[],
		onSelect: (value: string) => void,
		onClose: () => void
	) => {
		return (
			<Modal
				visible={visible}
				transparent
				animationType="fade"
				onRequestClose={onClose}>
				<Pressable style={styles.modalOverlay} onPress={onClose}>
					<View style={styles.modalContent}>
						<ScrollView>
							{options.map((option) => (
								<Pressable
									key={option.value}
									style={({ pressed }) => [
										styles.dropdownItem,
										pressed && styles.dropdownItemPressed,
									]}
									onPress={() => {
										onSelect(option.value);
										onClose();
									}}>
									<Text style={styles.dropdownText}>
										{option.label}
									</Text>
								</Pressable>
							))}
						</ScrollView>
					</View>
				</Pressable>
			</Modal>
		);
	};

	return (
		<SafeAreaProvider>
			<LinearGradient
				colors={["#f5f7fa", "#8fb18bff"]}
				style={styles.gradientBackground}>
				<SafeAreaView style={styles.container}>
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollContent}>
						<View style={styles.header}>
							<View>
								<Text style={styles.headerTitle}>
									{" "}
									Log Food Donation
								</Text>
								<Text style={styles.headerSubtitle}>
									{" "}
									Enter details of your food donation
								</Text>
							</View>
							<TouchableOpacity
								onPress={() =>
									navigation.navigate("DonorDashboard")
								}
								style={styles.backButton}>
								<Ionicons
									name="arrow-back"
									size={24}
									color={COLORS.primary}
								/>
							</TouchableOpacity>
						</View>

						{/* Form Card */}
						<Animated.View style={[styles.card, animatedCardStyle]}>
							<View style={styles.cardHeader}>
								<Ionicons
									name="restaurant-outline"
									size={24}
									color={COLORS.primary}
								/>
								<Text style={styles.cardHeaderText}>
									Donation Details
								</Text>
							</View>

							<View style={styles.section}>
								<Text style={styles.sectionTitle}>
									Food Information
								</Text>

								<View style={styles.formGroup}>
									<Text style={styles.label}>
										Food Category*
									</Text>
									<Pressable
										onPress={toggleFoodCategoryDropdown}
										style={styles.dropdownTrigger}>
										<Text
											style={styles.dropdownTriggerText}>
											{getFoodCategoryDisplay()}
										</Text>
										<Ionicons
											name={
												showFoodCategoryDropdown
													? "chevron-up"
													: "chevron-down"
											}
											size={20}
											color={COLORS.primary}
										/>
									</Pressable>
									{renderDropdownModal(
										showFoodCategoryDropdown,
										foodCategoryOptions,
										setFoodCategory,
										toggleFoodCategoryDropdown
									)}
								</View>

								<View style={styles.formRow}>
									<View
										style={[styles.formGroup, { flex: 2 }]}>
										<Text style={styles.label}>
											Quantity per unit*
										</Text>
										<View style={styles.quantityInput}>
											<TextInput
												style={styles.input}
												placeholder="Quantity"
												value={quantity}
												onChangeText={setQuantity}
												keyboardType="numeric"
												placeholderTextColor={
													COLORS.gray
												}
											/>
											<Pressable
												onPress={
													toggleQuantityUnitDropdown
												}
												style={styles.unitDropdown}>
												<Text
													style={
														styles.dropdownTriggerText
													}>
													{getQuantityUnitDisplay()}
												</Text>
												<Ionicons
													name={
														showQuantityUnitDropdown
															? "chevron-up"
															: "chevron-down"
													}
													size={20}
													color={COLORS.primary}
												/>
											</Pressable>
											{renderDropdownModal(
												showQuantityUnitDropdown,
												quantityUnitOptions,
												setQuantityUnit,
												toggleQuantityUnitDropdown
											)}
										</View>
									</View>
									<View
										style={[styles.formGroup, { flex: 1 }]}>
										<Text style={styles.label}>Units*</Text>
										<TextInput
											style={styles.input}
											placeholder="Units"
											value={units}
											onChangeText={setUnits}
											keyboardType="numeric"
											placeholderTextColor={COLORS.gray}
										/>
									</View>
								</View>
								<View style={styles.formRow}>
									<View style={styles.formGroup}>
										<Text style={styles.label}>
											Expiry Date*
										</Text>
										<TextInput
											style={styles.input}
											placeholder="YYYY-MM-DD"
											value={expiryDate}
											onChangeText={setExpiryDate}
											placeholderTextColor={COLORS.gray}
										/>
									</View>
									<View style={styles.formGroup}>
										<Text style={styles.label}>
											Storage Requirements*
										</Text>
										<Pressable
											onPress={toggleStorageReqDropdown}
											style={styles.dropdownTrigger}>
											<Text
												style={
													styles.dropdownTriggerText
												}>
												{getStorageReqDisplay()}
											</Text>
											<Ionicons
												name={
													showStorageReqDropdown
														? "chevron-up"
														: "chevron-down"
												}
												size={20}
												color={COLORS.primary}
											/>
										</Pressable>
										{renderDropdownModal(
											showStorageReqDropdown,
											storageReqOptions,
											setStorageReq,
											toggleStorageReqDropdown
										)}
									</View>
								</View>
							</View>

							{/* Collection Details Section */}
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>
									Collection Details
								</Text>

								<View style={styles.formRow}>
									<View style={styles.formGroup}>
										<Text style={styles.label}>
											Pickup Date*
										</Text>
										<TextInput
											style={styles.input}
											placeholder="YYYY-MM-DD"
											value={pickupDate}
											onChangeText={setPickupDate}
											placeholderTextColor={COLORS.gray}
										/>
									</View>
									<View style={styles.formGroup}>
										<Text style={styles.label}>
											Pickup Time Window*
										</Text>
										<Pressable
											onPress={togglePickupTimeDropdown}
											style={styles.dropdownTrigger}>
											<Text
												style={
													styles.dropdownTriggerText
												}>
												{getPickupTimeDisplay()}
											</Text>
											<Ionicons
												name={
													showPickupTimeDropdown
														? "chevron-up"
														: "chevron-down"
												}
												size={20}
												color={COLORS.primary}
											/>
										</Pressable>
										{renderDropdownModal(
											showPickupTimeDropdown,
											pickupTimeOptions,
											setPickupTime,
											togglePickupTimeDropdown
										)}
									</View>
								</View>

								<View style={styles.formGroup}>
									<Text style={styles.label}>
										Special Instructions
									</Text>
									<TextInput
										style={[styles.input, styles.textArea]}
										placeholder="Any special instructions for collection"
										value={specialInstructions}
										onChangeText={setSpecialInstructions}
										multiline
										numberOfLines={4}
										placeholderTextColor={COLORS.gray}
									/>
								</View>
							</View>

							<View style={styles.buttonContainer}>
								<TouchableOpacity
									onPressIn={handlePressIn}
									onPressOut={handlePressOut}
									onPress={handleCancel}
									style={styles.secondaryButton}>
									<Text style={styles.secondaryButtonText}>
										Cancel
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPressIn={handlePressIn}
									onPressOut={handlePressOut}
									onPress={handleSubmit}
									style={styles.primaryButton}>
									<LinearGradient
										colors={[COLORS.orange, "#e48619ff"]}
										style={styles.buttonGradient}>
										<Text style={styles.primaryButtonText}>
											Submit Donation
										</Text>
										<Ionicons
											name="arrow-forward"
											size={20}
											color={COLORS.white}
										/>
									</LinearGradient>
								</TouchableOpacity>
							</View>
						</Animated.View>
					</ScrollView>
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
	scrollContent: {
		paddingBottom: SIZES.large,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SIZES.large,
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
	card: {
		backgroundColor: COLORS.white,
		borderRadius: 12,
		padding: SIZES.large,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SIZES.large,
		paddingBottom: SIZES.medium,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	cardHeaderText: {
		fontSize: SIZES.large,
		fontWeight: "600",
		color: COLORS.primary,
		marginLeft: SIZES.small,
	},
	section: {
		marginBottom: SIZES.xLarge,
	},
	sectionTitle: {
		fontSize: SIZES.medium,
		fontWeight: "600",
		color: COLORS.primary,
		marginBottom: SIZES.medium,
	},
	formRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: SIZES.medium,
	},
	formGroup: {
		marginBottom: SIZES.medium,
	},
	label: {
		fontSize: SIZES.small,
		fontWeight: "500",
		color: COLORS.primary,
		marginBottom: SIZES.small,
	},
	input: {
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
		padding: SIZES.medium,
		fontSize: SIZES.small,
		color: COLORS.primary,
		borderWidth: 1,
		borderColor: "#e9ecef",
	},
	textArea: {
		height: 100,
		textAlignVertical: "top",
	},
	quantityInput: {
		flexDirection: "row",
		alignItems: "center",
	},
	unitDropdown: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
		padding: SIZES.medium,
		borderWidth: 1,
		borderColor: "#e9ecef",
		marginLeft: SIZES.small,
		flex: 1,
	},
	dropdownTrigger: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
		padding: SIZES.medium,
		borderWidth: 1,
		borderColor: "#e9ecef",
	},
	dropdownTriggerText: {
		fontSize: SIZES.small,
		color: COLORS.primary,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		backgroundColor: COLORS.white,
		borderRadius: 12,
		width: "80%",
		maxHeight: "60%",
		padding: SIZES.medium,
	},
	dropdownItem: {
		paddingVertical: SIZES.medium,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	dropdownItemPressed: {
		backgroundColor: "#f8f9fa",
	},
	dropdownText: {
		fontSize: SIZES.small,
		color: COLORS.primary,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: SIZES.large,
	},
	primaryButton: {
		flex: 1,
		borderRadius: 8,
		overflow: "hidden",
		marginLeft: SIZES.small,
	},
	buttonGradient: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: SIZES.medium,
	},
	primaryButtonText: {
		color: COLORS.white,
		fontSize: SIZES.small,
		fontWeight: "600",
		marginRight: SIZES.small,
	},
	secondaryButton: {
		flex: 1,
		backgroundColor: COLORS.white,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: COLORS.primary,
		padding: SIZES.medium,
		marginRight: SIZES.small,
		alignItems: "center",
	},
	secondaryButtonText: {
		color: COLORS.primary,
		fontSize: SIZES.small,
		fontWeight: "600",
	},
});

export default LogFood;
