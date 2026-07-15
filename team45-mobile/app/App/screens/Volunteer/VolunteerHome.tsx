import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useVolunteer } from "../../../contexts/VolunteerContext";
import { useAuth } from "../../../contexts/AuthContext";
import { COLORS } from "../../../constants";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../../../service/receiver";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type VolunteerNavigationProp = {
  navigate: (screen: string, params?: any) => void;
};

interface VolunteerHomeProps {
  setActiveTab: React.Dispatch<
    React.SetStateAction<
      "Availability" | "Home" | "Tasks" | "Delivery" | "Profile"
    >
  >;
  setCurrentTask: React.Dispatch<React.SetStateAction<Task | undefined>>;
  activeTasks: Task[];
}

const { width } = Dimensions.get("window");

const FloatingCircle = ({
  color,
  delay = 0,
  size = 120,
}: {
  color: string;
  delay?: number;
  size?: number;
}) => {
  const offset = useSharedValue(0);
  useEffect(() => {
    offset.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: Math.sin(offset.value * Math.PI * 2 + delay) * 25 },
      { translateX: Math.cos(offset.value * Math.PI * 2 + delay) * 25 },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: width * 0.5,
          zIndex: 1,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.25,
        },
        style,
      ]}
    />
  );
};

const VolunteerHome = ({
  setActiveTab,
  setCurrentTask,
  activeTasks,
}: VolunteerHomeProps) => {
  const navigation = useNavigation<VolunteerNavigationProp>();
  const { user } = useAuth();
  const { loading, fetchTasks } = useVolunteer();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const renderTaskItem = ({ item }: { item: Task }) => (
    <BlurView intensity={90} tint="light" style={styles.taskCard}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDescription}>
        ID: {item.id.slice(0, 6).toUpperCase()}
      </Text>
      <Text style={styles.taskDescription}>
        Status: {item.status.replace(/_/g, " ")}
      </Text>
      <Text style={styles.taskDescription}>
        Accepted: {new Date(item.updated_at).toISOString()}
      </Text>
      <Text style={styles.taskDescription}>
        Due: {new Date(item.due_date).toLocaleDateString()}
      </Text>
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => {
          setCurrentTask(item);
          setActiveTab("Delivery");
        }}
      >
        <LinearGradient
          colors={["#c8facc", "#fef9c3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.detailsButtonText}>Update Status</Text>
        </LinearGradient>
      </TouchableOpacity>
    </BlurView>
  );

  return (
    <LinearGradient
      colors={["#e8f9e9", "#fffde7"]}
      style={styles.gradientBackground}
    >
      <View style={StyleSheet.absoluteFill}>
        {/* Floating pastel shapes */}
        <FloatingCircle color="rgba(255,0,0,0.5)" size={200} />
        <FloatingCircle color="#fef9c3" size={120} delay={0.8} />
        <FloatingCircle color="#c8e6c9" size={140} delay={1.2} />
      </View>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Welcome, {user?.name || "Volunteer"}!
          </Text>
          <Text style={styles.subHeader}>Your Dashboard</Text>
        </View>

        {/* Menu grid */}
        <BlurView intensity={90} tint="light" style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate("Availability")}
          >
            <Ionicons name="calendar-outline" size={30} color="#333" />
            <Text style={styles.menuButtonText}>My Availability</Text>
          </TouchableOpacity>
        </BlurView>

        <Text style={styles.sectionTitle}>My Active Tasks</Text>
        <FlatList
          data={activeTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>
              You have no assigned tasks.
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchTasks}
              tintColor="#333"
            />
          }
          contentContainerStyle={styles.taskList}
        />
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
    paddingHorizontal: 20,
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
  subHeader: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  menuCard: {
    width: width * 0.9,
    borderRadius: 24,
    padding: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 24,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  menuButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#444",
    marginBottom: 16,
  },
  taskList: {
    paddingBottom: 20,
  },
  taskCard: {
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
  taskTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  detailsButton: {
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: "flex-end",
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyListText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
});

export default VolunteerHome;