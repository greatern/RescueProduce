import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Dimensions,
	ActivityIndicator,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES } from "../../../constants";
import { SafeAreaProvider } from "react-native-safe-area-context";

type AnalyticsData = {
	totalDonations: number;
	mealsProvided: number;
	co2Saved: number;
	completionRate: number;
	recentActivity: {
		date: string;
		description: string;
		quantity: string;
	}[];
};

const { width } = Dimensions.get("window");

const Report = () => {
	const [loading, setLoading] = useState(false);
	const [selectedReport, setSelectedReport] = useState<string | null>(null);
	const [analytics, setAnalytics] = useState<AnalyticsData>({
		totalDonations: 42,
		mealsProvided: 1260,
		co2Saved: 630,
		completionRate: 92,
		recentActivity: [
			{
				date: "2025-08-02",
				description: "Fresh Vegetables",
				quantity: "15kg",
			},
			{
				date: "2025-07-28",
				description: "Bakery Items",
				quantity: "8kg",
			},
			{
				date: "2025-07-25",
				description: "Canned Goods",
				quantity: "20kg",
			},
		],
	});

	const reportTypes = [
		{ id: "monthly", name: "Monthly Donation Report" },
		{ id: "impact", name: "Environmental Impact Report" },
		{ id: "completion", name: "Completion Rate Analysis" },
		{ id: "detailed", name: "Detailed Donation History" },
	];

	const handleDownloadReport = (reportId: string) => {
		setLoading(true);
		setSelectedReport(reportId);

		// generate and email report
		setTimeout(() => {
			setLoading(false);
			Alert.alert(
				"Report Sent",
				`Your ${
					reportTypes.find((r) => r.id === reportId)?.name
				} has been sent to your email.`,
				[{ text: "OK" }]
			);
			setSelectedReport(null);
		}, 2000);
	};

	return (
		<SafeAreaProvider>
			<LinearGradient
				colors={["#f5f7fa", "#8fb18bff"]}
				style={styles.gradientBackground}>
				<SafeAreaView style={styles.container}>
					<View style={styles.header}>
						<Text style={styles.headerTitle}> Analytics</Text>
						<Text style={styles.headerSubtitle}>
							{" "}
							Track your impact and generate reports
						</Text>
					</View>

					<ScrollView style={styles.content}>
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>
								Your Impact Summary
							</Text>
							<View style={styles.statsRow}>
								<View style={styles.statCard}>
									<Ionicons
										name="gift-outline"
										size={24}
										color={COLORS.primary}
									/>
									<Text style={styles.statValue}>
										{analytics.totalDonations}
									</Text>
									<Text style={styles.statLabel}>
										Total Donations
									</Text>
								</View>
								<View style={styles.statCard}>
									<Ionicons
										name="fast-food-outline"
										size={24}
										color={COLORS.primary}
									/>
									<Text style={styles.statValue}>
										{analytics.mealsProvided}
									</Text>
									<Text style={styles.statLabel}>
										Meals Provided
									</Text>
								</View>
							</View>
							<View style={styles.statsRow}>
								<View style={styles.statCard}>
									<Ionicons
										name="leaf-outline"
										size={24}
										color={COLORS.primary}
									/>
									<Text style={styles.statValue}>
										{analytics.co2Saved}kg
									</Text>
									<Text style={styles.statLabel}>
										CO₂ Saved
									</Text>
								</View>
								<View style={styles.statCard}>
									<Ionicons
										name="checkmark-done-outline"
										size={24}
										color={COLORS.primary}
									/>
									<Text style={styles.statValue}>
										{analytics.completionRate}%
									</Text>
									<Text style={styles.statLabel}>
										Completion Rate
									</Text>
								</View>
							</View>
						</View>

						<View style={styles.section}>
							<Text style={styles.sectionTitle}>
								Recent Activity
							</Text>
							{analytics.recentActivity.map((activity, index) => (
								<View key={index} style={styles.activityItem}>
									<View style={styles.activityIcon}>
										<Ionicons
											name="time-outline"
											size={16}
											color={COLORS.primary}
										/>
									</View>
									<View style={styles.activityContent}>
										<Text style={styles.activityText}>
											{activity.description}
										</Text>
										<View style={styles.activityMeta}>
											<Text style={styles.activityDate}>
												{activity.date}
											</Text>
											<Text
												style={styles.activityQuantity}>
												{activity.quantity}
											</Text>
										</View>
									</View>
								</View>
							))}
						</View>

						<View style={styles.section}>
							<Text style={styles.sectionTitle}>
								Generate Reports
							</Text>
							<Text style={styles.sectionDescription}>
								Select a report type to generate and have it
								emailed to you as a PDF
							</Text>

							{reportTypes.map((report) => (
								<TouchableOpacity
									key={report.id}
									style={styles.reportButton}
									onPress={() =>
										handleDownloadReport(report.id)
									}
									disabled={loading}>
									<View style={styles.reportButtonContent}>
										<Ionicons
											name="document-text-outline"
											size={20}
											color={COLORS.primary}
										/>
										<Text style={styles.reportButtonText}>
											{report.name}
										</Text>
									</View>
									{loading && selectedReport === report.id ? (
										<ActivityIndicator
											color={COLORS.primary}
										/>
									) : (
										<Ionicons
											name="download-outline"
											size={20}
											color={COLORS.primary}
										/>
									)}
								</TouchableOpacity>
							))}
						</View>
					</ScrollView>
				</SafeAreaView>
			</LinearGradient>
		</SafeAreaProvider>
	);
};

const styles = StyleSheet.create({
	gradientBackground: {
		flex: 1,
	},
	container: {
		flex: 1,
		padding: SIZES.medium,
	},
	header: {
		marginBottom: SIZES.large,
	},
	headerTitle: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
	},
	headerSubtitle: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginTop: SIZES.small / 2,
	},
	content: {
		flex: 1,
	},
	section: {
		marginBottom: SIZES.large,
		backgroundColor: COLORS.white,
		borderRadius: 12,
		padding: SIZES.medium,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: SIZES.large,
		fontWeight: "600",
		color: COLORS.primary,
		marginBottom: SIZES.medium,
	},
	sectionDescription: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		marginBottom: SIZES.medium,
	},
	statsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: SIZES.small,
	},
	statCard: {
		width: "48%",
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
		padding: SIZES.medium,
		alignItems: "center",
	},
	statValue: {
		fontSize: SIZES.xLarge,
		fontWeight: "bold",
		color: COLORS.primary,
		marginVertical: SIZES.small,
	},
	statLabel: {
		fontSize: SIZES.small,
		color: COLORS.gray,
		textAlign: "center",
	},
	activityItem: {
		flexDirection: "row",
		paddingVertical: SIZES.small,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	activityIcon: {
		marginRight: SIZES.small,
	},
	activityContent: {
		flex: 1,
	},
	activityText: {
		fontSize: SIZES.medium,
		color: COLORS.primary,
	},
	activityMeta: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: SIZES.small / 2,
	},
	activityDate: {
		fontSize: SIZES.small,
		color: COLORS.gray,
	},
	activityQuantity: {
		fontSize: SIZES.small,
		color: COLORS.primary,
		fontWeight: "500",
	},
	reportButton: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: SIZES.medium,
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
		marginBottom: SIZES.small,
		borderWidth: 1,
		borderColor: "#e9ecef",
	},
	reportButtonContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	reportButtonText: {
		fontSize: SIZES.small,
		color: COLORS.primary,
		marginLeft: SIZES.small,
	},
});

export default Report;
