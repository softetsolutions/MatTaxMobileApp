import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import { fetchTransactionLogs } from "../api/transactions";
import { formatDate } from "../utils/date";
import Loader from "./Loader";

const { width, height } = Dimensions.get("window");

export default function TransactionLogModal({
  visible,
  transaction,
  onClose,
  token,
  userId,
  embedded = false,
}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible && transaction && transaction.id) {
      loadTransactionLogs();
    }
  }, [visible, transaction]);

  const loadTransactionLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchTransactionLogs(token, userId, transaction.id);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message || "Failed to load transaction logs");
    } finally {
      setLoading(false);
    }
  };

  const renderLogItem = ({ item, index }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <Text style={styles.logTimestamp}>
          {formatDate(item.timestamp)}
        </Text>
        <Text style={styles.logEditor}>
          Edited by: {item.edited_by}
        </Text>
      </View>
      {item.changes && item.changes.length > 0 ? (
        <View style={styles.changesContainer}>
          {item.changes.map((change, changeIndex) => (
            <View key={changeIndex} style={styles.changeItem}>
              <Text style={styles.changeField}>
                {change.field_changed.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}:
              </Text>
              <Text style={styles.changeValue}>
                {change.new_value}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noChanges}>No changes recorded</Text>
      )}
    </View>
  );

  const content = (
    <>
      {loading ? (
        <Loader message="Loading transaction logs..." style={{ marginTop: 20 }} />
      ) : error && error.length > 0 ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No logs found</Text>
          <Text style={styles.emptySubtext}>
            This transaction hasn't been modified yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderLogItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.logsList}
          scrollEnabled={false}
        />
      )}
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Transaction Log</Text>
              <Text style={styles.headerSubtitle}>
                History for #{transaction?.id}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {content}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: width * 0.95,
    maxHeight: height * 0.8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logsList: {
    paddingBottom: 20,
  },
  logItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#6366F1",
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logTimestamp: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  logEditor: {
    fontSize: 10,
    color: "#6B7280",
    fontStyle: "italic",
  },
  changesContainer: {
    gap: 4,
  },
  changeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 2,
  },
  changeField: {
    fontSize: 11,
    fontWeight: "500",
    color: "#374151",
    flex: 1,
  },
  changeValue: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
    flex: 2,
    textAlign: "right",
  },
  noChanges: {
    fontSize: 11,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
}); 