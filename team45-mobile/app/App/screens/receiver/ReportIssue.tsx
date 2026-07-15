import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../../../constants";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

interface ReportIssueProps {
  onBack?: () => void;
}

const ReportIssue= ({ onBack }: ReportIssueProps) => {
  const [issueType, setIssueType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issueTypes = [
    { value: 'quantity-mismatch', label: 'Quantity mismatch' },
    { value: 'quality-issue', label: 'Quality issue (spoiled food)' },
    { value: 'delivery-problem', label: 'Delivery problem' },
    { value: 'volunteer-issue', label: 'Volunteer issue' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Success",
        "Issue reported successfully! Our team will review it shortly.",
        [{ text: "OK", onPress: onBack }]
      );
    }, 2000);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.title}>Report an Issue</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>Issue Type</Text>
              {issueTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.methodButton,
                    issueType === type.value && styles.methodButtonSelected
                  ]}
                  onPress={() => setIssueType(type.value)}
                >
                  <Text style={styles.methodTitle}>{type.label}</Text>
                  <Ionicons
                    name={
                      issueType === type.value
                        ? "checkmark-circle"
                        : "radio-button-off"
                    }
                    size={20}
                    color={
                      issueType === type.value
                        ? COLORS.primary
                        : COLORS.secondary
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>Description</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={5}
                placeholder="Please describe the issue in detail..."
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.claimButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.claimButton,
                  (!issueType || !description || isSubmitting) &&
                    styles.cliamButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!issueType || !description || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.claimButtonText}>
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite || "#f8f9fa",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: COLORS.white || "#ffffff",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primary || "#007AFF",
    fontWeight: "500",
  },
  contentSection: {
    backgroundColor: COLORS.white || "#ffffff",
    padding: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary || "#333",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary || "#333",
    marginBottom: 12,
  },
  methodButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.lightWhite || "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  methodButtonSelected: {
    borderColor: COLORS.secondary,
    borderWidth: 2,
    backgroundColor: `${COLORS.primary}10`,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary || "#333",
  },
  textArea: {
    height: 150,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    textAlignVertical: "top",
    fontSize: 16,
    backgroundColor: COLORS.lightWhite || "#f8f9fa",
  },
  claimButtonContainer: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  claimButton: {
    backgroundColor: COLORS.primary || "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cliamButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  claimButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ReportIssue;