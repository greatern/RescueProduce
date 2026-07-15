import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { useVolunteer } from "../../../contexts/VolunteerContext";
import * as volunteerService from "../../../service/volunteer";
import { COLORS } from "../../../constants";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../../service/api";
import { PickupStatus, Task } from "../../../service/receiver";
import PickupModal from "../../../components/common/modals/receiver/pickup_modal";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";

type ParamList = { ConfirmDelivery: { taskId?: string } };

interface DeliveryProps {
  selectedTask: Task;
}

const { width } = Dimensions.get("window");

const ConfirmDelivery = ({ selectedTask }: DeliveryProps) => {
  const route = useRoute<RouteProp<ParamList, "ConfirmDelivery">>();
  const { fetchTasks, volunteerId } = useVolunteer();
  const [currentTask, setCurrentTask] = useState<Task | null>(selectedTask);
  const [loading, setLoading] = useState(false);

  // OTP related states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>("");

  const generateAndSendOtp = async (taskId: string) => {
    if (!volunteerId) {
      Alert.alert("Error", "Volunteer ID not found");
      return false;
    }

    setOtpLoading(true);
    try {
      const response = await volunteerService.generateOTP(taskId, volunteerId);

      if (response.status === "success") {
        console.log("OTP Generated");
        setShowOtpModal(true);
        Alert.alert(
          "OTP Sent",
          "A 6-digit verification code has been sent to the receiver's in-app notifications. Please ask them for the code."
        );
        return true;
      } else {
        Alert.alert("Error", response.data.message || "Failed to send OTP");
        return false;
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send OTP to receiver"
      );
      return false;
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtpAndCompleteDelivery = async () => {
    if (!currentTask || !volunteerId) {
      Alert.alert("Error", "Missing required information");
      return;
    }

    if (enteredOtp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(`/api/otp/verify/${volunteerId}`, {
        task_id: currentTask.id,
        otp_code: enteredOtp,
      });

      if (response.data.success) {
        setShowOtpModal(false);
        setEnteredOtp("");
        setOtpSent(false);
        setPendingStatus("");

        Alert.alert("Success!", "Delivery has been confirmed successfully!", [
          {
            text: "OK",
            onPress: () => {
              fetchTasks(); // Refresh tasks
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Invalid verification code");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to verify code");
    } finally {
      setLoading(false);
      setShowOtpModal(false);
      setEnteredOtp("");
      setOtpSent(false);
      setPendingStatus("");
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!currentTask) return;

    // For completed status, require OTP verification
    if (newStatus === "completed") {
      setPendingStatus(newStatus);
      const otpSuccess = await generateAndSendOtp(currentTask.id);
      if (!otpSuccess) {
        setPendingStatus("");
      }
      return;
    }

    // For other statuses, update directly
    setLoading(true);
    try {
      console.log("G");

      const response = await volunteerService.updateTaskStatus(currentTask.id, newStatus);
      console.log("Update response", response);
      if (response.status === "success") {
        setCurrentTask(response.data!);
      }
      Alert.alert("Success", `Task status updated to ${newStatus.replace("_", " ")}`);
      await fetchTasks();
    } catch (error) {
      Alert.alert("Error", "Failed to update task status.");
    } finally {
      setLoading(false);
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setEnteredOtp("");
    setOtpSent(false);
    setPendingStatus("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "#4CAF50";
      case "en_route":
        return "#FF9500";
      case "completed":
        return "#4CAF50";
      default:
        return "#555";
    }
  };

  useEffect(() => {
    console.log("Selected Task", selectedTask.pickup);
  }, []);

  const confirmPickup = async () => {
    try {
      console.log("Heelo");

      const response = await volunteerService.verifyCode(selectedTask.id, confirmCode);
      console.log("Response", response);

      if (response.status === "success") {
        selectedTask.pickup.pickup_status = PickupStatus.CONFIRMED;
        setShowPickupModal(false);
      } else {
      }
    } catch (error) {
      console.log("Error", error);
      console.error("Error confirming code");
    }
  };

  const canUpdateToStatus = (currentStatus: string, targetStatus: string) => {
    const statusFlow = ["assigned", "en_route", "completed"];
    const currentIndex = statusFlow.indexOf(currentStatus);
    const targetIndex = statusFlow.indexOf(targetStatus);
    return targetIndex > currentIndex;
  };

  return (
    <LinearGradient colors={["#e8f9e9", "#fffde7"]} style={styles.gradientBackground}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Update Task Status</Text>
            <Text style={styles.subtitle}>Confirm or update your delivery task</Text>
          </View>

          {loading && (
            <ActivityIndicator style={styles.loading} size="large" color="#333" />
          )}

          {currentTask && (
            <BlurView intensity={90} tint="light" style={styles.card}>
              <View style={styles.taskHeader}>
                <Ionicons name="restaurant-outline" size={24} color="#333" style={styles.taskIcon} />
                <Text style={styles.taskTitle}>
                  {currentTask.title || `Task ${currentTask.id.slice(0, 8)}...`}
                </Text>
              </View>
              <Text style={styles.taskDetail}>
                ID: {currentTask.id.slice(0, 6).toUpperCase()}
              </Text>
              <Text style={styles.taskDetail}>
                Description: {currentTask.description}
              </Text>
              <View style={styles.statusRow}>
                <Text style={styles.taskDetail}>Current Status:</Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(currentTask.status) }]}
                >
                  <Text style={styles.statusText}>{currentTask.status.replace("_", " ")}</Text>
                </View>
              </View>

              {currentTask.pickup_location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={16} color="#4CAF50" />
                  <Text style={styles.taskDetail}>From: {currentTask.pickup_location}</Text>
                </View>
              )}

              {currentTask.dropoff_location && (
                <View style={styles.locationRow}>
                  <Ionicons name="flag-outline" size={16} color="red" />
                  <Text style={styles.taskDetail}>To: {currentTask.dropoff_location}</Text>
                </View>
              )}

              <View style={styles.buttonGroup}>
                {(selectedTask.pickup.pickup_status === PickupStatus.SCHEDULED && (
                  <TouchableOpacity
                    style={styles.statusButton}
                    onPress={() => {
                      setShowPickupModal(true);
                    }}
                  >
                    <LinearGradient
                      colors={["#c8facc", "#fef9c3"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      <Ionicons name="barcode-outline" size={20} color="#333" />
                      <Text style={styles.buttonText}>Enter Confirmation Code</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )) || (
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      !canUpdateToStatus(currentTask.status, "en_route") && styles.disabledButton,
                    ]}
                    onPress={() => handleUpdateStatus("en_route")}
                    disabled={loading || !canUpdateToStatus(currentTask.status, "en_route")}
                  >
                    <LinearGradient
                      colors={["#c8facc", "#fef9c3"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      <Ionicons name="car-outline" size={20} color="#333" />
                      <Text style={styles.buttonText}>Mark En Route</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                {currentTask.status === "en_route" && (
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      !canUpdateToStatus(currentTask.status, "completed") && styles.disabledButton,
                    ]}
                    onPress={() => handleUpdateStatus("completed")}
                    disabled={loading || otpLoading || !canUpdateToStatus(currentTask.status, "completed")}
                  >
                    <LinearGradient
                      colors={["#c8facc", "#fef9c3"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      {otpLoading ? (
                        <ActivityIndicator color="#333" size="small" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle-outline" size={20} color="#333" />
                          <Text style={styles.buttonText}>Request Delivery Code</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </BlurView>
          )}

          {/* Pickup Modal */}
          <PickupModal
            title="Confirmation Code"
            message="Enter the confirmation code from the donor."
            onClose={() => {
              setShowPickupModal(false);
            }}
            onConfirm={confirmPickup}
            setConfirmCode={setConfirmCode}
            visible={showPickupModal}
          />

          {/* OTP Verification Modal */}
          <Modal
            visible={showOtpModal}
            animationType="slide"
            transparent={true}
            onRequestClose={closeOtpModal}
          >
            <View style={styles.modalOverlay}>
              <BlurView intensity={90} tint="light" style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Verify Delivery</Text>
                  <TouchableOpacity onPress={closeOtpModal}>
                    <Ionicons name="close" size={24} color="#555" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDescription}>
                  A verification code has been sent to the receiver's in-app notifications. Please ask them for the 6-digit code to confirm delivery.
                </Text>

                <View style={styles.otpContainer}>
                  <Text style={styles.otpLabel}>Enter Verification Code:</Text>
                  <TextInput
                    style={styles.otpInput}
                    value={enteredOtp}
                    onChangeText={setEnteredOtp}
                    placeholder="000000"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    keyboardType="numeric"
                    maxLength={6}
                    textAlign="center"
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={closeOtpModal}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmButton, loading && styles.disabledButton]}
                    onPress={verifyOtpAndCompleteDelivery}
                    disabled={loading || enteredOtp.length !== 6}
                  >
                    <LinearGradient
                      colors={["#c8facc", "#fef9c3"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="#333" size="small" />
                      ) : (
                        <Text style={styles.confirmButtonText}>Verify & Confirm</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={() => currentTask && generateAndSendOtp(currentTask.id)}
                  disabled={otpLoading}
                >
                  <Text style={styles.resendButtonText}>{otpLoading ? "Sending..." : "Resend Code"}</Text>
                </TouchableOpacity>
              </BlurView>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  card: {
    width: width * 0.9,
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 24,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  taskIcon: {
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  taskDetail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  buttonGroup: {
    marginTop: 20,
    gap: 16,
  },
  statusButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
  },
  buttonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
  loading: {
    marginTop: 20,
    marginBottom: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  modalDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  otpContainer: {
    marginBottom: 20,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    textAlign: "center",
  },
  otpInput: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    textAlign: "center",
    letterSpacing: 2,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  cancelButtonText: {
    color: "#444",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    padding: 12,
    alignItems: "center",
  },
  resendButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ConfirmDelivery;
