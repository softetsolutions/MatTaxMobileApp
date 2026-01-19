import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
   StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
 // Optional if you use external styling
import URI from "../assets/constants";



export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoader(true);

    try {
      const response = await fetch(`${URI}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.status !== 200) {
        const res = await response.json();
        throw new Error(res.message || "Error processing request");
      }

      Alert.alert(
        "Success",
        "Password reset instructions sent to your email!",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (e) {
      console.log("ERROR:", e.message);
      setError(e.message);
    } finally {
      setLoader(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Forgot Password</Text>
      <Text style={styles.description}>
        Enter your email address and we’ll send you instructions to reset it.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        placeholder="Enter email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loader}
        style={[styles.button, loader && { opacity: 0.6 }]}
      >
        {loader ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Instructions</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    justifyContent: "center",
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
    textAlign: "center",
  },

  description: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 25,
  },

  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  backText: {
    textAlign: "center",
    fontSize: 15,
    color: "#007bff",
    marginTop: 10,
  },
});

