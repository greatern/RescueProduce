import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../constants";
import { ScrollView } from "react-native-gesture-handler";

type ProfileTab = "profile" | "password" | "availability" | "deactivate";

interface ProfileTabsProps {
	activeTab: ProfileTab;
	setActiveTab: (tab: ProfileTab) => void;
	role: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
	activeTab,
	setActiveTab,
	role,
}) => {
	const tabs = [
		{ id: "profile" as ProfileTab, icon: "person", label: "Profile" },
		{
			id: "password" as ProfileTab,
			icon: "lock-closed",
			label: "Password",
		},
		...(role === "Volunteer"
			? [
					{
						id: "availability" as ProfileTab,
						icon: "calendar",
						label: "Availability",
					},
			  ]
			: []),
		{
			id: "deactivate" as ProfileTab,
			icon: "warning",
			label: "Deactivate",
		},
	];

	return (
		<ScrollView
			contentContainerStyle={styles.tabsContainer}
			horizontal={true}
			showsHorizontalScrollIndicator={false}>
			{tabs.map((tab) => (
				<TouchableOpacity
					key={tab.id}
					style={[
						styles.tab,
						activeTab === tab.id && styles.activeTab,
					]}
					onPress={() => setActiveTab(tab.id)}>
					<Ionicons
						name={tab.icon as any}
						size={20}
						color={
							activeTab === tab.id ? COLORS.primary : COLORS.gray
						}
					/>
					<Text
						style={[
							styles.tabText,
							activeTab === tab.id && styles.activeTabText,
						]}>
						{tab.label}
					</Text>
				</TouchableOpacity>
			))}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	tabsContainer: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: COLORS.gray2,
		marginBottom: SIZES.medium,
	},
	tab: {
		alignItems: "center",
		paddingVertical: SIZES.medium,
		paddingHorizontal: 16,
		flexDirection: "row",
		justifyContent: "center",
	},
	activeTab: {
		borderBottomWidth: 2,
		borderBottomColor: COLORS.primary,
	},
	tabText: {
		color: COLORS.gray,
		fontSize: SIZES.small,
	},
	activeTabText: {
		color: COLORS.primary,
		fontWeight: "600",
	},
});

export default ProfileTabs;
