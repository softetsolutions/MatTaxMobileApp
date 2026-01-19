import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";

import {
  searchAccountantByEmail,
  requestAuthorization,
} from "../api/accountantAuthorize";

import Toast from "react-native-toast-message";

const AccountListAndActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  accountantEmail,
  apiFailMessage,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const isAuthorized = data?.status === "authorized";

  useEffect(() => {
    if (!isOpen || !accountantEmail) return;

    setError(null);
    setData(null);
    setIsLoading(true);

    (async () => {
      try {
        const res = await searchAccountantByEmail(accountantEmail);

        if (!res || Object.keys(res).length === 0) {
          Alert.alert("Info", "No accountant found with this email.");
          onClose();
          return;
        }

        const status =
          res.is_authorized === "approved"
            ? "authorized"
            : res.is_authorized === "pending"
            ? "pending"
            : "unauthorized";

        if (status === "pending") {
          Alert.alert("Info", "Authorization request already sent.");
          onClose();
          return;
        }

        if (status === "authorized") {
          Alert.alert("Info", "Accountant is already authorized.");
          onClose();
          return;
        }

        setData({ ...res, status });
      } catch (err) {
        console.error("Error searching accountant:", err);
        setError("Something went wrong");
        onClose();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isOpen, accountantEmail]);

  const handleAuthorize = async (id) => {
    try {
      setIsLoading(true);

      await requestAuthorization(id);

      Toast.show({
        type: "success",
        text1: "Request sent successfully.",
      });

      if (onConfirm) onConfirm();
      onClose();
    } catch (err) {
      console.error("Error authorizing accountant:", err);
      setError("Authorization failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !data) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>X</Text>
            </TouchableOpacity>
          </View>

          {error && (
            <Text style={styles.errorText}>
              {apiFailMessage || error}
            </Text>
          )}

          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>
                  {data.fname} {data.lname}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{data.email}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.value}>{data.address || "N/A"}</Text>
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.authorizeButton,
                isAuthorized && styles.authorizedButton,
              ]}
              disabled={isAuthorized || isLoading}
              onPress={() => handleAuthorize(data.id || data._id)}
            >
              <Text style={styles.authorizeText}>
                {isAuthorized ? "Authorized" : "Authorize"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  closeButton: {
    fontSize: 18,
    color: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 10,
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#475569",
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
  },
  label: {
    color: "#6B7280",
    fontSize: 14,
  },
  value: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },
  cancelText: {
    color: "#374151",
    fontWeight: "500",
  },
  authorizeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },
  authorizedButton: {
    backgroundColor: "#16A34A",
  },
  authorizeText: {
    color: "#fff",
    fontWeight: "500",
  },
});

export default AccountListAndActionModal;
