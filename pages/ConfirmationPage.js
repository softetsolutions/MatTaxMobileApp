import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { confirmDeleteAccount } from "../api/user";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function ConfirmDeleteAccountScreen() {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const route = useRoute();
  const navigation = useNavigation();
  const token = route.params?.token;

  const handleFinalConfirm = async () => {
    if (!token) {
      Alert.alert("Error", "Invalid or missing confirmation token");
      navigation.navigate("Login");
      return;
    }

    try {
      setIsSubmitting(true);
      await confirmDeleteAccount(token);
      Alert.alert("Deleted", "Your account has been permanently deleted");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Delete account error:", error);
      Alert.alert("Error", error.message || "Failed to delete account");
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const handleDeleteClick = () => {
    if (!feedback.trim()) {
      Alert.alert("Error", "Please provide a valid reason for deleting your account");
      return;
    }
    setShowConfirmation(true);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#111",
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: "white" }}>
          Confirm Account Deletion
        </Text>
        <Text style={{ color: "gray", marginTop: 8, textAlign: "center" }}>
          Please provide a reason for deleting your account. This helps us improve our service.
        </Text>
      </View>

      <View style={{ backgroundColor: "#222", padding: 20, borderRadius: 12 }}>
        <View
          style={{
            padding: 15,
            borderRadius: 10,
            backgroundColor: "#441010",
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "#772222",
          }}
        >
          <Text style={{ color: "red", fontWeight: "bold" }}>
            Warning: This action cannot be undone
          </Text>
          <Text style={{ color: "#ccc", marginTop: 5 }}>
            • Your account will be permanently deleted
          </Text>
          <Text style={{ color: "#ccc" }}>• All your data will be removed</Text>
          <Text style={{ color: "#ccc" }}>• You will be logged out immediately</Text>
        </View>

        <Text style={{ color: "#ccc", marginBottom: 8 }}>
          Reason for Deletion *
        </Text>

        <TextInput
          placeholder="Please tell us why you're leaving..."
          placeholderTextColor="#777"
          multiline
          value={feedback}
          onChangeText={setFeedback}
          style={{
            backgroundColor: "#1a1a1a",
            color: "white",
            padding: 12,
            borderRadius: 8,
            borderColor: "#555",
            borderWidth: 1,
            height: 120,
            marginBottom: 20,
          }}
        />

        <TouchableOpacity
          disabled={isSubmitting}
          onPress={handleDeleteClick}
          style={{
            backgroundColor: "red",
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              Confirm Delete Account
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Confirmation Popup */}
      <Modal visible={showConfirmation} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            padding: 30,
          }}
        >
          <View
            style={{
              backgroundColor: "#222",
              padding: 20,
              borderRadius: 12,
              borderColor: "#444",
              borderWidth: 1,
            }}
          >
            <Text
              style={{ color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Final Confirmation
            </Text>

            <Text style={{ color: "#ccc", marginBottom: 20 }}>
              Are you absolutely sure you want to delete your account? This cannot be undone.
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={() => setShowConfirmation(false)}
                style={{
                  padding: 10,
                  marginRight: 10,
                }}
              >
                <Text style={{ color: "#bbb" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFinalConfirm}
                style={{
                  backgroundColor: "red",
                  padding: 10,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Yes, Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
