import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../constants";

const ProfileHeader = ({ profile }: { profile: any }) => {
	return (
		<View style={styles.header}>
			<View style={styles.avatarContainer}>
				<View style={styles.avatar}>
					<Text style={styles.avatarText}>
						{profile.name
							.split(" ")
							.map((n: any[]) => n[0])
							.join("")}
					</Text>
				</View>
			</View>

			<Text style={styles.name}>{profile.name}</Text>
			<Text style={styles.email}>{profile.email}</Text>

			<View style={styles.roleBadge}>
				<Ionicons name="person" size={16} color={COLORS.primary} />
				<Text style={styles.roleText}>{profile.role}</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		alignItems: "center",
		padding: SIZES.large,
		backgroundColor: COLORS.white,
		marginBottom: SIZES.medium,
	},
	avatarContainer: {
		marginBottom: SIZES.medium,
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
	},
	avatarText: {
		color: COLORS.white,
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
	},
	name: {
		fontSize: SIZES.large,
		fontWeight: "bold",
		color: COLORS.primary,
		marginBottom: SIZES.small / 2,
	},
	email: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		marginBottom: SIZES.medium,
	},
	roleBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: COLORS.primary + "20",
		paddingHorizontal: SIZES.medium,
		paddingVertical: SIZES.small / 2,
		borderRadius: SIZES.large,
	},
	roleText: {
		color: COLORS.primary,
		fontSize: SIZES.small,
		fontWeight: "600",
		marginLeft: SIZES.small / 2,
	},
});

export default ProfileHeader;
