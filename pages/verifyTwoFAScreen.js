// src/screens/VerifyTwoFAScreen.js
import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {jwtDecode}  from "jwt-decode";

import { verify2FALogin } from "../api/2FA";
import useLoginStore from "../store/store";

export default function VerifyTwoFAScreen() {
  const [code, setCode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const navigation = useNavigation();

  const setLoginDetails = useLoginStore(
    (state) => state.setLoginDetails
  );

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...code];
    updated[index] = value;
    setCode(updated);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    const otp = code.join("");
    if (otp.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      const tempToken = await AsyncStorage.getItem("tempToken");
      if (!tempToken) {
        Alert.alert("Session Expired", "Please login again.");
        navigation.replace("Login");
        return;
      }


      console.log("Verifying OTP:", otp);
console.log("Using tempToken:", tempToken);

      // 🔐 Verify OTP
      const res = await verify2FALogin(tempToken, otp);

// Use the token key returned by backend
const token = res.token || res.data;
if (!token) {
  throw new Error("Invalid 2FA response");
}

// Save auth token
await AsyncStorage.removeItem("tempToken");
await AsyncStorage.setItem("token", token);

const decoded = jwtDecode(token);
setLoginDetails(true, token, decoded.id);

navigation.reset({
  index: 0,
  routes: [{ name: "Main" }],
});

    } catch (err) {
      Alert.alert(
        "Verification Failed",
        err?.response?.data?.message ||
          err.message ||
          "Invalid authentication code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Multi-Factor Authentication</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code from your authenticator app
      </Text>

      <View style={styles.otpRow}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            value={digit}
            onChangeText={(v) => handleChange(v, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            autoFocus={index === 0}
            style={styles.otpInput}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#facc15",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    color: "#a1a1aa",
    textAlign: "center",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  otpInput: {
    width: 48,
    height: 52,
    marginHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#000",
    color: "#facc15",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  button: {
    marginTop: 32,
    backgroundColor: "#facc15",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "700",
    color: "#000",
    fontSize: 16,
  },
});
