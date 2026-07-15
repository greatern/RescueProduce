import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../constants";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import ProfileInfo from "./ProfileInfo";
import PasswordChange from "./PasswordChange";
import AvailabilityManagement from "./AvailabilityManagement";
import DeactivateAccount from "./DeactivateAccount";
import { useAuth } from "../../../contexts/AuthContext";

type ProfileTab = "profile" | "password" | "availability" | "deactivate";

type UserProfile = {
	id: string;
	name: string;
	email: string;
	phone: string;
	role: "NGO" | "Volunteer" | "Donor" | "Admin";
	organization?: string;
	address?: string;
	vehicleType?: string;
	capacity?: string;
	lastActive: string;
};

type AvailabilitySlot = {
	id: string;
	day: string;
	startTime: string;
	endTime: string;
};

const ProfileScreen = () => {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const fakeProfile: UserProfile = {
					id: user?.id || "user123",
					name: user?.name || "a User",
					email: user?.email || "a@example.com",
					phone: "+27 000 000 000",
					role: "Volunteer",
					organization: "Food Rescue SA",
					address: "123 auk St, joburg",
					vehicleType: "Refrigerated Van",
					capacity: "500 kg",
					lastActive: new Date().toISOString().split("T")[0],
				};
				setProfile(fakeProfile);

				const mockAvailability: AvailabilitySlot[] = [
					{
						id: "1",
						day: "Monday",
						startTime: "08:00",
						endTime: "12:00",
					},
					{
						id: "2",
						day: "Wednesday",
						startTime: "13:00",
						endTime: "17:00",
					},
				];
				setAvailability(mockAvailability);
			} catch (error) {
				console.error("Failed to load profile:", error);
			}
		};

		loadProfile();
	}, [user]);

	const handleProfileUpdate = async (updatedData: Partial<UserProfile>) => {
		try {
			// await updateProfileAPI(updatedData);
			setProfile((prev) => (prev ? { ...prev, ...updatedData } : null));
			setIsEditing(false);
			alert("Profile updated successfully!");
		} catch (error) {
			console.error("Failed to update profile:", error);
			alert("Failed to update profile");
		}
	};

	const handlePasswordChange = async (passwordData: {
		currentPassword: string;
		newPassword: string;
		confirmPassword: string;
	}) => {
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			alert("New passwords don't match!");
			return;
		}

		try {
			// await changePasswordAPI(password);
			alert("Password changed successfully!");
		} catch (error) {
			console.error("Failed to change password:", error);
			alert("Failed to change password");
		}
	};

	const handleAddAvailability = (newSlot: Omit<AvailabilitySlot, "id">) => {
		try {
			// await addAvailabilityAPI(newSlot);
			const slotWithId = { ...newSlot, id: Date.now().toString() };
			setAvailability((prev) => [...prev, slotWithId]);
		} catch (error) {
			console.error("Failed to add availability:", error);
			alert("Failed to add availability");
		}
	};

	const handleRemoveAvailability = async (id: string) => {
		try {
			// await removeAvailabilityAPI(id);
			setAvailability((prev) => prev.filter((slot) => slot.id !== id));
		} catch (error) {
			console.error("Failed to remove availability:", error);
			alert("Failed to remove availability");
		}
	};

	if (!profile) {
		return (
			<SafeAreaView style={styles.container}>
				<Text>Loading profile...</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<ScrollView>
					<ProfileHeader profile={profile} />

					<ProfileTabs
						activeTab={activeTab}
						setActiveTab={setActiveTab}
						role={profile.role}
					/>

					{activeTab === "profile" && (
						<ProfileInfo
							profile={profile}
							isEditing={isEditing}
							setIsEditing={setIsEditing}
							onUpdate={handleProfileUpdate}
						/>
					)}

					{activeTab === "password" && (
						<PasswordChange onSubmit={handlePasswordChange} />
					)}

					{activeTab === "availability" &&
						profile.role === "Volunteer" && (
							<AvailabilityManagement
								availability={availability}
								onAdd={handleAddAvailability}
								onRemove={handleRemoveAvailability}
							/>
						)}

					{activeTab === "deactivate" && <DeactivateAccount />}
				</ScrollView>
			</SafeAreaView>
		</SafeAreaProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.lightWhite,
	},
});

export default ProfileScreen;
