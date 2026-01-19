import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";

import {
  fetchAccountants,
  requestAuthorization,
  removeAuthorization,
  fetchAuthorizationStatus,
  searchAccountantByEmail,
} from "../api/accountantAuthorize";
import Loader from "../components/Loader";
import AccountListAndActionModal from "../components/AccountListAndActionModel";

export default function AccountantManagement() {
  const [accountants, setAccountants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAccountantId, setLoadingAccountantId] = useState(null);

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [accountantEmail, setAccountantEmail] = useState("");
  const [searchedAccountant, setSearchedAccountant] = useState(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAccountant, setSelectedAccountant] = useState(null);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [accountantToDeauthorize, setAccountantToDeauthorize] = useState(null);

  useEffect(() => {
    fetchAllAccountants();
  }, []);

  useEffect(() => {
    // Poll authorization status every 30s
    const interval = setInterval(async () => {
      try {
        const data = await fetchAuthorizationStatus();
        const transformed = transformAccountantData(data);
        setAccountants(transformed);
      } catch (err) {
        console.error("Failed to fetch authorization status:", err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const transformAccountantData = (data) =>
    data.map((acc) => ({
      id: acc.id,
      accountantId: `ACC${String(acc.id).padStart(3, "0")}`,
      fname: acc.fname,
      lname: acc.lname,
      email: acc.email,
      city: acc.city || "N/A",
      status:
        acc.is_authorized === "approved"
          ? "authorized"
          : acc.is_authorized === "pending"
          ? "pending"
          : acc.is_authorized === "rejected"
          ? "rejected"
          : "unauthorized",
    }));

  const fetchAllAccountants = async () => {
    try {
      setLoading(true);
      const data = await fetchAccountants();
      setAccountants(transformAccountantData(data));
    } catch (err) {
      console.error("Failed to load accountants:", err);
      Alert.alert("Error", "Failed to load accountants");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeByEmail = async () => {
  if (!accountantEmail.trim()) return;

  try {
    setLoadingAccountantId("email");

    
    const found = accountants.find(
      (acc) => acc.email?.toLowerCase() === accountantEmail.trim().toLowerCase()
    );

    if (found) {
      if (found.status === "authorized") {
        Alert.alert("Info", "This accountant is already authorized");
      } else if (found.status === "pending") {
        Alert.alert("Info", "Authorization request is already pending");
      } else if (found.status === "rejected") {
        Alert.alert("Info", "This accountant request was rejected");
      } else {
        Alert.alert("Info", "This accountant exists but is not authorized");
      }

      setAccountantEmail("");
      return; 
    }

   
    const result = await searchAccountantByEmail(accountantEmail.trim());

   // console.log("API RESULT ===>", JSON.stringify(result, null, 2));

    if (!result || !result.fname) {
      Alert.alert("Info", "No accountant found with this email.");
      return;
    }

    // 3️⃣ Normalize status coming from backend
    const status =
      result.is_authorized === "approved"
        ? "authorized"
        : result.is_authorized === "pending"
        ? "pending"
        : "unauthorized";

    const accountantData = {
      ...result,
      accountantId: `ACC${String(result.id).padStart(3, "0")}`,
      status,
    };

    setSearchedAccountant(accountantData);

    
    if (status === "pending") {
      Alert.alert("Info", "Authorization request already sent");
      setEmailModalOpen(false);
      return;
    }

    if (status === "authorized") {
      Alert.alert("Info", "Accountant is already authorized");
      setEmailModalOpen(false);
      return;
    }

    // 5️⃣ Only unauthorized → open modal
    setEmailModalOpen(true);
  } catch (err) {
    console.error("Error searching accountant:", err);
    Alert.alert("Error", "Failed to search accountant");
  } finally {
    setLoadingAccountantId(null);
  }
};


const handleRequestAuthorization = async (acc) => {
  if (loadingAccountantId) return;

  if (acc.status === "pending") {
    Alert.alert("Info", "Authorization request already sent");
    return;
  }
  if (acc.status === "authorized") {
    Alert.alert("Info", "Accountant is already authorized");
    return;
  }

  try {
    setLoadingAccountantId(acc.id);
    await requestAuthorization(acc.id);

    Alert.alert("Success", "Request sent successfully");
    setAccountants((prev) =>
      prev.map((a) =>
        a.id === acc.id ? { ...a, status: "pending" } : a
      )
    );

    if (searchedAccountant?.id === acc.id) {
      setSearchedAccountant({ ...searchedAccountant, status: "pending" });
    }

    // Close modal after sending request
    setEmailModalOpen(false);
    setAccountantEmail("");
  } catch (err) {
    console.error("Authorization failed:", err);
    Alert.alert("Error", "Failed to send authorization request");
  } finally {
    setLoadingAccountantId(null);
  }
};

  const handleDeauthorize = async () => {
    if (!accountantToDeauthorize) return;

    try {
      setLoadingAccountantId(accountantToDeauthorize.id);
      await removeAuthorization(accountantToDeauthorize.id);

      setAccountants((prev) =>
        prev.map((a) =>
          a.id === accountantToDeauthorize.id
            ? { ...a, status: "unauthorized" }
            : a
        )
      );

      if (selectedAccountant?.id === accountantToDeauthorize.id) {
        setSelectedAccountant({ ...selectedAccountant, status: "unauthorized" });
      }

      Alert.alert("Success", "Authorization revoked");
    } catch (err) {
      console.error("Deauthorization failed:", err);
      Alert.alert("Error", "Failed to revoke authorization");
    } finally {
      setLoadingAccountantId(null);
      setConfirmModalVisible(false);
      setAccountantToDeauthorize(null);
    }
  };
  useEffect(() => {
  if (!confirmModalVisible || !accountantToDeauthorize) return;

  Alert.alert(
    "Revoke Authorization",
    `Are you sure you want to revoke ${accountantToDeauthorize.fname}'s access?`,
    [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          setConfirmModalVisible(false);
          setAccountantToDeauthorize(null);
        },
      },
      {
        text: "Revoke",
        style: "destructive",
        onPress: handleDeauthorize,
      },
    ]
  );
}, [confirmModalVisible, accountantToDeauthorize]);


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.fname} {item.lname}</Text>
      <Text style={styles.cardSubtitle}>ID: {item.accountantId}</Text>
      <Text style={styles.cardDetail}>Email: {item.email}</Text>
      <Text style={styles.cardDetail}>City: {item.city}</Text>
      <View style={styles.statusBadge(item.status)}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>

      <View style={{ flexDirection: "row", marginTop: 6 }}>
        {/* Authorize / Pending */}
        {item.status !== "authorized" && (
          <TouchableOpacity
            style={[
              styles.authButton,
              item.status === "pending" && { backgroundColor: "#F59E0B" },
            ]}
            onPress={() => handleRequestAuthorization(item)}
            disabled={item.status === "pending" || loadingAccountantId === item.id}
          >
            <Text style={styles.authButtonText}>
              {item.status === "pending" ? "Pending" : "Authorize"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Revoke for authorized */}
        {item.status === "authorized" && (
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: "#EF4444", marginLeft: 6 }]}
            onPress={() => {
              setAccountantToDeauthorize(item);
              setConfirmModalVisible(true);
            }}
            disabled={loadingAccountantId === item.id}
          >
            <Text style={styles.authButtonText}>Deauthorize</Text>
          </TouchableOpacity>
        )}

        {/* About button */}
        <TouchableOpacity
          style={[styles.authButton, { backgroundColor: "#3B82F6", marginLeft: 6 }]}
          onPress={() => {
            setSelectedAccountant(item);
            setDetailsModalOpen(true);
          }}
        >
          <Text style={styles.authButtonText}>About</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <Loader message="Loading accountants..." />;

  return (
    <View style={styles.container}>
      {/* Email authorization */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Enter accountant email..."
          value={accountantEmail}
          onChangeText={setAccountantEmail}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleAuthorizeByEmail}
          disabled={loadingAccountantId === "email"}
        >
          <Text style={styles.buttonText}>Authorize</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={accountants}
        keyExtractor={(item) => item.accountantId}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal for searched email */}
      <AccountListAndActionModal
  isOpen={emailModalOpen}
  onClose={() => {
    setEmailModalOpen(false);
    setAccountantEmail("");
  }}
  title="Accountant Details"
  accountantEmail={searchedAccountant?.email}
  apiFailMessage="Unable to fetch accountant"
  onAuthorize={() => handleRequestAuthorization(searchedAccountant)}
/>


      {/* About modal */}
      <Modal
        visible={detailsModalOpen && !!selectedAccountant}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Accountant Details</Text>
            <Text>ID: {selectedAccountant?.accountantId}</Text>
            <Text>Name: {selectedAccountant?.fname} {selectedAccountant?.lname}</Text>
            <Text>Email: {selectedAccountant?.email}</Text>
            <Text>City: {selectedAccountant?.city}</Text>
            <Text>Status: {selectedAccountant?.status}</Text>

            <TouchableOpacity
              style={[styles.authButton, { marginTop: 12 }]}
              onPress={() => setDetailsModalOpen(false)}
            >
              <Text style={styles.authButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation modal for revoke
      {confirmModalVisible && accountantToDeauthorize && Alert.alert(
        "Revoke Authorization",
        `Are you sure you want to revoke ${accountantToDeauthorize.fname}'s access?`,
        [
          { text: "Cancel", style: "cancel", onPress: () => setConfirmModalVisible(false) },
          { text: "Revoke", style: "destructive", onPress: handleDeauthorize },
        ]
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8FAFC" },
  searchRow: { flexDirection: "row", marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  searchButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 8,
    marginLeft: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  cardSubtitle: { fontSize: 14, color: "#475569", marginTop: 2 },
  cardDetail: { fontSize: 13, color: "#64748B", marginTop: 2 },
  statusBadge: (status) => ({
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor:
      status === "authorized"
        ? "#DCFCE7"
        : status === "pending"
        ? "#FEF9C3"
        : "#FEE2E2",
  }),
  statusText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  authButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
});
