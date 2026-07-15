import React, { Dispatch, SetStateAction, useState } from "react";
import DonorDashboard from "../App/screens/donor/donorDashboard";
import DonationHistory from "../App/screens/donor/DonationHistory";
import LogFood from "../App/screens/donor/LogFood";
import Profile from "../App/screens/profile/index";

import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { COLORS } from "../constants";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Report from "../App/screens/donor/Reports";
import ProfileStack from "./profile_stack";

export type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
interface ButtonProps<T extends string> {
	name: T;
	icon: IoniconName;
	label: string;
	activeTab: T;
	setActiveTab: Dispatch<SetStateAction<T>>;
}

export const TabButton = <T extends string>({
	name,
	icon,
	label,
	activeTab,
	setActiveTab,
}: ButtonProps<T>) => {
	const getIconName = () => {
		if (activeTab === name) {
			return icon.replace("-outline", "") as IoniconName;
		} else {
			return icon.includes("-outline")
				? icon
				: (`${icon}-outline` as IoniconName);
		}
	};
	return (
		<TouchableOpacity
			style={styles.tabItem}
			onPress={() => {
				setActiveTab(name);
			}}>
			<Ionicons
				name={getIconName()}
				size={26}
				color={activeTab === name ? COLORS.primary : COLORS.gray}
			/>
			<Text
				style={[
					styles.tabLabel,
					{
						color:
							activeTab === name ? COLORS.primary : COLORS.gray,
					},
				]}>
				{label}
			</Text>
		</TouchableOpacity>
	);
};

const DonorLayout = () => {
	const [activeTab, setActiveTab] = useState<
		"History" | "Home" | "Log" | "Reports" | "Profile"
	>("Home");

	const renderContent = () => {
		switch (activeTab) {
			case "Home":
				return <DonorDashboard />;
			case "History":
				return <DonationHistory />;
			case "Log":
				return <LogFood />;
			case "Reports":
				return <Report />;
			case "Profile":
				return <ProfileStack />;
			default:
				return <DonorDashboard />;
		}
	};

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<View style={styles.contentArea}>{renderContent()}</View>
				<View style={styles.tabBar}>
					<TabButton
						name="Home"
						icon="home"
						label="Home"
						activeTab={activeTab}
						setActiveTab={setActiveTab}
					/>
					<TabButton
						name="Log"
						icon="man"
						label="Log"
						activeTab={activeTab}
						setActiveTab={setActiveTab}
					/>
					<TabButton
						name="History"
						icon="list"
						label="History"
						activeTab={activeTab}
						setActiveTab={setActiveTab}
					/>
					<TabButton
						name="Reports"
						icon="analytics"
						label="Reports"
						activeTab={activeTab}
						setActiveTab={setActiveTab}
					/>
					<TabButton
						name="Profile"
						icon="person"
						label="Profile"
						activeTab={activeTab}
						setActiveTab={setActiveTab}
					/>
				</View>
			</SafeAreaView>
		</SafeAreaProvider>
	);
};

export default DonorLayout;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.lightWhite,
	},
	contentArea: {
		flex: 1,
	},
	contentView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	tabBar: {
		flexDirection: "row",
		height: 65,
		backgroundColor: COLORS.white,
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
		paddingBottom: 5,
		paddingTop: 5,
	},
	tabItem: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	tabLabel: {
		fontSize: 11,
		marginTop: 4,
	},
});
