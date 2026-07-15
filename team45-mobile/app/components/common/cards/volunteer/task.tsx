import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../../constants";

export interface TaskData {
	task: {
		id: string;
		title: string;
		description: string;
		status: string;
		task_type: string;
		due_date: string;
		created_at: string;
	};
	receiver: {
		id: string;
		name: string;
	};
	donor: {
		id: string;
		name: string;
	};
	claim: {
		id: string;
		claimed_quantity: number;
		claimed_amount: number;
		weight_per_unit: number;
	};
}

interface TaskCardProps {
	task: TaskData;
	isAccepting?: boolean;
	onDetail: (taskId: string) => void;
}

const TaskCard = ({ task, isAccepting = false, onDetail }: TaskCardProps) => {
	const getUrgencyLevel = (due: string) => {
		if (!due) return { level: "normal", color: "#4CAF50" };

		const dueDate = new Date(due);
		if (isNaN(dueDate.getTime()))
			return { level: "normal", color: "#4CAF50" };

		const now = new Date();
		const hoursLeft =
			(dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

		if (hoursLeft <= 2) return { level: "critical", color: "#ff4444" };
		if (hoursLeft <= 6) return { level: "urgent", color: "#ff9800" };
		return { level: "normal", color: "#4CAF50" };
	};

	const formatTimeRemaining = (due: string) => {
		if (!due) return "No deadline";
		const dueDate = new Date(due);
		if (isNaN(dueDate.getTime())) return "Invalid date";

		const now = new Date();
		const diffInHours = Math.floor(
			(dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
		);

		if (diffInHours < 0) return "Overdue";
		if (diffInHours < 1) return "Due soon";
		if (diffInHours < 24) return `${diffInHours}h left`;

		const days = Math.floor(diffInHours / 24);
		return `${days}d left`;
	};

	const formatDate = (dateString: string | Date) => {
		if (!dateString) return "Not specified";
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return "Invalid date";

		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const urgency = getUrgencyLevel(task.task.due_date);

	return (
		<View style={styles.cardContainer}>
			{/* Header Section (replaces image) */}
			<View style={styles.headerContainer}>
				<View style={styles.headerContent}>
					<Text style={styles.title} numberOfLines={1}>
						{task.task.title || "Food Delivery Task"}
					</Text>
					<Text style={styles.taskId}>
						#{task.task.id.slice(0, 8).toUpperCase()}
					</Text>
				</View>
				<View
					style={[
						styles.statusBadge,
						{ backgroundColor: urgency.color },
					]}>
					<Text style={styles.statusText}>
						{formatTimeRemaining(task.task.due_date)}
					</Text>
				</View>
			</View>

			{/* Content Container */}
			<View style={styles.contentContainer}>
				{/* People Info (replaces donor name) */}
				<Text style={styles.routeInfo}>
					From: {task.donor.name} → To: {task.receiver.name}
				</Text>

				{/* Stats Row */}
				<View style={styles.statsRow}>
					<View style={styles.statItem}>
						<Ionicons
							name="cube-outline"
							size={16}
							color={COLORS.primary}
						/>
						<Text style={styles.statText}>
							{task.claim?.claimed_quantity || 0} items
						</Text>
					</View>
					<View style={styles.statItem}>
						<Ionicons
							name="barbell-outline"
							size={16}
							color={COLORS.primary}
						/>
						<Text style={styles.statText}>
							{task.claim?.claimed_amount || 0}kg total
						</Text>
					</View>
				</View>

				{/* Date Info */}
				<View style={styles.dateRow}>
					<View style={styles.dateItem}>
						<Ionicons name="time-outline" size={14} color="#666" />
						<Text style={styles.dateLabel}>Due:</Text>
						<Text
							style={[
								styles.dateValue,
								{ color: urgency.color },
							]}>
							{formatDate(task.task.due_date)}
						</Text>
					</View>
					<View style={styles.dateItem}>
						<Ionicons
							name="calendar-outline"
							size={14}
							color="#666"
						/>
						<Text style={styles.dateLabel}>Created:</Text>
						<Text style={styles.dateValue}>
							{formatDate(task.task.created_at)}
						</Text>
					</View>
				</View>

				{/* Description */}
				{task.task.description && (
					<Text style={styles.description} numberOfLines={2}>
						{task.task.description}
					</Text>
				)}

				{/* Action Button */}
				<TouchableOpacity
					style={[
						styles.detailButton,
						urgency.level === "critical" && styles.urgentButton,
						isAccepting && styles.disabledButton,
					]}
					onPress={() => onDetail(task.task.id)}
					disabled={isAccepting}>
					{isAccepting ? (
						<ActivityIndicator color="white" size="small" />
					) : (
						<Text style={styles.buttonText}>View Details</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	cardContainer: {
		marginBottom: 16,
		borderWidth: 1,
		borderColor: COLORS.lightGray,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.0,
		shadowRadius: 8,
		elevation: 1,
		backgroundColor: "white",
	},
	headerContainer: {
		backgroundColor: "#f8f9fa",
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		padding: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		minHeight: 80,
	},
	headerContent: {
		flex: 1,
		marginRight: 12,
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1a1a1a",
		marginBottom: 4,
		lineHeight: 24,
	},
	taskId: {
		fontSize: 14,
		color: "#666",
		fontWeight: "500",
	},
	statusBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		color: "white",
		fontSize: 12,
		fontWeight: "600",
	},
	contentContainer: {
		padding: 16,
	},
	routeInfo: {
		fontSize: 14,
		color: "#666",
		marginBottom: 12,
		fontStyle: "italic",
	},
	statsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
		backgroundColor: "#f8f9fa",
		padding: 10,
		borderRadius: 8,
	},
	statItem: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	statText: {
		fontSize: 13,
		color: "#333",
		marginLeft: 6,
		fontWeight: "500",
	},
	dateRow: {
		marginBottom: 12,
	},
	dateItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
	},
	dateLabel: {
		fontSize: 12,
		color: "#666",
		marginLeft: 6,
		marginRight: 4,
		fontWeight: "500",
	},
	dateValue: {
		fontSize: 12,
		color: "#333",
		fontWeight: "600",
	},
	description: {
		fontSize: 14,
		color: "#555",
		lineHeight: 20,
		marginBottom: 16,
		backgroundColor: "#f8f9fa",
		padding: 10,
		borderRadius: 6,
		fontStyle: "italic",
	},
	detailButton: {
		backgroundColor: COLORS.primary,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: "center",
		elevation: 2,
	},
	urgentButton: {
		backgroundColor: "#ff4444",
	},
	disabledButton: {
		backgroundColor: "#9CA3AF",
		opacity: 0.7,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default TaskCard;
