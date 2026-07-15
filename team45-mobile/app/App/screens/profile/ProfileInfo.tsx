import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Modal,
} from "react-native";
import { COLORS, SIZES } from "../../../constants";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../contexts/AuthContext";
import { userApi } from "../../../service/user";

interface InfoModalProps {
	visible: boolean;
	onClose: () => void;
	title: string;
	content: string;
}

const InfoModal = ({ visible, onClose, title, content }: InfoModalProps) => {
	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}>
			<View style={modalStyles.overlay}>
				<View style={modalStyles.container}>
					<View style={modalStyles.header}>
						<Text style={modalStyles.title}>{title}</Text>
						<TouchableOpacity onPress={onClose}>
							<Ionicons
								name="close"
								size={25}
								color={COLORS.gray}
							/>
						</TouchableOpacity>
					</View>
					<View style={modalStyles.content}>
						<Text style={modalStyles.contentText}>{content}</Text>
					</View>

					<TouchableOpacity
						style={modalStyles.okButton}
						onPress={onClose}>
						<Text style={modalStyles.contentText}>Got It</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const ProfileInfo = ({
	profile,
	isEditing,
	setIsEditing,
	onUpdate,
}: {
	profile: any;
	isEditing: boolean;
	setIsEditing: (editing: boolean) => void;
	onUpdate: (data: any) => void;
}) => {
	const [formData, setFormData] = React.useState({
		name: profile.name,
		email: profile.email,
		phone: profile.phone,
		organization: profile.organization || "",
		address: profile.address || "",
		vehicleType: profile.vehicleType || "",
		capacity: profile.capacity || "",
	});

	// Add modal state
	const { user } = useAuth();
	const [showInfoModal, setShowInfoModal] = useState(false);
	const [isBackup, setIsBackup] = useState<boolean>(user?.is_backup!);

	const handleSubmit = () => {
		onUpdate(formData);
	};

	const updateBackupStatus = async (option: "opt_in" | "opt_out") => {
		const response = await userApi.updateBackupStatus(
			option,
			user?.id!,
			user?.role!
		);
	};

	return (
		<View style={styles.container}>
			{isEditing ? (
				<>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Full name</Text>
						<TextInput
							style={styles.input}
							value={formData.name}
							onChangeText={(text) =>
								setFormData({ ...formData, name: text })
							}
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Email address</Text>
						<TextInput
							style={styles.input}
							value={formData.email}
							onChangeText={(text) =>
								setFormData({ ...formData, email: text })
							}
							keyboardType="email-address"
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Phone number</Text>
						<TextInput
							style={styles.input}
							value={formData.phone}
							onChangeText={(text) =>
								setFormData({ ...formData, phone: text })
							}
							keyboardType="phone-pad"
						/>
					</View>

					{profile.role === "Volunteer" && (
						<>
							<View style={styles.inputGroup}>
								<Text style={styles.label}>Vehicle Type</Text>
								<TextInput
									style={styles.input}
									value={formData.vehicleType}
									onChangeText={(text) =>
										setFormData({
											...formData,
											vehicleType: text,
										})
									}
								/>
							</View>
							<View style={styles.inputGroup}>
								<Text style={styles.label}>Capacity</Text>
								<TextInput
									style={styles.input}
									value={formData.capacity}
									onChangeText={(text) =>
										setFormData({
											...formData,
											capacity: text,
										})
									}
								/>
							</View>
						</>
					)}

					{profile.role === "Receiver" && (
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Organization</Text>
							<TextInput
								style={styles.input}
								value={formData.organization}
								onChangeText={(text) =>
									setFormData({
										...formData,
										organization: text,
									})
								}
							/>
						</View>
					)}

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Address</Text>
						<TextInput
							style={styles.input}
							value={formData.address}
							onChangeText={(text) =>
								setFormData({ ...formData, address: text })
							}
						/>
					</View>

					<View style={styles.buttonGroup}>
						<TouchableOpacity
							style={[styles.button, styles.cancelButton]}
							onPress={() => setIsEditing(false)}>
							<Text style={styles.cancelButtonText}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.button, styles.saveButton]}
							onPress={handleSubmit}>
							<Text style={styles.saveButtonText}>
								Save Changes
							</Text>
						</TouchableOpacity>
					</View>
				</>
			) : (
				<>
					<View style={styles.infoGroup}>
						<Text style={styles.label}>Full name</Text>
						<Text style={styles.infoText}>{profile.name}</Text>
					</View>

					<View style={styles.infoGroup}>
						<Text style={styles.label}>Email address</Text>
						<Text style={styles.infoText}>{profile.email}</Text>
					</View>

					<View style={styles.infoGroup}>
						<Text style={styles.label}>Phone number</Text>
						<Text style={styles.infoText}>{profile.phone}</Text>
					</View>

					{profile.role === "Volunteer" && (
						<>
							<View style={styles.infoGroup}>
								<Text style={styles.label}>Vehicle Type</Text>
								<Text style={styles.infoText}>
									{profile.vehicleType}
								</Text>
							</View>
							<View style={styles.infoGroup}>
								<Text style={styles.label}>Capacity</Text>
								<Text style={styles.infoText}>
									{profile.capacity}
								</Text>
							</View>
						</>
					)}

					{profile.role === "Receiver" && (
						<View style={styles.infoGroup}>
							<Text style={styles.label}>Organization</Text>
							<Text style={styles.infoText}>
								{profile.organization}
							</Text>
						</View>
					)}

					<View style={styles.infoGroup}>
						<Text style={styles.label}>Address</Text>
						<Text style={styles.infoText}>{profile.address}</Text>
					</View>
					{user?.role === "receiver" && (
						<>
							<View
								style={[
									styles.backupContainer,
									isBackup
										? styles.activeBackup
										: styles.inactiveBackup,
								]}>
								<View
									style={{
										flexDirection: "row",
										marginBottom: 0,
									}}>
									<Text>Be a backup receiver</Text>
									<TouchableOpacity
										style={{ paddingLeft: 8 }}
										onPress={() => setShowInfoModal(true)}>
										<Ionicons
											name="warning-outline"
											size={20}
										/>
									</TouchableOpacity>
								</View>
								<TouchableOpacity style={styles.backupButton}>
									<Text style={styles.editButtonText}>
										Opt In
									</Text>
								</TouchableOpacity>
							</View>
							<InfoModal
								visible={showInfoModal}
								onClose={() => setShowInfoModal(false)}
								title="Backup Receiver"
								content="As a backup receiver, you'll will be notified and assigned food when primary receivers can't fulfill a donation pickup. This helps ensure no food go to waste."
							/>
						</>
					)}
					{user?.role === "volunteer" && (
						<>
							<View
								style={[
									styles.backupContainer,
									isBackup === true
										? styles.activeBackup
										: styles.inactiveBackup,
								]}>
								<View
									style={{
										flexDirection: "row",
										marginBottom: 0,
									}}>
									<Text>Be a backup volunteer</Text>
									<TouchableOpacity
										style={{ paddingLeft: 8 }}
										onPress={() => setShowInfoModal(true)}>
										<Ionicons
											name="warning-outline"
											size={20}
										/>
									</TouchableOpacity>
								</View>
								<TouchableOpacity style={styles.backupButton}>
									<Text style={styles.editButtonText}>
										{isBackup === false
											? "Opt In"
											: "Opt Out"}
									</Text>
								</TouchableOpacity>
							</View>
							<InfoModal
								visible={showInfoModal}
								onClose={() => setShowInfoModal(false)}
								title="Backup Volunteer"
								content="As a backup volunteer, you'll will be notified and assigned to a delivery should you be available when another volunteer can't complete a delivery. This helps ensure no food go to waste."
							/>
						</>
					)}

					<TouchableOpacity
						style={styles.editButton}
						onPress={() => setIsEditing(true)}>
						<Text style={styles.editButtonText}>Edit Profile</Text>
					</TouchableOpacity>
				</>
			)}
		</View>
	);
};

const modalStyles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		padding: SIZES.large,
	},
	container: {
		backgroundColor: COLORS.white,
		borderRadius: SIZES.medium,
		padding: SIZES.large,
		width: "100%",
		maxWidth: 350,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: SIZES.medium,
	},
	title: {
		fontSize: SIZES.large,
		fontWeight: "600",
		color: COLORS.primary,
	},
	content: {
		marginBottom: SIZES.large,
	},
	contentText: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		lineHeight: 22,
	},
	okButton: {
		backgroundColor: COLORS.primary,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		alignItems: "center",
	},
	okButtonText: {
		color: COLORS.white,
		fontWeight: "600",
	},
});

const styles = StyleSheet.create({
	container: {
		backgroundColor: COLORS.white,
		padding: SIZES.large,
		marginBottom: SIZES.medium,
		borderRadius: SIZES.small,
	},
	inputGroup: {
		marginBottom: SIZES.large,
	},
	infoGroup: {
		marginBottom: SIZES.large,
	},
	label: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginBottom: SIZES.small / 2,
	},
	input: {
		borderWidth: 1,
		borderColor: COLORS.gray2,
		borderRadius: SIZES.small,
		padding: SIZES.medium,
		fontSize: SIZES.medium,
	},
	infoText: {
		fontSize: SIZES.medium,
		color: COLORS.primary,
	},
	buttonGroup: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: SIZES.large,
	},
	button: {
		flex: 1,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		alignItems: "center",
	},
	cancelButton: {
		backgroundColor: COLORS.gray2,
		marginRight: SIZES.small,
	},
	saveButton: {
		backgroundColor: COLORS.primary,
		marginLeft: SIZES.small,
	},
	cancelButtonText: {
		color: COLORS.gray,
		fontWeight: "600",
	},
	saveButtonText: {
		color: COLORS.white,
		fontWeight: "600",
	},
	editButton: {
		backgroundColor: COLORS.primary,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		alignItems: "center",
		marginTop: SIZES.large,
	},
	editButtonText: {
		color: COLORS.white,
		fontWeight: "600",
	},
	backupContainer: {
		flex: 1,
		borderWidth: 1,
		padding: 18,
		borderRadius: 8,
	},
	activeBackup: {
		backgroundColor: "rgba(255, 59, 48, 0.1)",
		borderColor: COLORS.error,
	},
	inactiveBackup: {
		backgroundColor: "rgba(154, 207, 157, 1)",
		borderColor: COLORS.success,
	},
	backupButton: {
		backgroundColor: COLORS.primary,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		alignItems: "center",
		marginTop: SIZES.medium,
		width: "27%",
	},
});

export default ProfileInfo;
