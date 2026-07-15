import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../../../constants";
import { useAuth } from "../../../contexts/AuthContext";

const EditProfile = () => {
	const { user } = useAuth();
	const [formData, setFormData] = useState({
		name: user?.name || "",
		email: user?.email || "",
		//phone?: user?.phone || '',
	});

	const handleChange = (field: string, value: string) => {
		setFormData({ ...formData, [field]: value });
	};

	const handleSubmit = () => {
		console.log("Profile updated:", formData);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Edit Profile</Text>

				<View style={styles.inputGroup}>
					<Text style={styles.label}>Full Name</Text>
					<TextInput
						style={styles.input}
						value={formData.name}
						onChangeText={(text) => handleChange("name", text)}
					/>
				</View>

				<View style={styles.inputGroup}>
					<Text style={styles.label}>Email</Text>
					<TextInput
						style={styles.input}
						value={formData.email}
						onChangeText={(text) => handleChange("email", text)}
						keyboardType="email-address"
					/>
				</View>
				{/*
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => handleChange('phone', text)}
            keyboardType="phone-pad"
          />
        </View>*/}

				<TouchableOpacity
					style={styles.saveButton}
					onPress={handleSubmit}>
					<Text style={styles.saveButtonText}>Save Changes</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.lightWhite,
	},
	content: {
		flex: 1,
		padding: SIZES.large,
	},
	title: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
		marginBottom: SIZES.xLarge,
		textAlign: "center",
	},
	inputGroup: {
		marginBottom: SIZES.large,
	},
	label: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		marginBottom: SIZES.small,
	},
	input: {
		borderWidth: 1,
		borderColor: COLORS.gray2,
		borderRadius: SIZES.small,
		padding: SIZES.medium,
		backgroundColor: COLORS.white,
	},
	saveButton: {
		backgroundColor: COLORS.primary,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		alignItems: "center",
		marginTop: SIZES.large,
	},
	saveButtonText: {
		color: COLORS.white,
		fontWeight: "bold",
		fontSize: SIZES.medium,
	},
});

export default EditProfile;
