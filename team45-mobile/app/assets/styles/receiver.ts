import { StyleSheet } from "react-native";
import { COLORS, SHADOWS, SIZES } from "../../constants";

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		padding: 16,
		margin: 8,
		marginTop: 0,
		borderRadius: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		width: "100%",
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
		color: "#333,",
	},
	cardButton: {
		backgroundColor: "#007aff",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 6,
		alignItems: "center",
	},
	cardButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
	container: {
		flex: 1,
		marginTop: 0,
		justifyContent: "space-between",
		alignItems: "center",
		flexDirection: "row",
		padding: SIZES.medium,
		borderRadius: SIZES.small,
		backgroundColor: "#FFF",
		...SHADOWS.medium,
		shadowColor: COLORS.white,
	},
	textContainer: {
		flex: 1,
		marginHorizontal: SIZES.medium,
	},
	image: {
		width: "100%",
		height: 150,
		borderRadius: 8,
	},
	imageContainer: {
		marginBottom: 12,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
		color: "#333",
	},
});

export default styles;
