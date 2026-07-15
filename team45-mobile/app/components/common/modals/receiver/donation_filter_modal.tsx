import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES, FONT } from "../../../../constants";

interface SortOption {
	key: string;
	label: string;
	icon: string;
}

interface SortModalProps {
	visible: boolean;
	currentSort: string;
	onSortChange: (sortKey: string) => void;
	onClose: () => void;
}

const SORT_OPTIONS: SortOption[] = [
	{ key: "newest", label: "Newest First", icon: "time-outline" },
	{ key: "oldest", label: "Oldest First", icon: "time" },
	{ key: "expiry_asc", label: "Expiring Soon", icon: "calendar-outline" },
	{ key: "expiry_desc", label: "Expiring Later", icon: "calendar" },
	{ key: "quantity_desc", label: "Most Available", icon: "cube-outline" },
	{ key: "quantity_asc", label: "Least Available", icon: "cube" },
	{ key: "weight_desc", label: "Heaviest Items", icon: "barbell-outline" },
	{ key: "weight_asc", label: "Lightest Items", icon: "barbell" },
];

const SortSection = ({
	title,
	options,
	currentSort,
	onSelect,
}: {
	title: string;
	options: SortOption[];
	currentSort: string;
	onSelect: (key: string) => void;
}) => (
	<View style={styles.sortSection}>
		<Text style={styles.sortSectionTitle}>{title}</Text>
		{options.map((option) => (
			<TouchableOpacity
				key={option.key}
				style={[
					styles.sortOption,
					currentSort === option.key && styles.activeSortOption,
				]}
				onPress={() => onSelect(option.key)}>
				<Ionicons
					name={option.icon as any}
					size={20}
					color={
						currentSort === option.key
							? COLORS.primary
							: COLORS.gray
					}
				/>
				<Text
					style={[
						styles.sortOptionText,
						currentSort === option.key &&
							styles.activeSortOptionText,
					]}>
					{option.label}
				</Text>
				{currentSort === option.key && (
					<Ionicons
						name="checkmark"
						size={20}
						color={COLORS.primary}
					/>
				)}
			</TouchableOpacity>
		))}
	</View>
);

const SortModal = ({
	visible,
	currentSort,
	onSortChange,
	onClose,
}: SortModalProps) => {
	if (!visible) return null;

	const handleSortSelect = (sortKey: string) => {
		onSortChange(sortKey);
		onClose();
	};

	const dateOptions = SORT_OPTIONS.filter(
		(option) =>
			option.key.includes("newest") || option.key.includes("oldest")
	);

	const expiryOptions = SORT_OPTIONS.filter((option) =>
		option.key.includes("expiry")
	);

	const quantityOptions = SORT_OPTIONS.filter((option) =>
		option.key.includes("quantity")
	);

	const weightOptions = SORT_OPTIONS.filter((option) =>
		option.key.includes("weight")
	);

	return (
		<View style={styles.modalOverlay}>
			<TouchableOpacity style={styles.modalBackdrop} onPress={onClose} />
			<View style={styles.sortModalContainer}>
				<View style={styles.sortModalHeader}>
					<Text style={styles.sortModalTitle}>Sort Donations</Text>
					<TouchableOpacity onPress={onClose}>
						<Ionicons name="close" size={24} color={COLORS.gray} />
					</TouchableOpacity>
				</View>

				<ScrollView style={styles.sortOptionsContainer}>
					<SortSection
						title="By Date"
						options={dateOptions}
						currentSort={currentSort}
						onSelect={handleSortSelect}
					/>

					<SortSection
						title="By Expiry"
						options={expiryOptions}
						currentSort={currentSort}
						onSelect={handleSortSelect}
					/>

					<SortSection
						title="By Quantity"
						options={quantityOptions}
						currentSort={currentSort}
						onSelect={handleSortSelect}
					/>

					<SortSection
						title="By Weight"
						options={weightOptions}
						currentSort={currentSort}
						onSelect={handleSortSelect}
					/>
				</ScrollView>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
		zIndex: 1000,
	},
	modalBackdrop: {
		flex: 1,
	},
	sortModalContainer: {
		backgroundColor: COLORS.white,
		borderTopLeftRadius: SIZES.medium,
		borderTopRightRadius: SIZES.medium,
		paddingBottom: SIZES.large,
		maxHeight: "70%",
	},
	sortModalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	sortModalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
	sortOptionsContainer: {
		maxHeight: 400,
	},
	sortSection: {
		marginBottom: SIZES.medium,
	},
	sortSectionTitle: {
		fontSize: SIZES.medium,
		fontFamily: FONT.medium,
		color: COLORS.primary,
		marginHorizontal: SIZES.medium,
		marginBottom: SIZES.xSmall,
		paddingBottom: SIZES.xSmall,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	sortOption: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: SIZES.medium,
		paddingVertical: SIZES.small,
		marginHorizontal: SIZES.small,
		marginVertical: 2,
		borderRadius: SIZES.small,
	},
	activeSortOption: {
		backgroundColor: `${COLORS.primary}10`,
	},
	sortOptionText: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
		marginLeft: SIZES.small,
		flex: 1,
	},
	activeSortOptionText: {
		color: COLORS.primary,
		fontWeight: "600",
	},
});

export default SortModal;
