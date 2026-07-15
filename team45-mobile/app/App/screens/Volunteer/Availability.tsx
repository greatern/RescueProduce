import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	RefreshControl,
	Modal,
} from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import * as volunteerService from "../../../service/volunteer";
import { COLORS, SIZES } from "../../../constants";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { AvailabilitySlot } from "../../../types";

const daysOfWeek = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

const timeSlots = [
	"06:00",
	"07:00",
	"08:00",
	"09:00",
	"10:00",
	"11:00",
	"12:00",
	"13:00",
	"14:00",
	"15:00",
	"16:00",
	"17:00",
	"18:00",
	"19:00",
	"20:00",
	"21:00",
	"22:00",
];

const Availability = () => {
	const { user } = useAuth();
	const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddModal, setShowAddModal] = useState(false);
	const [newSlot, setNewSlot] = useState({
		day_of_week: "Monday",
		start_time: "09:00",
		end_time: "17:00",
	});

	const fetchAvailability = useCallback(async () => {
		if (!user?.id) return;
		try {
			setLoading(true);
			const data = await volunteerService.getAvailability(user.id);
			setAvailability(data);
		} catch (error) {
			Alert.alert("Error", "Failed to fetch availability.");
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		fetchAvailability();
	}, [fetchAvailability]);

	const handleAddSlot = async () => {
		if (!user?.id) return;
		if (!newSlot.day_of_week || !newSlot.start_time || !newSlot.end_time) {
			Alert.alert("Missing fields", "Please fill all fields.");
			return;
		}

		if (newSlot.start_time >= newSlot.end_time) {
			Alert.alert("Invalid time", "Start time must be before end time.");
			return;
		}

		// Check for overlapping slots
		const hasOverlap = availability.some(
			(slot) =>
				slot.day_of_week === newSlot.day_of_week &&
				((newSlot.start_time >= slot.start_time &&
					newSlot.start_time < slot.end_time) ||
					(newSlot.end_time > slot.start_time &&
						newSlot.end_time <= slot.end_time))
		);

		if (hasOverlap) {
			Alert.alert(
				"Time conflict",
				"This time slot overlaps with an existing availability."
			);
			return;
		}

		setLoading(true);
		try {
			await volunteerService.setAvailability(user.id, newSlot);
			await fetchAvailability();
			setShowAddModal(false);
			setNewSlot({
				day_of_week: "Monday",
				start_time: "09:00",
				end_time: "17:00",
			});
			Alert.alert("Success", "Availability slot added!");
		} catch (error) {
			Alert.alert("Error", "Failed to add availability slot.");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteSlot = async (slotToDelete: {
		day_of_week: string;
		start_time: string;
	}) => {
		Alert.alert(
			"Delete Availability",
			`Are you sure you want to delete your ${slotToDelete.day_of_week} availability?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						if (!user?.id) return;
						setLoading(true);
						try {
							await volunteerService.deleteAvailability(user.id, {
								day_of_week: slotToDelete.day_of_week,
							});
							await fetchAvailability();
							Alert.alert(
								"Success",
								"Availability slot deleted!"
							);
						} catch (error) {
							Alert.alert(
								"Error",
								"Failed to delete availability slot."
							);
						} finally {
							setLoading(false);
						}
					},
				},
			]
		);
	};

	const formatTime = (time: string) => {
		return time.substring(0, 5);
	};

	const groupAvailabilityByDay = () => {
		const grouped: { [key: string]: AvailabilitySlot[] } = {};
		availability.forEach((slot) => {
			if (!grouped[slot.day_of_week]) {
				grouped[slot.day_of_week] = [];
			}
			grouped[slot.day_of_week].push(slot);
		});
		return grouped;
	};

	const getTotalHours = () => {
		return availability.reduce((total, slot) => {
			const start = new Date(`1970-01-01T${slot.start_time}`);
			const end = new Date(`1970-01-01T${slot.end_time}`);
			const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
			return total + hours;
		}, 0);
	};

	const groupedAvailability = groupAvailabilityByDay();

	return (
		<ScrollView
			style={styles.container}
			refreshControl={
				<RefreshControl
					refreshing={loading}
					onRefresh={fetchAvailability}
					colors={[COLORS.primary]}
				/>
			}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>My Availability</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => setShowAddModal(true)}>
					<Ionicons name="add" size={24} color="white" />
				</TouchableOpacity>
			</View>

			{/* Stats Card */}
			<View style={styles.statsCard}>
				<View style={styles.statRow}>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>
							{availability.length}
						</Text>
						<Text style={styles.statLabel}>Time Slots</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>
							{getTotalHours().toFixed(1)}h
						</Text>
						<Text style={styles.statLabel}>Total Hours</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statNumber}>
							{Object.keys(groupedAvailability).length}
						</Text>
						<Text style={styles.statLabel}>Active Days</Text>
					</View>
				</View>
			</View>

			{/* Availability by Day */}
			{Object.keys(groupedAvailability).length === 0 ? (
				<View style={styles.emptyContainer}>
					<Ionicons
						name="calendar-outline"
						size={48}
						color={COLORS.gray}
					/>
					<Text style={styles.emptyText}>No availability set</Text>
					<Text style={styles.emptySubtext}>
						Add your first time slot to start receiving tasks
					</Text>
				</View>
			) : (
				daysOfWeek.map((day) => {
					const daySlots = groupedAvailability[day];
					if (!daySlots) return null;

					return (
						<View key={day} style={styles.dayCard}>
							<Text style={styles.dayTitle}>{day}</Text>
							{daySlots.map((slot, index) => (
								<View key={index} style={styles.slotRow}>
									<View style={styles.timeContainer}>
										<Ionicons
											name="time-outline"
											size={16}
											color={COLORS.primary}
										/>
										<Text style={styles.slotTime}>
											{formatTime(slot.start_time)} -{" "}
											{formatTime(slot.end_time)}
										</Text>
									</View>
									<TouchableOpacity
										onPress={() =>
											handleDeleteSlot({
												day_of_week: slot.day_of_week,
												start_time: slot.start_time,
											})
										}
										disabled={loading}
										style={styles.deleteButton}>
										<Ionicons
											name="trash-bin-outline"
											size={20}
											color={COLORS.error}
										/>
									</TouchableOpacity>
								</View>
							))}
						</View>
					);
				})
			)}

			{/* Add Availability Modal */}
			<Modal
				visible={showAddModal}
				animationType="slide"
				transparent={true}
				onRequestClose={() => setShowAddModal(false)}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>
								Add Availability
							</Text>
							<TouchableOpacity
								onPress={() => setShowAddModal(false)}>
								<Ionicons
									name="close"
									size={24}
									color={COLORS.gray}
								/>
							</TouchableOpacity>
						</View>

						<View style={styles.pickerSection}>
							<Text style={styles.pickerLabel}>Day of Week</Text>
							<View style={styles.pickerContainer}>
								<Picker
									selectedValue={newSlot.day_of_week}
									onValueChange={(itemValue) =>
										setNewSlot((prev) => ({
											...prev,
											day_of_week: itemValue,
										}))
									}>
									{daysOfWeek.map((day) => (
										<Picker.Item
											key={day}
											label={day}
											value={day}
										/>
									))}
								</Picker>
							</View>
						</View>

						<View style={styles.timePickerRow}>
							<View style={styles.timePickerSection}>
								<Text style={styles.pickerLabel}>
									Start Time
								</Text>
								<View style={styles.pickerContainer}>
									<Picker
										selectedValue={newSlot.start_time}
										onValueChange={(itemValue) =>
											setNewSlot((prev) => ({
												...prev,
												start_time: itemValue,
											}))
										}>
										{timeSlots.map((time) => (
											<Picker.Item
												key={time}
												label={time}
												value={time}
											/>
										))}
									</Picker>
								</View>
							</View>

							<View style={styles.timePickerSection}>
								<Text style={styles.pickerLabel}>End Time</Text>
								<View style={styles.pickerContainer}>
									<Picker
										selectedValue={newSlot.end_time}
										onValueChange={(itemValue) =>
											setNewSlot((prev) => ({
												...prev,
												end_time: itemValue,
											}))
										}>
										{timeSlots.map((time) => (
											<Picker.Item
												key={time}
												label={time}
												value={time}
											/>
										))}
									</Picker>
								</View>
							</View>
						</View>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.cancelModalButton}
								onPress={() => setShowAddModal(false)}>
								<Text style={styles.cancelModalButtonText}>
									Cancel
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.addModalButton,
									loading && styles.disabledButton,
								]}
								onPress={handleAddSlot}
								disabled={loading}>
								{loading ? (
									<ActivityIndicator
										color="white"
										size="small"
									/>
								) : (
									<Text style={styles.addModalButtonText}>
										Add Slot
									</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: SIZES.medium,
		backgroundColor: COLORS.lightWhite,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SIZES.large,
	},
	headerTitle: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
	},
	addButton: {
		backgroundColor: COLORS.primary,
		borderRadius: 20,
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		elevation: 2,
	},
	statsCard: {
		backgroundColor: COLORS.white,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		marginBottom: SIZES.large,
		elevation: 2,
	},
	statRow: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
	statItem: {
		alignItems: "center",
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
	dayCard: {
		backgroundColor: COLORS.white,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		marginBottom: SIZES.small,
		elevation: 1,
	},
	dayTitle: {
		fontSize: SIZES.medium,
		fontWeight: "bold",
		color: COLORS.primary,
		marginBottom: SIZES.small,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.gray2,
		paddingBottom: SIZES.small,
	},
	slotRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: SIZES.small,
	},
	timeContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	slotTime: {
		marginLeft: 6,
		fontSize: SIZES.medium,
		fontWeight: "500",
	},
	deleteButton: {
		padding: SIZES.small,
		borderRadius: SIZES.small,
	},
	emptyContainer: {
		alignItems: "center",
		paddingTop: 50,
		backgroundColor: COLORS.white,
		borderRadius: SIZES.small,
		padding: SIZES.large,
		elevation: 1,
	},
	emptyText: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		marginTop: SIZES.small,
		fontWeight: "500",
	},
	emptySubtext: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginTop: SIZES.small,
		textAlign: "center",
	},

	// Modal styles
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		backgroundColor: "white",
		borderRadius: SIZES.medium,
		padding: SIZES.large,
		width: "90%",
		maxHeight: "80%",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SIZES.large,
	},
	modalTitle: {
		fontSize: SIZES.large,
		fontWeight: "bold",
		color: COLORS.primary,
	},
	pickerSection: {
		marginBottom: SIZES.medium,
	},
	pickerLabel: {
		fontSize: SIZES.medium,
		fontWeight: "500",
		marginBottom: SIZES.small,
		color: COLORS.secondary,
	},
	pickerContainer: {
		borderWidth: 1,
		borderColor: COLORS.gray2,
		borderRadius: SIZES.small,
	},
	timePickerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: SIZES.small,
	},
	timePickerSection: {
		flex: 1,
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: SIZES.medium,
		marginTop: SIZES.large,
	},
	cancelModalButton: {
		flex: 1,
		paddingVertical: SIZES.medium,
		borderWidth: 1,
		borderColor: COLORS.gray,
		borderRadius: SIZES.small,
		alignItems: "center",
	},
	cancelModalButtonText: {
		color: COLORS.gray,
		fontWeight: "500",
	},
	addModalButton: {
		flex: 1,
		paddingVertical: SIZES.medium,
		backgroundColor: COLORS.primary,
		borderRadius: SIZES.small,
		alignItems: "center",
	},
	addModalButtonText: {
		color: "white",
		fontWeight: "bold",
	},
	disabledButton: {
		backgroundColor: COLORS.gray,
		opacity: 0.7,
	},
});

export default Availability;
