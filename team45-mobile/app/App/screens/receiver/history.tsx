import { useState } from "react";
import { COLORS } from "../../../constants";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { formatDate } from "./ClaimScreen";

interface ClaimedDonation {
  id: string;
  title: string;
  description: string;
  quantity: number;
  claimedDate: Date;
  status: "claimed" | "collected" | "delivered" | "cancelled";
  donorName: string;
  procurementMethod: string;
  location: string;
}

const mockData: ClaimedDonation[] = [
  {
    id: "1",
    title: "Fresh Vegetables",
    description: "Mixed seasonal vegetables",
    quantity: 5,
    claimedDate: new Date("2025-01-15"),
    status: "collected",
    procurementMethod: "pickup",
    donorName: "Green Grocers",
    location: "Cape Town CBD",
  },
  {
    id: "2",
    title: "Bread & Pastries",
    description: "Day-old bread and pastries",
    quantity: 10,
    claimedDate: new Date("2025-01-10"),
    status: "delivered",
    procurementMethod: "delivery",
    donorName: "City Bakery",
    location: "Woodstock",
  },
  {
    id: "3",
    title: "Canned Goods",
    description: "Various canned foods",
    quantity: 15,
    claimedDate: new Date("2025-01-05"),
    status: "claimed",
    procurementMethod: "pickup",
    donorName: "SuperMarket Plus",
    location: "Claremont",
  },
];

const { width } = Dimensions.get("window");

const ReceiverHistory = () => {
  const [claimedDonations, setClaimedDonations] = useState(mockData);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "claimed":
        return "#FFA500";
      case "collected":
        return "#4CAF50";
      case "delivered":
        return "#2196F3";
      case "cancelled":
        return "#F44336";
      default:
        return "#555";
    }
  };

  const getStatusIcon = (status: string): IoniconName => {
    switch (status) {
      case "claimed":
        return "time-outline";
      case "collected":
        return "checkmark-outline";
      case "delivered":
        return "car";
      case "cancelled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const filteredDonations = () => {
    if (selectedStatus === "all") {
      return claimedDonations;
    } else {
      const filter = claimedDonations.filter(
        (donation) => donation.status === selectedStatus
      );
      return filter;
    }
  };

  interface StatusProps {
    status: string;
    label: string;
  }

  const StatusButton = ({ status, label }: StatusProps) => {
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedStatus === status && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedStatus(status)}
      >
        <LinearGradient
          colors={selectedStatus === status ? ["#c8facc", "#fef9c3"] : ["#ffffff", "#ffffff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedStatus === status && styles.filterButtonTextActive,
            ]}
          >
            {label}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderStatusFilter = () => {
    const statuses = [
      { key: "all", label: "All" },
      { key: "claimed", label: "Claimed" },
      { key: "collected", label: "Collected" },
      { key: "cancelled", label: "Cancelled" },
    ];

    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statuses.map((item) => (
            <StatusButton key={item.key} status={item.key} label={item.label} />
          ))}
        </ScrollView>
      </View>
    );
  };

  const Card = ({ donation }: { donation: ClaimedDonation }) => {
    return (
      <BlurView intensity={90} tint="light" style={styles.donationCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="restaurant-outline" size={24} color="#333" style={styles.cardIcon} />
          <View style={styles.titleSection}>
            <Text style={styles.donationTitle}>{donation.title}</Text>
            {donation.description && (
              <Text style={styles.donationDescription}>{donation.description}</Text>
            )}
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor(donation.status) }]}
          >
            <Ionicons name={getStatusIcon(donation.status)} size={12} color="white" />
            <Text style={styles.statusText}>{donation.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="cube-outline" size={16} color="#4CAF50" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Quantity</Text>
              <Text style={styles.detailValue}>{donation.quantity}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={16} color="#4CAF50" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Donor</Text>
              <Text style={styles.detailValue}>{donation.donorName}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="location-outline" size={16} color="#4CAF50" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{donation.location}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={donation.procurementMethod === "pickup" ? "car-outline" : "bicycle-outline"}
                size={16}
                color="#4CAF50"
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Method</Text>
              <Text style={styles.detailValue}>
                {donation.procurementMethod.charAt(0).toUpperCase() + donation.procurementMethod.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={16} color="#4CAF50" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Claimed</Text>
              <Text style={styles.detailValue}>{formatDate(donation.claimedDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: getProgressWidth(donation.status), backgroundColor: getStatusColor(donation.status) }]}
            />
          </View>
          <Text style={styles.progressText}>{getProgressText(donation.status)}</Text>
        </View>
      </BlurView>
    );
  };

  const getProgressWidth = (status: string) => {
    switch (status) {
      case "claimed":
        return "25%";
      case "collected":
        return "75%";
      case "delivered":
        return "100%";
      case "cancelled":
        return "0%";
      default:
        return "0%";
    }
  };

  const getProgressText = (status: string) => {
    switch (status) {
      case "claimed":
        return "Waiting for collection";
      case "collected":
        return "In transit";
      case "delivered":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="receipt-outline" size={48} color="#555" />
        <Text style={styles.emptyStateTitle}>No History Found</Text>
        <Text style={styles.emptyStateText}>
          {selectedStatus === "all" ? "You haven't claimed any donations yet." : `No ${selectedStatus} donations found`}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <LinearGradient colors={["#e8f9e9", "#fffde7"]} style={styles.gradientBackground}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Claim History</Text>
            <Text style={styles.headerSubtitle}>Track your claimed donations</Text>
          </View>

          {renderStatusFilter()}

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredDonations().length > 0 ? (
              filteredDonations().map((dono) => <Card key={dono.id} donation={dono} />)
            ) : (
              renderEmptyState()
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

export default ReceiverHistory;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  filterButtonActive: {
    backgroundColor: "transparent",
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "#333",
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  donationCard: {
    width: width * 0.9,
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIcon: {
    marginRight: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  donationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  donationDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: "white",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  detailsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(76,175,80,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
});