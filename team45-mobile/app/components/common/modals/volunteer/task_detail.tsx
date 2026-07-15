import React from "react";
import {
	View,
	Text,
	Modal,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../../constants";
import { TaskData } from "../../cards/volunteer/task";

interface TaskDetailModalProps {
	task: TaskData | null;
	isVisible: boolean;
	isAccepting: boolean;
	onClose: () => void;
	onAccept: (taskId: string) => void;
}

const TaskDetailModal = ({
	task,
	isVisible,
	isAccepting,
	onClose,
	onAccept,
}: TaskDetailModalProps) => {
	if (!task) return null;

	const getUrgencyLevel = (due: string) => {
		if (!due) return { level: "normal", color: "#6B7280" };

		const dueDate = new Date(due);
		if (isNaN(dueDate.getTime()))
			return { level: "normal", color: "#6B7280" };

		const now = new Date();
		const hoursLeft =
			(dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

		if (hoursLeft <= 2) return { level: "critical", color: "#EF4444" };
		if (hoursLeft <= 6) return { level: "urgent", color: "#F59E0B" };
		return { level: "normal", color: "#6B7280" };
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const urgency = getUrgencyLevel(task.task.due_date);

	return (
		<Modal
			visible={isVisible}
			animationType="slide"
			presentationStyle="pageSheet"
			onRequestClose={onClose}>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						style={styles.closeButton}
						onPress={onClose}>
						<Ionicons name="close" size={24} color={COLORS.gray} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Task Details</Text>
					<View style={styles.placeholder} />
				</View>

				<ScrollView
					style={styles.content}
					showsVerticalScrollIndicator={false}>
					{/* Task Title & ID */}
					<View style={styles.titleSection}>
						<View style={styles.titleRow}>
							<Text style={styles.taskTitle}>
								{task.task.title || "Food Delivery Task"}
							</Text>
							{urgency.level !== "normal" && (
								<View
									style={[
										styles.urgencyBadge,
										{ backgroundColor: urgency.color },
									]}>
									<Text style={styles.urgencyText}>
										{urgency.level === "critical"
											? "URGENT"
											: "SOON"}
									</Text>
								</View>
							)}
						</View>
						<Text style={styles.taskId}>
							Task ID: #{task.task.id.slice(0, 8).toUpperCase()}
						</Text>
					</View>

					{/* Description */}
					{task.task.description && (
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Description</Text>
							<Text style={styles.description}>
								{task.task.description}
							</Text>
						</View>
					)}

					{/* Task Details */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							Task Information
						</Text>
						<View style={styles.detailGrid}>
							<DetailItem
								icon="cube-outline"
								label="Quantity"
								value={`${
									task.claim?.claimed_quantity || 0
								} items`}
							/>
							<DetailItem
								icon="scale-outline"
								label="Weight"
								value={`${task.claim?.claimed_amount || 0} kg`}
							/>
							<DetailItem
								icon="timer-outline"
								label="Due Date"
								value={formatDateTime(task.task.due_date)}
								color={urgency.color}
							/>
							<DetailItem
								icon="calendar-outline"
								label="Requested"
								value={formatDateTime(task.task.created_at)}
							/>
						</View>
					</View>

					{/* People Involved */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>
							Involved Parties
						</Text>
						<View style={styles.peopleSection}>
							<View style={styles.personCard}>
								<Ionicons
									name="storefront-outline"
									size={20}
									color="#10B981"
								/>
								<View style={styles.personInfo}>
									<Text style={styles.personLabel}>
										Donor
									</Text>
									<Text style={styles.personName}>
										{task.donor?.name || "Unknown"}
									</Text>
									{/* Future: Add address here */}
									{/* <Text style={styles.personAddress}>{task.donor?.address}</Text> */}
								</View>
							</View>

							<View style={styles.arrow}>
								<Ionicons
									name="arrow-down"
									size={20}
									color={COLORS.gray}
								/>
							</View>

							<View style={styles.personCard}>
								<Ionicons
									name="home-outline"
									size={20}
									color="#3B82F6"
								/>
								<View style={styles.personInfo}>
									<Text style={styles.personLabel}>
										Receiver
									</Text>
									<Text style={styles.personName}>
										{task.receiver?.name || "Unknown"}
									</Text>
									{/* Future: Add address here */}
									{/* <Text style={styles.personAddress}>{task.receiver?.address}</Text> */}
								</View>
							</View>
						</View>
					</View>
				</ScrollView>

				{/* Accept Button */}
				<View style={styles.footer}>
					<TouchableOpacity
						style={[
							styles.acceptButton,
							urgency.level === "critical" && styles.urgentButton,
							isAccepting && styles.disabledButton,
						]}
						onPress={() => onAccept(task.task.id)}
						disabled={isAccepting}>
						{isAccepting ? (
							<ActivityIndicator color="white" size="small" />
						) : (
							<>
								<Ionicons
									name="checkmark-circle"
									size={20}
									color="white"
								/>
								<Text style={styles.acceptButtonText}>
									Accept This Task
								</Text>
							</>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const DetailItem = ({
	icon,
	label,
	value,
	color = "#6B7280",
}: {
	icon: string;
	label: string;
	value: string;
	color?: string;
}) => (
	<View style={styles.detailItem}>
		<Ionicons name={icon as any} size={16} color={color} />
		<View style={styles.detailContent}>
			<Text style={styles.detailLabel}>{label}</Text>
			<Text style={[styles.detailValue, { color }]}>{value}</Text>
		</View>
	</View>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.white,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: SIZES.medium,
		paddingVertical: SIZES.small,
		borderBottomWidth: 1,
		borderBottomColor: "#F3F4F6",
	},
	closeButton: {
		padding: SIZES.small,
	},
	headerTitle: {
		fontSize: SIZES.large,
		fontWeight: "600",
		color: COLORS.primary,
	},
	placeholder: {
		width: 32, // Balance the header
	},
	content: {
		flex: 1,
		paddingHorizontal: SIZES.medium,
	},
	titleSection: {
		paddingVertical: SIZES.medium,
		borderBottomWidth: 1,
		borderBottomColor: "#F3F4F6",
	},
	titleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: SIZES.small,
	},
	taskTitle: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: "#111827",
		flex: 1,
		marginRight: SIZES.small,
	},
	taskId: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		fontWeight: "500",
	},
	urgencyBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	urgencyText: {
		color: "white",
		fontSize: 11,
		fontWeight: "bold",
	},
	section: {
		paddingVertical: SIZES.medium,
		borderBottomWidth: 1,
		borderBottomColor: "#F9FAFB",
	},
	sectionTitle: {
		fontSize: SIZES.medium,
		fontWeight: "600",
		color: COLORS.primary,
		marginBottom: SIZES.small,
	},
	description: {
		fontSize: SIZES.medium,
		lineHeight: 22,
		color: "#374151",
	},
	detailGrid: {
		gap: 0,
	},
	detailItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: SIZES.small,
	},
	detailContent: {
		marginLeft: SIZES.small,
		flex: 1,
	},
	detailLabel: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginBottom: 2,
	},
	detailValue: {
		fontSize: SIZES.medium,
		fontWeight: "500",
	},
	peopleSection: {
		gap: SIZES.small,
	},
	personCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F9FAFB",
		padding: SIZES.medium,
		borderRadius: SIZES.small,
	},
	personInfo: {
		marginLeft: SIZES.small,
		flex: 1,
	},
	personLabel: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginBottom: 2,
	},
	personName: {
		fontSize: SIZES.medium,
		fontWeight: "600",
		color: "#111827",
	},
	arrow: {
		alignItems: "center",
		paddingVertical: SIZES.small,
	},
	statusCard: {
		backgroundColor: "#F9FAFB",
		padding: SIZES.medium,
		borderRadius: SIZES.small,
	},
	statusText: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		marginBottom: 4,
	},
	statusValue: {
		fontWeight: "600",
		color: "#111827",
	},
	footer: {
		padding: SIZES.medium,
		borderTopWidth: 1,
		borderTopColor: "#F3F4F6",
	},
	acceptButton: {
		backgroundColor: "#52C197",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: SIZES.medium,
		borderRadius: SIZES.small,
		gap: SIZES.small,
	},
	urgentButton: {
		backgroundColor: "#EF4444",
	},
	disabledButton: {
		backgroundColor: "#9CA3AF",
		opacity: 0.7,
	},
	acceptButtonText: {
		color: "white",
		fontSize: SIZES.medium,
		fontWeight: "600",
	},
});

export default TaskDetailModal;
