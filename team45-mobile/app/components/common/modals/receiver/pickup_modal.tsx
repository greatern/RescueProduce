import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native";

interface PickupModal {
	visible: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	setConfirmCode: React.Dispatch<React.SetStateAction<string>>;
}

const PickupModal = ({
	visible,
	message,
	onClose,
	onConfirm,
	title,
	setConfirmCode,
}: PickupModal) => {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}>
			<View style={modalStyles.overlay}>
				<View style={modalStyles.container}>
					<Text style={modalStyles.title}>{title} </Text>
					<Text style={modalStyles.message}>{message} </Text>
					<TextInput
						style={modalStyles.input}
						placeholder="Enter confirmation code"
						onChangeText={setConfirmCode}
						autoCapitalize="none"
						maxLength={6}
						autoCorrect={false}
					/>
					<View style={modalStyles.buttonRow}>
						<TouchableOpacity
							style={modalStyles.cancelButton}
							onPress={onClose}>
							<Text style={modalStyles.cancelText}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={modalStyles.confirmButton}
							onPress={onConfirm}>
							<Text
								style={modalStyles.confirmText}
								onPress={() => {}}>
								Confirm
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default PickupModal;

const modalStyles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.3)",
		justifyContent: "center",
		alignItems: "center",
	},
	container: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 24,
		width: "80%",
		alignItems: "center",
	},
	input: {
		width: "100%",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 10,
		marginBottom: 24,
		fontSize: 16,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
	},
	message: {
		fontSize: 16,
		marginBottom: 24,
		textAlign: "center",
	},
	buttonRow: {
		flexDirection: "row",
		gap: 16,
	},
	cancelButton: {
		backgroundColor: "#eee",
		paddingVertical: 10,
		paddingHorizontal: 24,
		borderRadius: 8,
	},
	confirmButton: {
		backgroundColor: "#007AFF",
		paddingVertical: 10,
		paddingHorizontal: 24,
		borderRadius: 8,
	},
	cancelText: {
		color: "#333",
		fontWeight: "bold",
	},
	confirmText: {
		color: "#fff",
		fontWeight: "bold",
	},
});
