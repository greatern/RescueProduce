import { useNavigation } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mapApi, Prediction, Region } from "../../../service/map";
import {
	Alert,
	FlatList,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { COLORS, FONT, SHADOWS, SIZES } from "../../../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { userApi } from "../../../service/user";
import { useAddressForm, useAddressSearch } from "../../../hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Address {
	place_id: string;
	user_id: string;
	address_line1: string;
	address_line2: string;
	city: string;
	province: string;
	country: string;
	latitude: number;
	longitude: number;
}

const EditAddress = () => {
	const navigation = useNavigation();
	const [error, setError] = useState("");
	const { user, address, setAddress } = useAuth();

	const [region, setRegion] = useState<Region>({
		latitude: -26.184,
		longitude: 27.996,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
	});

	const getAddress = async (id: string) => {
		try {
			const response = await userApi.getAddress(id);
			if (response.status === "success") {
				updateFormData(response.data);
				setAddress(response.data);
			}
		} catch (error) {
			setError("Could not find user address");
		}
	};

	useEffect(() => {
		//console.log("Address", address);
		if (!address && user) {
			getAddress(user?.id!);
			return;
		}
		updateFormData(address);
	}, []);

	const {
		formData,
		errors,
		isSaving,
		updateField,
		updateFormData,
		saveAddress,
	} = useAddressForm({
		onSuccess: () => {
			console.log("Address saved Successfully");
			navigation.goBack();
		},
		onError: (error) => {
			console.error("Failed to save address", error);
		},
	});

	const {
		searchText,
		setSearchText,
		predictions,
		showSuggestions,
		handlePlaceSelect,
		setShowSuggestions,
		clearSearch,
		isSearching,
	} = useAddressSearch({
		onPlaceSelect: (formData, region) => {
			updateFormData({
				...formData,
				place_id: formData.place_id || "",
			});
			console.log("Form data with place_id:", formData);
			setRegion(region);
		},
	});

	const handleSuggestionPress = useCallback(
		(place_id: string) => {
			handlePlaceSelect(place_id);
			setShowSuggestions(false);
		},
		[handlePlaceSelect, setShowSuggestions]
	);

	const handleAddressChange =
		(field: keyof typeof formData) => (text: string) => {
			updateField(field, text);
		};

	const handleSaveAddress = async () => {
		try {
			if (!user?.id) {
				console.log("Please Login");
				return;
			}

			Alert.alert(
				"Confirm",
				"You will be saving a new address, please ensure it is correct",
				[
					{
						text: "Cancel",
						style: "cancel",
						onPress: () => {
							return;
						},
					},
					{
						text: "Confirm",
						style: "default",
						onPress: async () => {
							try {
								const newAddress = {
									...formData,
									user_id: user.id!,
									latitude: region.latitude,
									longitude: region.longitude,
								};

								if (address === newAddress) {
									setError("This is the same address");
									return;
								}

								const response = await userApi.addAddress(
									newAddress
								);
								if (response.status === "success") {
									setAddress(newAddress);
									Alert.alert(
										"Success",
										"Address added successfully!",
										[
											{
												text: "OK",
												style: "default",
												onPress: () => {
													navigation.goBack();
												},
											},
										]
									);
								}
							} catch (error) {
								Alert.alert(
									"Unsuccessful",
									"Could not add address, please try again later",
									[
										{
											text: "OK",
											style: "default",
											onPress: () => {
												navigation.goBack();
											},
										},
									]
								);
								console.error(
									"Could not save address, please try again later",
									error
								);
							}
						},
					},
				]
			);
		} catch (error) {
			console.error(
				"Could not save address, please try again later",
				error
			);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				enabled={Platform.OS === "ios"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
				<ScrollView
					contentContainerStyle={styles.scrollContainer}
					showsVerticalScrollIndicator={false}>
					<View style={styles.formContainer}>
						{/* Header */}
						<View style={styles.headerContainer}>
							<TouchableOpacity
								style={styles.backButton}
								onPress={() => navigation.goBack()}>
								<Ionicons
									name="arrow-back"
									size={24}
									color={COLORS.primary}
								/>
							</TouchableOpacity>
							<Text style={styles.title}>Edit Address</Text>
							<View style={styles.placeholder} />
						</View>
						{/* Search Input */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Search Address</Text>
							<View style={styles.searchContainer}>
								<View style={styles.searchInputWrapper}>
									<Ionicons
										name="search"
										size={20}
										color={COLORS.gray}
										style={styles.searchContainer}
									/>
									<TextInput
										style={styles.searchInput}
										value={searchText}
										onChangeText={setSearchText}
										onFocus={() => {
											searchText.length > 2 &&
												setShowSuggestions(true);
										}}
										placeholder="Type to search for an address..."
										placeholderTextColor={COLORS.gray}
									/>
									{searchText.length > 2 && (
										<TouchableOpacity
											style={styles.clearButton}
											onPress={() => {
												setShowSuggestions(false);
												setSearchText("");
											}}>
											<Ionicons
												name="close-circle"
												size={20}
												color={COLORS.gray}
											/>
										</TouchableOpacity>
									)}
								</View>
							</View>

							{/* Suggestions */}
							{showSuggestions && predictions.length > 0 && (
								<View style={styles.suggestionsContainer}>
									{predictions
										.slice(0, 5)
										.map((item, index) => (
											<TouchableOpacity
												key={item.place_id || index}
												style={[
													styles.suggestionItem,
													index ===
														predictions.length -
															1 &&
														styles.lastSuggestionItem,
												]}
												onPress={() =>
													handleSuggestionPress(
														item.place_id
													)
												}>
												<Ionicons
													name="locate-outline"
													size={16}
													color={COLORS.gray}
												/>
												<Text
													style={
														styles.suggestionText
													}>
													{item.description}
												</Text>
											</TouchableOpacity>
										))}
								</View>
							)}
						</View>

						{/* Address Fields */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Street Address</Text>
							<TextInput
								style={styles.input}
								value={formData.address_line1}
								onChangeText={handleAddressChange(
									"address_line1"
								)}
								placeholder="Enter Street Address"
								placeholderTextColor={COLORS.gray}
							/>
						</View>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Surbub</Text>
							<TextInput
								style={styles.input}
								value={formData.address_line2}
								onChangeText={handleAddressChange(
									"address_line2"
								)}
								placeholder="Enter Surbub"
								placeholderTextColor={COLORS.gray}
							/>
						</View>

						<View style={styles.rowContainer}>
							<View style={[styles.inputGroup, styles.halfWidth]}>
								<Text style={styles.label}>City</Text>
								<TextInput
									style={styles.input}
									value={formData.city}
									onChangeText={handleAddressChange("city")}
									placeholder="Enter City"
									placeholderTextColor={COLORS.gray}
								/>
							</View>

							<View style={[styles.inputGroup, styles.halfWidth]}>
								<Text style={styles.label}>Province</Text>
								<TextInput
									style={styles.input}
									value={formData.province}
									onChangeText={handleAddressChange(
										"province"
									)}
									placeholder="Enter Province"
									placeholderTextColor={COLORS.gray}
								/>
							</View>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Postal Code</Text>
							<TextInput
								style={styles.input}
								value={formData.postal_code}
								onChangeText={handleAddressChange(
									"postal_code"
								)}
								placeholder="Enter Postal Code"
								placeholderTextColor={COLORS.gray}
								keyboardType="numeric"
							/>
						</View>
						{error && (
							<View style={styles.inputGroup}>
								<View style={styles.errorContainer}>
									<Ionicons
										name="alert-circle"
										size={20}
										color={COLORS.error}
										style={styles.errorIcon}
									/>
									<Text style={styles.errorIcon}>
										{error}
									</Text>
								</View>
							</View>
						)}
						{/* Submit */}
						<View style={styles.buttonContainer}>
							<TouchableOpacity
								style={styles.saveButton}
								onPress={() => {
									handleSaveAddress();
								}}>
								<Text style={styles.saveButtonText}>
									Save Address
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.lightWhite,
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: SIZES.xxLarge,
		paddingTop: SIZES.small,
	},
	backButton: {
		padding: SIZES.xSmall,
		borderRadius: SIZES.small,
		backgroundColor: COLORS.white,
		...SHADOWS.small,
	},
	placeholder: {
		width: 40,
	},
	title: {
		fontSize: SIZES.xxLarge,
		fontFamily: FONT.bold,
		color: COLORS.primary,
		textAlign: "center",
		flex: 1,
	},
	scrollContainer: {
		flexGrow: 1,
		paddingBottom: SIZES.large,
	},
	formContainer: {
		flex: 1,
		paddingHorizontal: SIZES.large,
		paddingTop: SIZES.large,
	},
	inputGroup: {
		marginBottom: SIZES.large,
	},
	label: {
		fontSize: SIZES.medium,
		fontFamily: FONT.medium,
		color: COLORS.primary,
		marginBottom: SIZES.xSmall,
	},
	searchContainer: {
		position: "relative",
		zIndex: 1000,
	},
	searchInputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.white,
		borderRadius: SIZES.small,
		borderWidth: 1,
		borderColor: COLORS.gray2,
		paddingHorizontal: SIZES.medium,
		...SHADOWS.small,
	},
	searchIcon: {
		marginRight: SIZES.xSmall,
	},
	searchInput: {
		flex: 1,
		height: 50,
		fontSize: SIZES.medium,
		fontFamily: FONT.regular,
		color: COLORS.primary,
	},
	clearButton: {
		padding: SIZES.xxSmall,
	},
	suggestionsContainer: {
		position: "absolute",
		top: 85,
		left: 0,
		right: 0,
		backgroundColor: COLORS.white,
		borderRadius: SIZES.small,
		borderWidth: 1,
		borderColor: COLORS.gray2,
		maxHeight: 225,
		zIndex: 1001,
		...SHADOWS.medium,
	},
	suggestionItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: SIZES.medium,
		paddingVertical: SIZES.small,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.gray2,
	},
	lastSuggestionItem: {
		borderBottomWidth: 0,
	},
	suggestionIcon: {
		marginRight: SIZES.xSmall,
	},
	suggestionText: {
		flex: 1,
		fontSize: SIZES.small,
		fontFamily: FONT.regular,
		color: COLORS.primary,
	},
	input: {
		backgroundColor: COLORS.white,
		borderRadius: SIZES.small,
		borderWidth: 1,
		borderColor: COLORS.gray2,
		paddingHorizontal: SIZES.medium,
		paddingVertical: SIZES.medium,
		fontSize: SIZES.medium,
		fontFamily: FONT.regular,
		color: COLORS.primary,
		...SHADOWS.small,
	},
	rowContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	halfWidth: {
		width: "48%",
	},
	buttonContainer: {
		marginTop: SIZES.xxLarge,
		gap: SIZES.medium,
	},
	saveButton: {
		backgroundColor: COLORS.primary,
		borderRadius: SIZES.small,
		paddingVertical: SIZES.medium,
		alignItems: "center",
		...SHADOWS.medium,
	},
	saveButtonText: {
		color: COLORS.white,
		fontSize: SIZES.medium,
		fontFamily: FONT.bold,
	},
	cancelButton: {
		backgroundColor: "transparent",
		borderRadius: SIZES.small,
		borderWidth: 2,
		borderColor: COLORS.gray,
		paddingVertical: SIZES.small,
		alignItems: "center",
	},
	cancelButtonText: {
		color: COLORS.gray,
		fontSize: SIZES.medium,
		fontFamily: FONT.medium,
	},
	errorContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "FEF2F2",
		borderRadius: SIZES.small,
		borderWidth: 1,
		borderColor: COLORS.primary,
		paddingHorizontal: SIZES.small,
		paddingVertical: SIZES.xSmall,
	},
	errorIcon: {
		marginRight: SIZES.xSmall,
	},
	errorText: {
		flex: 1,
		fontSize: SIZES.small,
		fontFamily: FONT.medium,
		color: COLORS.error,
	},
});

export default EditAddress;
