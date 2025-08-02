import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from "react-native";
import { fetchAccountants } from "../api/accountantAuthorize";
import useLoginStore from "../store/store";
import Loader from "../components/Loader";

export default function AccountantManagement() {
  const { id } = useLoginStore();
  const accountId = id;

  const [accountants, setAccountants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAccountants, setFilteredAccountants] = useState([]);
  const [selectedAccountant, setSelectedAccountant] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthorizedUsers();
  }, []);

  const fetchAuthorizedUsers = async () => {
    try {
      const data = await fetchAccountants(accountId);

      const transformedData = data.map((acc) => ({
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
      setAccountants(transformedData);
      setFilteredAccountants(transformedData);
    } catch (error) {
      console.error("Failed to load accountants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = accountants.filter((a) =>
      `${a.fname} ${a.lname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAccountants(filtered);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedAccountant(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.cardTitle}>{item.fname} {item.lname}</Text>
      <Text style={styles.cardSubtitle}>ID: {item.accountantId}</Text>
      <Text style={styles.cardDetail}>Email: {item.email}</Text>
      <Text style={styles.cardDetail}>City: {item.city}</Text>
      <View style={styles.statusBadge(item.status)}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader message="Loading accountants..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Heading (unchanged) */}
      <Text style={styles.title}>Accountant Management</Text>
      <Text style={styles.subtitle}>View and manage accountant access</Text>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search by name..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.input}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredAccountants}
        keyExtractor={(item) => item.accountantId}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal */}
      {selectedAccountant && (
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalName}>
                {selectedAccountant.fname} {selectedAccountant.lname}
              </Text>
              <Text style={styles.modalDetail}>ID: {selectedAccountant.accountantId}</Text>
              <Text style={styles.modalDetail}>Email: {selectedAccountant.email}</Text>
              <Text style={styles.modalDetail}>City: {selectedAccountant.city}</Text>
              <Text style={styles.modalDetail}>Status: {selectedAccountant.status}</Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8FAFC" },
  title: { fontSize: 22, fontWeight: "bold", color: "#1E293B", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#64748B", marginBottom: 16 },
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
  statusText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalName: { fontSize: 18, fontWeight: "bold", color: "#1E293B", marginBottom: 8 },
  modalDetail: { fontSize: 14, color: "#475569", marginBottom: 4 },
  closeButton: {
    marginTop: 14,
    backgroundColor: "#EF4444",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontWeight: "600" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
});
