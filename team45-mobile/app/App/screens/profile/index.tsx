import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../contexts/AuthContext";
import { COLORS, SIZES } from "../../../constants";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { IoniconName } from "../../../layouts/donor";
import { useNotifications } from "../../../contexts/NotificationContext";

interface ProfileOption {
	id: string;
	title: string;
	subtitle: string;
	icon: IoniconName;
	screen: string;
	color: string;
}

const Profile = () => {
	const navigation = useNavigation();
	const { user } = useAuth();
	const { initialiseNotifications } = useNotifications();

	const profileOptions: ProfileOption[] = [
		{
			id: "edit-profile",
			title: "Edit Profile",
			subtitle: "Update your personal profile",
			icon: "person",
			screen: "EditProfile",
			color: COLORS.gray,
		},
		{
			id: "edit-address",
			title: "Edit Address",
			subtitle: "Update your delivery address",
			icon: "location-outline",
			screen: "EditAddress",
			color: COLORS.gray,
		},
	];

	if (user?.role === "receiver") {
		profileOptions.push({
			id: "history",
			title: "History",
			subtitle: "View your claim history",
			icon: "time-outline",
			screen: "ReceiverHistory",
			color: COLORS.gray,
		});
	}

	const handleOptionPress = (screen: string) => {
		navigation.navigate(screen as never);
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContainer}>
				{/* Profile Header */}
				<View style={styles.profileHeader}>
					<View style={styles.avatarContainer}>
						<View style={styles.avatar}>
							<Text style={styles.avatarText}>User</Text>
						</View>
						<TouchableOpacity>
							<Ionicons
								name="camera"
								size={SIZES.small}
								color={COLORS.primary}
							/>
						</TouchableOpacity>
					</View>
					{user && (
						<>
							<Text style={styles.userName}>{user?.name}</Text>
							<Text style={styles.userEmail}>{user?.email}</Text>
						</>
					)}

					<View style={styles.roleBadge}>
						<Ionicons
							name="person"
							size={SIZES.small}
							color={COLORS.error}
						/>
						<Text style={styles.roleText}>
							{user?.role?.toUpperCase()}
						</Text>
					</View>
				</View>

				<View style={styles.optionsContainer}>
					<Text style={styles.sectionTitle}>Profile</Text>
					{profileOptions.map((option, index) => (
						<TouchableOpacity
							key={option.id}
							style={[
								styles.optionCard,
								index === profileOptions.length - 1 &&
									styles.lastOptionCard,
							]}
							onPress={() => handleOptionPress(option.screen)}>
							<View
								style={[
									styles.iconContainer,
									{ backgroundColor: option.color + "15" },
								]}>
								<Ionicons
									name={option.icon as any}
									size={SIZES.large}
									color={option.color}
								/>
							</View>
							<View style={styles.optionContent}>
								<Text style={styles.optionTitle}>
									{option.title}
								</Text>
								<Text style={styles.optionSubtitle}>
									{option.subtitle}
								</Text>
							</View>
							<Ionicons
								name="chevron-forward"
								size={SIZES.medium}
								color={COLORS.gray}
							/>
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Profile;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.lightWhite,
	},
	scrollContainer: {},
	button: {
		backgroundColor: COLORS.primary,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		alignItems: "center",
	},
	profileHeader: {
		backgroundColor: COLORS.white,
		paddingHorizontal: SIZES.large,
		paddingVertical: SIZES.xLarge,
		alignItems: "center",
		borderBottomWidth: 1,
		borderColor: COLORS.gray2,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	avatarContainer: {
		position: "relative",
		marginBottom: SIZES.small,
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: COLORS.primary,
		justifyContent: "center",
		alignItems: "center",
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
	},
	avatarText: {
		color: COLORS.white,
		fontSize: SIZES.large,
		fontWeight: "bold",
	},
	avatarEditButton: {
		position: "absolute",
		bottom: 0,
		right: 0,
		backgroundColor: COLORS.primary,
		width: 28,
		height: 28,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 3,
		borderColor: COLORS.white,
	},
	userName: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
		marginBottom: 4,
	},
	userEmail: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		marginBottom: SIZES.medium,
	},
	roleBadge: {
		backgroundColor: COLORS.primary + "20",
		paddingHorizontal: SIZES.medium,
		paddingVertical: SIZES.small,
		borderRadius: SIZES.large,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: SIZES.large,
	},
	roleText: {
		color: COLORS.primary,
		fontSize: SIZES.small,
		fontWeight: "600",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginLeft: 4,
	},
	statsContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
		width: "100%",
		paddingTop: SIZES.medium,
	},
	statItem: {
		alignItems: "center",
		flex: 1,
	},
	statNumber: {
		fontSize: SIZES.large,
		fontWeight: "bold",
		color: COLORS.primary,
	},
	statLabel: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginTop: 2,
	},
	statDivider: {
		width: 1,
		height: 30,
		backgroundColor: COLORS.lightWhite,
	},
	optionsContainer: {
		backgroundColor: COLORS.white,
		padding: SIZES.large,
		marginBottom: SIZES.medium,
		elevation: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
	},
	sectionTitle: {
		fontSize: SIZES.large,
		fontWeight: "bold",
		color: COLORS.primary,
		marginBottom: SIZES.large,
	},
	optionCard: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: SIZES.medium,
		paddingHorizontal: SIZES.small,
		borderRadius: SIZES.small,
		marginBottom: SIZES.small,
		backgroundColor: COLORS.white,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.lightWhite,
	},
	lastOptionCard: {
		borderBottomWidth: 0,
		marginBottom: 0,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginRight: SIZES.medium,
	},
	optionContent: {
		flex: 1,
	},
	optionTitle: {
		fontSize: SIZES.medium,
		fontWeight: "600",
		color: COLORS.primary,
		marginBottom: 2,
	},
	optionSubtitle: {
		fontSize: SIZES.small,
		color: COLORS.gray,
	},
	quickActionsContainer: {
		backgroundColor: COLORS.white,
		marginHorizontal: SIZES.medium,
		borderRadius: SIZES.medium,
		padding: SIZES.large,
		elevation: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
	},
	quickActionsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	quickActionCard: {
		width: "48%",
		backgroundColor: COLORS.lightWhite,
		paddingVertical: SIZES.large,
		paddingHorizontal: SIZES.medium,
		borderRadius: SIZES.medium,
		alignItems: "center",
		marginBottom: SIZES.medium,
	},
	quickActionText: {
		fontSize: SIZES.small,
		color: COLORS.primary,
		fontWeight: "600",
		marginTop: SIZES.small,
	},
	signOutCard: {
		backgroundColor: "#FF3B30" + "10",
	},
	signOutText: {
		color: "#FF3B30",
	},
});
