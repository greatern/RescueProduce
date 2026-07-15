// app/App/components/NotificationCenter.tsx
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import apiClient from "../service/api";
import { useNotifications } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../service/user";
//import { webSocketService } from "../service/web_socket";

interface Notification {
	id: string;
	title: string;
	message: string;
	notification_type: string;
	related_entity_type?: string;
	related_entity_id?: string;
	is_read: boolean;
	created_at: string;
}

interface NotificationCenterProps {
	userId: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const { push_token } = useNotifications();
	const { user } = useAuth();

	const fetchNotifications = async (refresh = false) => {
		if (refresh) {
			setRefreshing(true);
		} else {
			setLoading(true);
		}

		try {
			const response = await apiClient.get(
				`/api/notifications/user/${userId}`
			);
			if (response.data.success) {
				setNotifications(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching notifications:", error);
			Alert.alert("Error", "Failed to load notifications");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const markAsRead = async (notificationId: string) => {
		try {
			await apiClient.patch(`/api/notifications/${notificationId}/read`);
			setNotifications((prev) =>
				prev.map((notif) =>
					notif.id === notificationId
						? { ...notif, is_read: true }
						: notif
				)
			);
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	const markAllAsRead = async () => {
		try {
			await apiClient.patch(`/api/notifications/user/${userId}/read-all`);
			setNotifications((prev) =>
				prev.map((notif) => ({ ...notif, is_read: true }))
			);
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
		}
	};

	const testServerNotification = async () => {
		const payload = {
			user_id: user?.id,
			title: "Test",
			message: "This is a test",
			data: {},
		};
		await userApi.testNotification(payload);
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "info":
				return "information-circle-outline";
			case "alert":
				return "warning-outline";
			case "system":
				return "settings-outline";
			default:
				return "notifications-outline";
		}
	};

	const extractOtpFromMessage = (message: string): string | null => {
		const otpMatch = message.match(/\b\d{6}\b/);
		return otpMatch ? otpMatch[0] : null;
	};

	const isOtpNotification = (notification: Notification): boolean => {
		return (
			notification.title
				.toLowerCase()
				.includes("delivery confirmation code") ||
			notification.message.toLowerCase().includes("confirmation code")
		);
	};

	const renderNotification = ({ item }: { item: Notification }) => {
		const isRead = item.is_read;
		const isOtp = isOtpNotification(item);
		const otpCode = isOtp ? extractOtpFromMessage(item.message) : null;

		return (
			<TouchableOpacity
				style={[
					styles.notificationItem,
					!isRead && styles.unreadNotification,
					isOtp && styles.otpNotification,
				]}
				onPress={() => !isRead && markAsRead(item.id)}>
				<View style={styles.notificationHeader}>
					<View style={styles.iconContainer}>
						<Ionicons
							name={getNotificationIcon(item.notification_type)}
							size={24}
							color={isOtp ? COLORS.primary : COLORS.gray}
						/>
						{!isRead && <View style={styles.unreadDot} />}
					</View>
					<View style={styles.notificationContent}>
						<Text
							style={[
								styles.title,
								!isRead && styles.unreadTitle,
							]}>
							{item.title}
						</Text>
						<Text style={styles.message}>{item.message}</Text>

						{isOtp && otpCode && (
							<View style={styles.otpContainer}>
								<Text style={styles.otpLabel}>
									Verification Code:
								</Text>
								<Text style={styles.otpCode}>{otpCode}</Text>
								<Text style={styles.otpInstruction}>
									Share this code with the volunteer
								</Text>
							</View>
						)}

						<Text style={styles.timestamp}>
							{new Date(item.created_at).toLocaleString()}
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	const unreadCount = notifications.filter((n) => !n.is_read).length;

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Notifications</Text>
				{unreadCount > 0 && (
					<View style={styles.headerActions}>
						<Text style={styles.unreadCount}>
							{unreadCount} unread
						</Text>
						<TouchableOpacity onPress={markAllAsRead}>
							<Text style={styles.markAllRead}>
								Mark all read
							</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>

			<FlatList
				data={notifications}
				renderItem={renderNotification}
				keyExtractor={(item) => item.id}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => fetchNotifications(true)}
						colors={[COLORS.primary]}
					/>
				}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Ionicons
							name="notifications-outline"
							size={60}
							color={COLORS.gray}
						/>
						<Text style={styles.emptyText}>
							No notifications yet
						</Text>
						<Text style={styles.emptySubtext}>
							Delivery codes and updates will appear here
						</Text>
					</View>
				}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.lightWhite,
	},
	button: {
		backgroundColor: COLORS.primary,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		alignItems: "center",
	},
	header: {
		backgroundColor: COLORS.white,
		padding: SIZES.medium,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: COLORS.gray2,
	},
	headerTitle: {
		fontSize: SIZES.large,
		fontWeight: "bold",
		color: COLORS.primary,
	},
	headerActions: {
		alignItems: "flex-end",
	},
	unreadCount: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginBottom: 4,
	},
	markAllRead: {
		fontSize: SIZES.small,
		color: COLORS.primary,
		fontWeight: "500",
	},
	notificationItem: {
		backgroundColor: COLORS.white,
		marginHorizontal: SIZES.small,
		marginVertical: SIZES.small / 2,
		borderRadius: SIZES.small,
		padding: SIZES.medium,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	unreadNotification: {
		borderLeftWidth: 4,
		borderLeftColor: COLORS.primary,
	},
	otpNotification: {
		borderColor: COLORS.primary,
		borderWidth: 2,
		backgroundColor: "#F0F8FF",
	},
	notificationHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
	},
	iconContainer: {
		position: "relative",
		marginRight: SIZES.medium,
	},
	unreadDot: {
		position: "absolute",
		top: -2,
		right: -2,
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.error,
	},
	notificationContent: {
		flex: 1,
	},
	title: {
		fontSize: SIZES.medium,
		fontWeight: "600",
		color: COLORS.primary,
		marginBottom: SIZES.small / 2,
	},
	unreadTitle: {
		fontWeight: "bold",
		color: COLORS.primary,
	},
	message: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		lineHeight: 20,
		marginBottom: SIZES.small,
	},
	otpContainer: {
		backgroundColor: COLORS.white,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		borderWidth: 1,
		borderColor: COLORS.primary,
		marginBottom: SIZES.small,
		alignItems: "center",
	},
	otpLabel: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginBottom: SIZES.small / 2,
	},
	otpCode: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
		letterSpacing: 4,
		fontFamily: "monospace",
		marginBottom: SIZES.small / 2,
	},
	otpInstruction: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		fontStyle: "italic",
	},
	timestamp: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		fontStyle: "italic",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: SIZES.xxLarge,
	},
	emptyText: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		marginTop: SIZES.medium,
		textAlign: "center",
	},
	emptySubtext: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginTop: SIZES.small,
		textAlign: "center",
	},
});

export default NotificationCenter;
