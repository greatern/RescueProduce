import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Dimensions,
} from "react-native";
import { useVolunteer } from "../../../contexts/VolunteerContext";
import { COLORS } from "../../../constants";
import { Ionicons } from "@expo/vector-icons";
import TaskCard, {
	TaskData,
} from "../../../components/common/cards/volunteer/task";
import TaskDetailModal from "../../../components/common/modals/volunteer/task_detail";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface TaskProps {
	tasks?: TaskData[];
	isLoading?: boolean;
	onReload: () => void;
	error?: string | null;
}

const { width } = Dimensions.get("window");

const FloatingCircle = ({
  color,
  delay = 0,
  size = 120,
}: {
  color: string;
  delay?: number;
  size?: number;
}) => {
  const offset = useSharedValue(0);
  useEffect(() => {
    offset.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: Math.sin(offset.value * Math.PI * 2 + delay) * 25 },
      { translateX: Math.cos(offset.value * Math.PI * 2 + delay) * 25 },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: width * 0.5,
          zIndex: 1,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.25,
        },
        style,
      ]}
    />
  );
};

const Tasks = ({
	tasks = [],
	isLoading = false,
	onReload,
	error,
}: TaskProps) => {
	const { acceptTask } = useVolunteer();
	const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
	const [isAccepting, setIsAccepting] = useState(false);

	const handleTaskDetail = (taskId: string) => {
		const task = tasks.find((t) => t.task.id === taskId);
		if (task) {
			setSelectedTask(task);
		}
	};

	const handleAcceptTask = async (taskId: string) => {
		try {
			setIsAccepting(true);
			const success = await acceptTask(taskId);

			if (success) {
				setSelectedTask(null);
				Alert.alert(
					"Task Accepted",
					"This task has been added to your deliveries. Check your dashboard to manage it."
				);
				onReload();
			} else {
				Alert.alert(
					"Error",
					"Could not accept the task. It may have already been taken by another volunteer."
				);
			}
		} catch (error) {
			Alert.alert(
				"Error",
				"Something went wrong while accepting the task. Please try again."
			);
		} finally {
			setIsAccepting(false);
		}
	};

	const handleCloseModal = () => {
		setSelectedTask(null);
	};

	const renderTask = ({ item }: { item: TaskData }) => {
		return <TaskCard onDetail={handleTaskDetail} task={item} />;
	};

	// Error State
	if (error && !isLoading) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Available Tasks</Text>
				<View style={styles.errorContainer}>
					<Ionicons
						name="alert-circle-outline"
						size={64}
						color={COLORS.error}
					/>
					<Text style={styles.errorTitle}>Something went wrong</Text>
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity
						style={styles.retryButton}
						onPress={onReload}>
						<Ionicons
							name="refresh-outline"
							size={20}
							color="white"
						/>
						<Text style={styles.retryButtonText}>Try Again</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	// Loading State (initial load)
	if (isLoading && tasks.length === 0) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Available Tasks</Text>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={COLORS.primary} />
					<Text style={styles.loadingText}>
						Loading available tasks...
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Available Tasks</Text>

			<FlatList
				data={tasks}
				renderItem={renderTask}
				keyExtractor={(item) => item.task.id}
				ListEmptyComponent={
					!isLoading ? (
						<View style={styles.emptyContainer}>
							<Ionicons
								name="clipboard-outline"
								size={64}
								color={COLORS.gray}
							/>
							<Text style={styles.emptyTitle}>
								No tasks available
							</Text>
							<Text style={styles.emptyText}>
								There are no delivery tasks available at the
								moment. Check back later or pull down to
								refresh.
							</Text>
							<TouchableOpacity
								style={styles.refreshButton}
								onPress={onReload}>
								<Ionicons
									name="refresh-outline"
									size={18}
									color={COLORS.primary}
								/>
								<Text style={styles.refreshButtonText}>
									Refresh
								</Text>
							</TouchableOpacity>
						</View>
					) : null
				}
				refreshControl={
					<RefreshControl
						refreshing={isLoading}
						onRefresh={onReload}
						colors={[COLORS.primary]}
						tintColor={COLORS.primary}
					/>
				}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={
					tasks.length === 0 && !isLoading
						? styles.emptyListContainer
						: undefined
				}
			/>

			{/* Task Detail Modal */}
			<TaskDetailModal
				task={selectedTask}
				isVisible={!!selectedTask}
				isAccepting={isAccepting}
				onClose={handleCloseModal}
				onAccept={handleAcceptTask}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  searchContainer: {
    width: width * 0.9,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  statsContainer: {
    width: width * 0.9,
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  taskList: {
    paddingBottom: 20,
  },
  taskCard: {
    width: width * 0.9,
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  taskIcon: {
    marginRight: 12,
  },
  taskHeaderContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    lineHeight: 20,
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  acceptButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  urgentAcceptButton: {
    backgroundColor: "transparent",
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  acceptButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    color: "#555",
  },
  clearSearchText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "700",
  },
	container: {
		flex: 1,
		padding: SIZES.medium,
		backgroundColor: COLORS.lightWhite,
	},
	title: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
		marginBottom: SIZES.medium,
	},

	// Loading States
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 100,
	},
	loadingText: {
		marginTop: SIZES.medium,
		fontSize: SIZES.medium,
		color: COLORS.gray,
		textAlign: "center",
	},

	// Error States
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: SIZES.large,
		paddingTop: 100,
	},
	errorTitle: {
		fontSize: SIZES.large,
		fontWeight: "bold",
		color: COLORS.error,
		marginTop: SIZES.medium,
		marginBottom: SIZES.small,
		textAlign: "center",
	},
	errorText: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		textAlign: "center",
		lineHeight: 22,
		marginBottom: SIZES.xLarge,
	},
	retryButton: {
		backgroundColor: COLORS.error,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: SIZES.large,
		paddingVertical: SIZES.medium,
		borderRadius: SIZES.small,
		gap: SIZES.small,
	},
	retryButtonText: {
		color: "white",
		fontSize: SIZES.medium,
		fontWeight: "600",
	},

	// Empty States
	emptyListContainer: {
		flexGrow: 1,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: SIZES.large,
		paddingTop: 100,
	},
	emptyTitle: {
		fontSize: SIZES.large,
		fontWeight: "bold",
		color: COLORS.secondary,
		marginTop: SIZES.medium,
		marginBottom: SIZES.small,
		textAlign: "center",
	},
	emptyText: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		textAlign: "center",
		lineHeight: 22,
		marginBottom: SIZES.xLarge,
	},
	refreshButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: SIZES.large,
		paddingVertical: SIZES.medium,
		borderRadius: SIZES.small,
		borderWidth: 1,
		borderColor: COLORS.primary,
		gap: SIZES.small,
	},
	refreshButtonText: {
		color: COLORS.primary,
		fontSize: SIZES.medium,
		fontWeight: "600",
	},
});

export default Tasks;