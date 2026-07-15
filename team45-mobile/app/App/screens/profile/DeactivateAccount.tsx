import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../constants";

const DeactivateAccount = () => {
	const [showModal, setShowModal] = useState(false);

	return (
		<View style={styles.container}>
			<View style={styles.warningBox}>
				<Ionicons name="warning" size={24} color={COLORS.error} />
				<Text style={styles.warningText}>
					Deactivating your account will remove your profile and
					cancel any pending assignments.
				</Text>
			</View>

			<TouchableOpacity
				style={styles.deactivateButton}
				onPress={() => setShowModal(true)}>
				<Ionicons name="trash" size={20} color={COLORS.white} />
				<Text style={styles.deactivateButtonText}>
					Deactivate Account
				</Text>
			</TouchableOpacity>

			<Modal
				visible={showModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowModal(false)}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Ionicons
								name="warning"
								size={32}
								color={COLORS.error}
							/>
							<Text style={styles.modalTitle}>
								Confirm Deactivation
							</Text>
						</View>

						<Text style={styles.modalText}>
							Are you sure you want to deactivate your account?
							This action cannot be undone.
						</Text>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[
									styles.modalButton,
									styles.cancelButton,
								]}
								onPress={() => setShowModal(false)}>
								<Text style={styles.cancelButtonText}>
									Cancel
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.modalButton,
									styles.confirmButton,
								]}
								onPress={() => {
									// deactivation needs handling
									setShowModal(false);
								}}>
								<Text style={styles.confirmButtonText}>
									Deactivate
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
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
	warningBox: {
		flexDirection: "row",
		backgroundColor: COLORS.error + "10",
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		marginBottom: SIZES.large,
	},
	warningText: {
		flex: 1,
		marginLeft: SIZES.medium,
		color: COLORS.error,
	},
	deactivateButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.error,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
	},
	deactivateButtonText: {
		color: COLORS.white,
		fontWeight: "600",
		marginLeft: SIZES.small,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalContent: {
		width: "80%",
		backgroundColor: COLORS.white,
		borderRadius: SIZES.medium,
		padding: SIZES.large,
	},
	modalHeader: {
		alignItems: "center",
		marginBottom: SIZES.large,
	},
	modalTitle: {
		fontSize: SIZES.large,
		fontWeight: "bold",
		color: COLORS.error,
		marginTop: SIZES.medium,
	},
	modalText: {
		textAlign: "center",
		color: COLORS.gray,
		marginBottom: SIZES.xLarge,
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	modalButton: {
		flex: 1,
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		alignItems: "center",
	},
	cancelButton: {
		backgroundColor: COLORS.gray2,
		marginRight: SIZES.small,
	},
	confirmButton: {
		backgroundColor: COLORS.error,
		marginLeft: SIZES.small,
	},
	cancelButtonText: {
		color: COLORS.gray,
		fontWeight: "600",
	},
	confirmButtonText: {
		color: COLORS.white,
		fontWeight: "600",
	},
});

export default DeactivateAccount;
