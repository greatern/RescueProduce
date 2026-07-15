import React, { useCallback, useContext, useEffect } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import {
	View,
	Text,
	StyleSheet,
	Image,
	ActivityIndicator,
	TouchableOpacity,
	Alert,
} from "react-native";
import {
	DrawerContentScrollView,
	DrawerItemList,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, icons, images, SIZES } from "../../constants";
import ScreenHeaderBtn from "../../components/common/header/ScreenHeaderBtn";

import Home from "../Home";
import Signup from "../screens/Signup";
import Login from "../screens/Login";
import DonorDashboard from "../screens/donor/donorDashboard";
import LogFood from "../screens/donor/LogFood";
import DonationHistory from "../screens/donor/DonationHistory";
import RecieverHome from "../screens/receiver/LiveDonationsPage";
import ReceiverLayout from "../../layouts/receiver";
import AuthLayout from "../../layouts/auth";
import DonorLayout from "../../layouts/donor";

import VolunteerNavigator from "./VolunteerNavigator";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import VolunteerLayout from "../../layouts/volunteer";
import {
	NotificationProvider,
	useNotifications,
} from "../../contexts/NotificationContext";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
	const { LogoutBtn } = props;
	return (
		<DrawerContentScrollView {...props}>
			<View style={styles.drawerHeader}>
				<Image
					source={images.profile}
					style={styles.logo}
					resizeMode="contain"
				/>
			</View>
			<View>
				<DrawerItemList {...props} />
			</View>
			<View>{LogoutBtn && <LogoutBtn />}</View>
		</DrawerContentScrollView>
	);
};

const CustomHeader = ({ navigation, route }: any) => {
	const { last_notification } = useNotifications();
	return (
		<View style={styles.headerContainer}>
			<ScreenHeaderBtn
				iconUrl={icons.menu}
				dimension="60%"
				onPress={() => navigation.toggleDrawer()}
			/>
			<Text style={styles.headerTitle}>RescueProduce</Text>
			<View style={styles.rightHeaderContainer}>
				{last_notification && (
					<View style={styles.notificationBadge}>
						<Ionicons
							name="notifications"
							size={24}
							color={COLORS.primary}
						/>
					</View>
				)}
			</View>
			<ScreenHeaderBtn
				iconUrl={images.profile}
				dimension="100%"
				onPress={() => alert("press menu sidebar!")}
			/>
		</View>
	);
};

const LogoutBtn = () => {
	const { logout } = useAuth();

	const handleLogout = useCallback(async () => {
		Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Logout",
				style: "destructive",
				onPress: async () => {
					try {
						await logout();
					} catch (error) {
						Alert.alert(
							"Error",
							"Failed to logout. Please try again."
						);
					}
				},
			},
		]);
	}, [logout]);
	return (
		<View style={styles.logoutContainer}>
			<TouchableOpacity
				style={styles.logoutButton}
				onPress={handleLogout}>
				<Ionicons
					name="log-out-outline"
					size={20}
					color={COLORS.error}
				/>
				<Text style={styles.logoutText}>Logout</Text>
			</TouchableOpacity>
		</View>
	);
};

const drawerScreenOptions = {
	header: (props: any) => <CustomHeader {...props} />,
	drawerStyle: {
		backgroundColor: COLORS.white,
		width: 260,
	},
	drawerActiveTintColor: COLORS.green,

	drawerInactiveTintColor: COLORS.primary,
	drawerLabelStyle: {
		color: COLORS.primary,
		fontSize: 18,
		marginLeft: -5,
	},
};

const authScreenOptions = {
	drawerIcon: ({ size }: { size: number }) => (
		<Ionicons name="log-in-outline" size={size} color={COLORS.primary} />
	),
};

const homeScreenOptions = {
	drawerIcon: ({ size }: { size: number }) => (
		<Ionicons name="home-outline" size={size} color={COLORS.primary} />
	),
};

const NoAuth = () => {
	return (
		<NavigationContainer>
			<Drawer.Navigator
				initialRouteName={"Receiver Home"}
				drawerContent={(props) => (
					<CustomDrawerContent {...props} LogoutBtn={LogoutBtn} />
				)}
				screenOptions={{
					header: (props) => <CustomHeader {...props} />,
					drawerStyle: {
						backgroundColor: COLORS.white,
						width: 260,
					},
					drawerActiveTintColor: COLORS.green,

					drawerInactiveTintColor: COLORS.primary,
					drawerLabelStyle: {
						color: COLORS.primary,
						fontSize: 18,
						marginLeft: -5,
					},
				}}>
				<Drawer.Screen
					name="Auth"
					component={AuthLayout}
					options={authScreenOptions}
				/>
				<Drawer.Screen
					name="Home"
					component={Home}
					initialParams={{ mission: "Welcome" }}
					options={homeScreenOptions}
				/>
				<Drawer.Screen
					name="Donor Home"
					component={DonorLayout}
					options={{
						drawerIcon: ({ color, size }) => (
							<Ionicons
								name="home-outline"
								size={size}
								color={COLORS.primary}
							/>
						),
					}}
				/>

				<Drawer.Screen
					name="Receiver Home"
					component={ReceiverLayout}
					options={{
						drawerIcon: ({ color, size }) => (
							<Ionicons
								name="home-outline"
								size={size}
								color={COLORS.primary}
							/>
						),
					}}
				/>

				<Drawer.Screen
					name="Volunteer Home"
					component={VolunteerLayout}
					options={{
						drawerIcon: ({ color, size }) => (
							<Ionicons
								name="home-outline"
								size={size}
								color={COLORS.primary}
							/>
						),
					}}
				/>
			</Drawer.Navigator>
		</NavigationContainer>
	);
};

const AppNavigator = () => {
	const { isAuthenticated, isLoading, user } = useAuth();

	//return NoAuth();

	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}>
				<ActivityIndicator size="large" color={COLORS.primary} />
			</View>
		);
	}

	if (!isAuthenticated) {
		return (
			<NavigationContainer>
				<Drawer.Navigator
					initialRouteName="Auth"
					drawerContent={(props) => (
						<CustomDrawerContent {...props} />
					)}
					screenOptions={drawerScreenOptions}>
					<Drawer.Screen
						name="Auth"
						component={AuthLayout}
						options={authScreenOptions}
					/>
					<Drawer.Screen
						name="Home"
						component={Home}
						initialParams={{ mission: "Welcome" }}
						options={homeScreenOptions}
					/>
				</Drawer.Navigator>
			</NavigationContainer>
		);
	}

	return (
		<NavigationContainer>
			<Drawer.Navigator
				initialRouteName={getInitialRoute(user?.role)}
				drawerContent={(props) => (
					<CustomDrawerContent {...props} LogoutBtn={LogoutBtn} />
				)}
				screenOptions={{
					header: (props) => <CustomHeader {...props} />,
					drawerStyle: {
						backgroundColor: COLORS.white,
						width: 260,
					},
					drawerActiveTintColor: COLORS.green,

					drawerInactiveTintColor: COLORS.primary,
					drawerLabelStyle: {
						color: COLORS.primary,
						fontSize: 18,
						marginLeft: -5,
					},
				}}>
				{user?.role === "donor" && (
					<Drawer.Screen
						name="Donor Home"
						component={DonorLayout}
						options={{
							drawerIcon: ({ color, size }) => (
								<Ionicons
									name="home-outline"
									size={size}
									color={COLORS.primary}
								/>
							),
						}}
					/>
				)}

				{user?.role === "receiver" && (
					<Drawer.Screen
						name="Receiver Home"
						component={ReceiverLayout}
						options={{
							drawerIcon: ({ color, size }) => (
								<Ionicons
									name="home-outline"
									size={size}
									color={COLORS.primary}
								/>
							),
						}}
					/>
				)}

				{user?.role === "volunteer" && (
					<Drawer.Screen
						name="Volunteer Home"
						component={VolunteerLayout}
						options={{
							drawerIcon: ({ color, size }) => (
								<Ionicons
									name="home-outline"
									size={size}
									color={COLORS.primary}
								/>
							),
						}}
					/>
				)}

				<Drawer.Screen
					name="Home"
					component={Home}
					initialParams={{ mission: "uuhm?" }}
					options={{
						drawerIcon: ({ color, size }) => (
							<Ionicons
								name="home-outline"
								size={size}
								color={COLORS.primary}
							/>
						),
					}}
				/>
			</Drawer.Navigator>
		</NavigationContainer>
	);
};

const getInitialRoute = (role?: "donor" | "volunteer" | "receiver" | null) => {
	switch (role) {
		case "donor":
			return "Donor Home";
		case "receiver":
			return "Receiver Home";
		case "volunteer":
			return "Volunteer Home";
		default:
			return "Home";
	}
};

const RootNavigator = () => {
	return (
		<NotificationProvider>
			<AuthProvider>
				<AppNavigator />
			</AuthProvider>
		</NotificationProvider>
	);
};

const styles = StyleSheet.create({
	headerContainer: {
		height: 100,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 15,
		paddingTop: 40,
		backgroundColor: COLORS.lightWhite,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.white,
	},
	headerTitle: {
		fontSize: 22,
		fontWeight: "bold",
		color: COLORS.primary,
	},
	rightHeaderContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	notificationBadge: {
		marginRight: 10,
		backgroundColor: COLORS.lightWhite,
		borderRadius: 20,
		padding: 8,
	},
	drawerHeader: {
		padding: 20,
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: COLORS.white,
	},
	logo: {
		width: 100,
		height: 50,
	},
	logoutContainer: {
		paddingHorizontal: SIZES.large,
		paddingVertical: SIZES.xSmall,
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: SIZES.small,
		paddingRight: SIZES.medium,
		borderRadius: SIZES.xxSmall,
	},
	logoutText: {
		marginLeft: SIZES.small,
		fontSize: SIZES.medium,
		color: COLORS.error,
		fontWeight: "500",
	},
});

export default RootNavigator;
