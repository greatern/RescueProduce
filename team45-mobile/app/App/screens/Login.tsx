import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { userApi } from "../../service/user";
import { useAuth } from "../../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

type RootParamList = {
  Home: { mission?: string };
  Login: undefined;
  DonorDashboard: undefined;
  LogFood: undefined;
  DonationHistory: undefined;
  Signup: undefined;
};

type NavigationProp = DrawerNavigationProp<RootParamList>;
interface LoginProps {
  onChange?: () => void;
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
		  //top: h* 0.3 ,
		  left : width * 0.5,
		  zIndex : 1,
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

const Login = ({ onChange }: LoginProps) => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  useEffect(() => {
    // Example fetch to show users (keep/remove as needed)
    const getUser = async () => {
      const users = await userApi.getUsers();
      console.log("Users", users);
    };
    // void getUser();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all the fields");
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      setError("");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials, please try again");
    } finally {
      setIsLoading(false);
    }
  };

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
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Glassmorphism card */}
            <BlurView intensity={90} tint="light" style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Log in to access your RescueProduce account
                </Text>
              </View>

              <View style={styles.form}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                />

                <Text style={[styles.label, { marginTop: 20 }]}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={["#c8facc", "#fef9c3"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Don’t have an account?{" "}
                    <TouchableOpacity
                      onPress={() => {
                        if (onChange) onChange();
                      }}
                    >
                      <Text style={styles.link}>Sign Up</Text>
                    </TouchableOpacity>
                  </Text>
                </View>
              </View>
            </BlurView>
          </ScrollView>
        </KeyboardAvoidingView>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: width * 0.9,
    borderRadius: 24,
    padding: 26,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
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
  form: {
    marginTop: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  button: {
    marginTop: 28,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 12,
  },
  footer: {
    marginTop: 22,
    alignItems: "center",
  },
  footerText: {
    color: "#444",
    fontSize: 16,
  },
  link: {
    color: "#4CAF50",
    fontWeight: "700",
  },
});

export default Login;

