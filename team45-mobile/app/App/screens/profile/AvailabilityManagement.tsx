import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../constants";

const daysOfWeek = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

const AvailabilityManagement = ({
	availability,
	onAdd,
	onRemove,
}: {
	availability: any[];
	onAdd: (slot: any) => void;
	onRemove: (id: string) => void;
}) => {
	const [showAddForm, setShowAddForm] = useState(false);
	const [newSlot, setNewSlot] = useState({
		day: "Monday",
		startTime: "08:00",
		endTime: "17:00",
	});

	const handleAdd = () => {
		if (newSlot.startTime >= newSlot.endTime) {
			alert("End time must be after start time");
			return;
		}

		const hasOverlap = availability.some(
			(slot) =>
				slot.day === newSlot.day &&
				((newSlot.startTime >= slot.startTime &&
					newSlot.startTime < slot.endTime) ||
					(newSlot.endTime > slot.startTime &&
						newSlot.endTime <= slot.endTime) ||
					(newSlot.startTime <= slot.startTime &&
						newSlot.endTime >= slot.endTime))
		);

		if (hasOverlap) {
			alert("This time slot overlaps with an existing availability");
			return;
		}

		onAdd(newSlot);
		setShowAddForm(false);
		setNewSlot({
			day: "Monday",
			startTime: "08:00",
			endTime: "17:00",
		});
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.addButton}
				onPress={() => setShowAddForm(!showAddForm)}>
				<Ionicons
					name={showAddForm ? "close" : "add"}
					size={20}
					color={COLORS.white}
				/>
				<Text style={styles.addButtonText}>
					{showAddForm ? "Cancel" : "Add Availability"}
				</Text>
			</TouchableOpacity>

			{showAddForm && (
				<View style={styles.addForm}>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Day</Text>
						<View style={styles.pickerContainer}>
							{daysOfWeek.map((day) => (
								<TouchableOpacity
									key={day}
									style={[
										styles.dayOption,
										newSlot.day === day &&
											styles.selectedDayOption,
									]}
									onPress={() =>
										setNewSlot({ ...newSlot, day })
									}>
									<Text
										style={[
											styles.dayOptionText,
											newSlot.day === day &&
												styles.selectedDayOptionText,
										]}>
										{day.substring(0, 3)}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					<View style={styles.timeInputGroup}>
						<View style={styles.timeInput}>
							<Text style={styles.label}>Start Time</Text>
							<TextInput
								style={styles.input}
								value={newSlot.startTime}
								onChangeText={(text) =>
									setNewSlot({ ...newSlot, startTime: text })
								}
								placeholder="HH:MM"
							/>
						</View>
						<View style={styles.timeInput}>
							<Text style={styles.label}>End Time</Text>
							<TextInput
								style={styles.input}
								value={newSlot.endTime}
								onChangeText={(text) =>
									setNewSlot({ ...newSlot, endTime: text })
								}
								placeholder="HH:MM"
							/>
						</View>
					</View>

					<TouchableOpacity
						style={styles.saveButton}
						onPress={handleAdd}>
						<Text style={styles.saveButtonText}>Save Slot</Text>
					</TouchableOpacity>
				</View>
			)}

			{availability.length > 0 ? (
				<View style={styles.slotsContainer}>
					{availability.map((slot) => (
						<View key={slot.id} style={styles.slot}>
							<View style={styles.slotInfo}>
								<Text style={styles.slotDay}>{slot.day}</Text>
								<Text style={styles.slotTime}>
									{slot.startTime} - {slot.endTime}
								</Text>
							</View>
							<TouchableOpacity
								style={styles.removeButton}
								onPress={() => onRemove(slot.id)}>
								<Ionicons
									name="trash"
									size={18}
									color={COLORS.error}
								/>
							</TouchableOpacity>
						</View>
					))}
				</View>
			) : (
				<View style={styles.emptyState}>
					<Ionicons name="calendar" size={40} color={COLORS.gray} />
					<Text style={styles.emptyText}>
						No availability slots added
					</Text>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: COLORS.white,
		padding: SIZES.large,
		marginBottom: SIZES.medium,
		borderRadius: SIZES.small,
	},
	addButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.primary,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		marginBottom: SIZES.large,
	},
	addButtonText: {
		color: COLORS.white,
		fontWeight: "600",
		marginLeft: SIZES.small,
	},
	addForm: {
		marginBottom: SIZES.large,
	},
	inputGroup: {
		marginBottom: SIZES.large,
	},
	label: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginBottom: SIZES.small / 2,
	},
	pickerContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	dayOption: {
		width: "14%",
		aspectRatio: 1,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: SIZES.small,
		backgroundColor: COLORS.gray2,
		marginBottom: SIZES.small,
	},
	selectedDayOption: {
		backgroundColor: COLORS.primary,
	},
	dayOptionText: {
		fontSize: SIZES.small,
		color: COLORS.gray,
	},
	selectedDayOptionText: {
		color: COLORS.white,
	},
	timeInputGroup: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	timeInput: {
		width: "48%",
	},
	input: {
		borderWidth: 1,
		borderColor: COLORS.gray2,
		borderRadius: SIZES.small,
		padding: SIZES.medium,
		fontSize: SIZES.medium,
	},
	saveButton: {
		backgroundColor: COLORS.primary,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		alignItems: "center",
		marginTop: SIZES.large,
	},
	saveButtonText: {
		color: COLORS.white,
		fontWeight: "600",
	},
	slotsContainer: {
		marginTop: SIZES.medium,
	},
	slot: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: SIZES.medium,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.gray2,
	},
	slotInfo: {
		flex: 1,
	},
	slotDay: {
		fontSize: SIZES.medium,
		color: COLORS.primary,
		fontWeight: "600",
	},
	slotTime: {
		fontSize: SIZES.small,
		color: COLORS.gray,
	},
	removeButton: {
		padding: SIZES.small,
	},
	emptyState: {
		alignItems: "center",
		paddingVertical: SIZES.xLarge,
	},
	emptyText: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		marginTop: SIZES.medium,
	},
});

export default AvailabilityManagement;
