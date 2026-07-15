import React, { useState, useEffect } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
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
import axios from "axios";
import { COLORS } from "../../constants";
import { useAuth } from "../../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

type RootParamList = {
  Home: { mission?: string };
  Login: undefined;
  Signup: undefined;
  DonorDashboard: undefined;
  LogFood: undefined;
  DonationHistory: undefined;
};
type NavigationProp = DrawerNavigationProp<RootParamList>;
const { width } = Dimensions.get("window");

const api = axios.create({
  baseURL: process.env.API_HOST || "https://api-domain.com",
});

interface SignupProp {
  onChange?: () => void;
}
interface User {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "donor" | "volunteer" | "receiver" | null;
  user_type: Donor | Receiver | Volunteer | null;
}
interface Donor {
  tax_number: string;
  health_certificate_url: string;
}
interface Receiver {
  registration_number: string;
  storage_capacity: number;
}
interface Volunteer {
  license_number: string;
  license_expiry_date: Date;
}

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

const Signup = ({ onChange }: SignupProp) => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: null,
    user_type: null,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, isLoading } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleSignup = async () => {
    let newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!confirmPassword || confirmPassword !== formData.password)
      newErrors.confirmPassword = "Please make sure passwords match";
    if (!formData.role) newErrors.role = "Please select role";

		switch (formData.role) {
			case "donor":
				if (!(formData.user_type as Donor)?.health_certificate_url)
					newErrors.health_certificate_url =
						"Health certificate URL is required";

				if (!(formData.user_type as Donor)?.tax_number)
					newErrors.tax_number = "Tax number is required";
				break;
			case "receiver":
				if (!(formData.user_type as Receiver)?.registration_number)
					newErrors.registration_number =
						"Registration number is required";

				if (!(formData.user_type as Receiver)?.storage_capacity)
					newErrors.storage_capacity = "Storage capacity is required";
				break;
			case "volunteer":
				if (!(formData.user_type as Volunteer)?.license_number)
					newErrors.license_number = "License number is required";

				if (!(formData.user_type as Volunteer)?.license_expiry_date)
					newErrors.license_expiry_date =
						"License expiry date is required";
				break;
		}

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const req = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        user_type: formData.user_type,
      };
      const response = await register(req);
      if (response.status == "success") {
        if (onChange) onChange();
      }
    } catch (error) {
      newErrors.signup = "Registration failed. Please try again.";
      setErrors(newErrors);
      console.error("Signup error:", error);
    }
  };

	const handleRoleChange = (role: string) => {
		switch (role) {
			case "donor":
				setFormData({
					...formData,
					role: role,
					user_type: {
						tax_number: "",
						health_certificate_url: "",
					},
				});
				break;
			case "receiver":
				setFormData({
					...formData,
					role: role,
					user_type: {
						registration_number: "",
						storage_capacity: 0,
					},
				});
				break;
			case "volunteer":
				setFormData({
					...formData,
					role: role,
					user_type: {
						license_number: "",
						license_expiry_date: new Date(),
					},
				});
				break;
			default:
				setFormData({
					...formData,
					role: null,
					user_type: null,
				});
				break;
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
                <Text style={styles.title}>Create Your Account</Text>
                <Text style={styles.subtitle}>
                  Sign up to join RescueProduce
                </Text>
              </View>

              <View style={styles.form}>
                {/* Name */}
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                {/* Email */}
                <Text style={[styles.label, { marginTop: 20 }]}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                {/* Phone */}
                <Text style={[styles.label, { marginTop: 20 }]}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                />

                {/* Password */}
                <Text style={[styles.label, { marginTop: 20 }]}>Create Password</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                  placeholder="Create password"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                {/* Confirm Password */}
                <Text style={[styles.label, { marginTop: 20 }]}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Confirm password"
                  placeholderTextColor="rgba(0,0,0,0.4)"
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}

                {/* Role */}
                <Text style={[styles.label, { marginTop: 20 }]}>Select your role</Text>
                <TouchableOpacity
                  onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                  style={styles.input}
                >
                  <Text
                    style={
                      formData.role ? styles.inputText : styles.placeholderText
                    }
                  >
                    {formData.role ?? "Select role"}
                  </Text>
                </TouchableOpacity>
                {showRoleDropdown && (
                  <View style={styles.dropdown}>
                    {["donor", "receiver", "volunteer"].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setFormData({ ...formData, role: r as any });
                          setShowRoleDropdown(false);
                          handleRoleChange(r);
                        }}
                      >
                        <Text style={styles.dropdownText}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}

                {/* Role-specific fields remain unchanged */}
                {formData.role === "donor" && (
                  <>
                    <Text style={[styles.label, { marginTop: 20 }]}>Tax Number</Text>
                    <TextInput
                      style={styles.input}
                      value={(formData.user_type as Donor)?.tax_number}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          user_type: { ...formData.user_type, tax_number: text } as Donor,
                        })
                      }
                      placeholder="Enter tax number"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                    />
                    {errors.tax_number && <Text style={styles.errorText}>{errors.tax_number}</Text>}

                    <Text style={[styles.label, { marginTop: 20 }]}>Health Certificate URL</Text>
                    <TextInput
                      style={styles.input}
                      value={(formData.user_type as Donor)?.health_certificate_url}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          user_type: { ...formData.user_type, health_certificate_url: text } as Donor,
                        })
                      }
                      placeholder="Enter health certificate URL"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                    />
                    {errors.health_certificate_url && (
                      <Text style={styles.errorText}>{errors.health_certificate_url}</Text>
                    )}
                  </>
                )}

                {formData.role === "receiver" && (
                  <>
                    <Text style={[styles.label, { marginTop: 20 }]}>Registration Number</Text>
                    <TextInput
                      style={styles.input}
                      value={(formData.user_type as Receiver)?.registration_number}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          user_type: { ...formData.user_type, registration_number: text } as Receiver,
                        })
                      }
                      placeholder="Enter registration number"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                    />
                    {errors.registration_number && (
                      <Text style={styles.errorText}>{errors.registration_number}</Text>
                    )}

                    <Text style={[styles.label, { marginTop: 20 }]}>Storage Capacity</Text>
                    <TextInput
                      style={styles.input}
                      value={(formData.user_type as Receiver)?.storage_capacity.toString()}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          user_type: {
                            ...formData.user_type,
                            storage_capacity: parseInt(text) || 0,
                          } as Receiver,
                        })
                      }
                      keyboardType="numeric"
                      placeholder="Enter storage capacity"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                    />
                    {errors.storage_capacity && (
                      <Text style={styles.errorText}>{errors.storage_capacity}</Text>
                    )}
                  </>
                )}

                {formData.role === "volunteer" && (
                  <>
                    <Text style={[styles.label, { marginTop: 20 }]}>License Number</Text>
                    <TextInput
                      style={styles.input}
                      value={(formData.user_type as Volunteer)?.license_number}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          user_type: { ...formData.user_type, license_number: text } as Volunteer,
                        })
                      }
                      placeholder="Enter license number"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                    />
                    {errors.license_number && (
                      <Text style={styles.errorText}>{errors.license_number}</Text>
                    )}

                    <Text style={[styles.label, { marginTop: 20 }]}>License Expiry Date</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.inputText}>
                        {(formData.user_type as Volunteer)?.license_expiry_date
                          ? (formData.user_type as Volunteer).license_expiry_date.toDateString()
                          : "Select expiry date"}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={(formData.user_type as Volunteer)?.license_expiry_date || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                          setShowDatePicker(false);
                          if (date) {
                            setFormData({
                              ...formData,
                              user_type: { ...formData.user_type, license_expiry_date: date } as Volunteer,
                            });
                          }
                        }}
                      />
                    )}
                    {errors.license_expiry_date && (
                      <Text style={styles.errorText}>{errors.license_expiry_date}</Text>
                    )}
                  </>
                )}

                {/* Submit */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSignup}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={["#c8facc", "#fef9c3"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? "Signing Up..." : "Sign Up"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {errors.signup && <Text style={styles.errorText}>{errors.signup}</Text>}

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Already have an account?{" "}
                    <TouchableOpacity
                      onPress={() => onChange && onChange()}
                    >
                      <Text style={styles.link}>Sign In</Text>
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
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 16,
    color: "rgba(0,0,0,0.4)",
  },
  dropdown: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
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

export default Signup;
