import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import Home from "../App/screens/Volunteer/VolunteerHome";
import Tasks from "../App/screens/Volunteer/Tasks";
import Delivery from "../App/screens/Volunteer/ConfirmDelivery";
import Availability from "../App/screens/Volunteer/Availability";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants";
import { StyleSheet, View } from "react-native";
import { TabButton } from "./donor";
import * as volunteerService from "../service/volunteer";
import { VolunteerProvider } from "../contexts/VolunteerContext";
import ProfileStack from "./profile_stack";
import { Task } from "../service/receiver";
import { useAuth } from "../contexts/AuthContext";
import { TaskData } from "../components/common/cards/volunteer/task";

const Stack = createStackNavigator();
const VolunteerLayout = () => {
	const [tasks, setTasks] = useState<TaskData[]>([]);
	const [activeTasks, setActiveTasks] = useState<Task[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentTask, setCurrentTask] = useState<Task>();
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<
		"Home" | "Tasks" | "Delivery" | "Availability" | "Profile"
	>("Home");

	const fetchTasks = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await volunteerService.getAllTasks();
			setTasks(response.data || []);
		} catch (error) {
			console.error("Failed to fetch tasks:", error);
			setError(
				"Network error. Please check your connection and try again."
			);
			setTasks([]);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchActiveTasks = async () => {
		try {
			const response = await volunteerService.getActiveTasks(user?.id!);
			if (response.status === "success") {
				setActiveTasks(response.data!);
			} else {
				setActiveTasks([]);
			}
		} catch (error) {
			console.error("Error fetching tasks", error);
			setActiveTasks([]);
		}
	};

	useEffect(() => {
		console.log("Active Volunteer Tab", activeTab);

		if (activeTab === "Home") {
			fetchActiveTasks();
		}

		if (activeTab === "Tasks") {
			fetchTasks();
		}
	}, [activeTab]);

	const renderContent = () => {
		switch (activeTab) {
			case "Home":
				return (
					<Home
						setActiveTab={setActiveTab}
						setCurrentTask={setCurrentTask}
						activeTasks={activeTasks}
					/>
				);
			case "Delivery":
				if (currentTask) return <Delivery selectedTask={currentTask} />;
			case "Availability":
				return <Availability />;
			case "Tasks":
				return (
					<Tasks
						tasks={tasks}
						onReload={fetchTasks}
						isLoading={isLoading}
						error={error}
					/>
				);
			case "Profile":
				return <ProfileStack />;
			default:
				return (
					<Home
						setActiveTab={setActiveTab}
						setCurrentTask={setCurrentTask}
						activeTasks={activeTasks}
					/>
				);
		}
	};

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container}>
				<View style={styles.contentArea}>
					<VolunteerProvider>{renderContent()}</VolunteerProvider>
				</View>
				<View style={styles.tabBar}>
					<TabButton
						name="Home"
						icon="home"
						label="Home"
						activeTab={activeTab}
						setActiveTab={setActiveTab}
					/>
					<TabButton
						name="Tasks"
						icon="list"
						label="Tasks"
						activeTab={activeTab}
						setActiveTab={setActiveTab}
					/>

					{/* <TabButton
						name="Availability"
						icon="calendar"
						label="Schedule"
						activeTab={activeTab}
						setActiveTab={setActiveTab}
					/> */}
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

export default VolunteerLayout;

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
