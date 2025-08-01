import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { getReceiptById } from "../api/receipts";
import { deleteTransaction } from "../api/transactions";
import { formatDate } from "../utils/date";
import Loader from "./Loader";
import ReceiptImageModal from "./ReceiptImageModal";
import TransactionLogModal from "./TransactionLogModal";

const { width, height } = Dimensions.get("window");

export default function TransactionDetailsModal({
  visible,
  transaction,
  onClose,
  onEdit,
  onDelete,
  userId,
  categoryMap = {},
  vendorMap = {},
  accountMap = {},
  subcategoryMap = {},
  token,
}) {
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState("");
  const [logModalVisible, setLogModalVisible] = useState(false);

  // Fetch receipt image when transaction changes
  useEffect(() => {
    if (transaction && transaction.receipt) {
      setReceiptLoading(true);
      setReceiptError("");
      setReceiptImage(null);
      getReceiptById(token, transaction.receipt)
        .then(res => {
          if (res.data) {
            setReceiptImage(`data:image/jpeg;base64,${res.data}`);
          } else {
            setReceiptError("No receipt image found.");
          }
        })
        .catch(() => setReceiptError("Failed to load receipt image."))
        .finally(() => setReceiptLoading(false));
    } else {
      setReceiptImage(null);
      setReceiptError("");
      setReceiptLoading(false);
    }
  }, [transaction, token]);

  if (!transaction) return null;

  const formatAmount = (amount) => {
    if (!amount) return "0";
    return parseFloat(amount).toFixed(2);
  };

  const getTypeColor = (type) => {
    return type === "moneyIn" ? "#10B981" : "#EF4444";
  };

  const getTypeText = (type) => {
    return type === "moneyIn" ? "Money In" : "Money Out";
  };

  const getTypeIcon = (type) => {
    return type === "moneyIn" ? "↗" : "↘";
  };

  const handleEditTransaction = () => {
    if (onEdit) {
      onEdit(transaction);
    }
  };

  const handleDeleteTransaction = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteTransaction(token, userId, transaction.id);
              
              Alert.alert("Success", "Transaction deleted successfully");
              if (onDelete) {
                onDelete(transaction);
              }
              onClose();
            } catch (error) {
              Alert.alert("Error", `Failed to delete transaction: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Header with gradient background */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Transaction Details</Text>
              <Text style={styles.headerSubtitle}>#{transaction.id}</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={() => setLogModalVisible(true)} 
                style={styles.menuButton}
              >
                <Text style={styles.menuButtonText}>☰</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* Transaction Logs at top */}
            {logModalVisible && (
              <View style={styles.logsContainer}>
                <View style={styles.logsHeader}>
                  <Text style={styles.logsTitle}>Transaction History</Text>
                  <TouchableOpacity 
                    onPress={() => setLogModalVisible(false)} 
                    style={styles.closeLogsButton}
                  >
                    <Text style={styles.closeLogsButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <TransactionLogModal
                  visible={logModalVisible}
                  transaction={transaction}
                  onClose={() => setLogModalVisible(false)}
                  token={token}
                  userId={userId}
                  embedded={true}
                />
              </View>
            )}

            {/* Receipt at top */}
            {transaction.receipt && (
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                {receiptLoading ? (
                  <View style={{ marginVertical: 12 }}>
                    <Loader size="large" />
                    <Text style={{ color: '#6366F1', marginTop: 8, fontWeight: 'bold' }}>Loading receipt...</Text>
                  </View>
                ) : receiptError ? (
                  <Text style={{ color: 'red', marginVertical: 12 }}>{receiptError}</Text>
                ) : receiptImage ? (
                  <TouchableOpacity onPress={() => setReceiptModalVisible(true)} activeOpacity={0.8}>
                    <Image
                      source={{ uri: receiptImage }}
                      style={{ width: 180, height: 220, borderRadius: 10, resizeMode: 'contain', backgroundColor: '#eee' }}
                    />
                    <Text style={{ color: '#6366F1', fontSize: 12, textAlign: 'center', marginTop: 4 }}>Tap to view full screen</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {/* Amount and Type Card */}
            <View style={styles.amountCard}>
              <View style={styles.amountRow}>
                <Text style={styles.currencySymbol}>$</Text>
                <Text
                  style={[
                    styles.amountText,
                    { color: getTypeColor(transaction.type) },
                  ]}
                >
                  {formatAmount(transaction.amount)}
                </Text>
              </View>
              <View style={styles.typeContainer}>
                <Text style={styles.typeIcon}>
                  {getTypeIcon(transaction.type)}
                </Text>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: getTypeColor(transaction.type) },
                  ]}
                >
                  <Text style={styles.typeText}>
                    {getTypeText(transaction.type)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Date Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Date & Time</Text>
              <Text style={styles.cardValue}>
                {formatDate(transaction.created_at)}
              </Text>
            </View>

            {/* Description Card */}
            {transaction.desc3 && (
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Description</Text>
                <Text style={styles.cardValue}>{transaction.desc3}</Text>
              </View>
            )}

            {/* Vendor Card */}
            {transaction.vendorName && (
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Vendor</Text>
                <Text style={styles.cardValue}>
                  {vendorMap[transaction.vendorName] || transaction.vendorName}
                </Text>
              </View>
            )}

            {/* Category Card */}
            {transaction.category && (
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Category</Text>
                <Text style={styles.cardValue}>
                  {categoryMap[transaction.category] ||
                    `Category ${transaction.category}`}
                </Text>
              </View>
            )}

            {/* Sub Category Card */}
            {transaction.sub_category1 && (
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Sub Category</Text>
                <Text style={styles.cardValue}>
                  {subcategoryMap[transaction.sub_category1] ||
                    transaction.sub_category1}
                </Text>
              </View>
            )}

            {/* Account Number Card */}
            {transaction.accountno && (
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Account Number</Text>
                <Text style={styles.cardValue}>
                  {accountMap[transaction.accountno] || transaction.accountno}
                </Text>
              </View>
            )}

            {/* Payment Breakdown Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Payment Breakdown</Text>
              <View style={styles.breakdownContainer}>
                {transaction.amount_cash > 0 && (
                  <View style={styles.breakdownItem}>
                    <View style={styles.breakdownLabelContainer}>
                      <View
                        style={[
                          styles.breakdownIcon,
                          { backgroundColor: "#F59E0B" },
                        ]}
                      />
                      <Text style={styles.breakdownLabel}>Cash</Text>
                    </View>
                    <Text style={styles.breakdownValue}>
                      ${formatAmount(transaction.amount_cash)}
                    </Text>
                  </View>
                )}
                {transaction.amount_bank > 0 && (
                  <View style={styles.breakdownItem}>
                    <View style={styles.breakdownLabelContainer}>
                      <View
                        style={[
                          styles.breakdownIcon,
                          { backgroundColor: "#3B82F6" },
                        ]}
                      />
                      <Text style={styles.breakdownLabel}>Bank</Text>
                    </View>
                    <Text style={styles.breakdownValue}>
                      ${formatAmount(transaction.amount_bank)}
                    </Text>
                  </View>
                )}
                {transaction.amount_creditcard > 0 && (
                  <View style={styles.breakdownItem}>
                    <View style={styles.breakdownLabelContainer}>
                      <View
                        style={[
                          styles.breakdownIcon,
                          { backgroundColor: "#8B5CF6" },
                        ]}
                      />
                      <Text style={styles.breakdownLabel}>Credit Card</Text>
                    </View>
                    <Text style={styles.breakdownValue}>
                      ${formatAmount(transaction.amount_creditcard)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* VAT/GST Card */}
            {transaction.vat_gst_amount && (
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>VAT/GST Amount</Text>
                <Text style={styles.cardValue}>
                  ${formatAmount(transaction.vat_gst_amount)}
                </Text>
                {transaction.vat_gst_percentage && (
                  <Text style={styles.percentageText}>
                    ({transaction.vat_gst_percentage}%)
                  </Text>
                )}
              </View>
            )}

            {/* Invoice Details Card */}
            {transaction.invoice_amount && (
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Invoice Amount</Text>
                <Text style={styles.cardValue}>
                  ${formatAmount(transaction.invoice_amount)}
                </Text>
              </View>
            )}

            {/* Balance Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Balance</Text>
              <Text
                style={[
                  styles.cardValue,
                  {
                    color:
                      parseFloat(transaction.balance || 0) >= 0
                        ? "#10B981"
                        : "#EF4444",
                  },
                ]}
              >
                ${formatAmount(transaction.balance)}
              </Text>
            </View>
          </ScrollView>

          {/* Fixed Action Buttons */}
          <View style={styles.fixedActionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditTransaction}
              activeOpacity={0.8}
            >
              <Image 
                source={require('../assets/edit.png')} 
                style={styles.buttonIcon}
                resizeMode="contain"
              />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteTransaction}
              activeOpacity={0.8}
            >
              <Image 
                source={require('../assets/delete.png')} 
                style={styles.buttonIcon}
                resizeMode="contain"
              />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Receipt Image Modal */}
      <ReceiptImageModal
        visible={receiptModalVisible}
        image={receiptImage}
        onClose={() => setReceiptModalVisible(false)}
        error={receiptError}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalView: {
    width: width,
    height: height,
    backgroundColor: "#F8FAFC",
    paddingBottom: 20,
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
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  menuButtonText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "bold",
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
    paddingBottom: 120,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  amountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#64748B",
    marginRight: 3,
  },
  amountText: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  typeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
    lineHeight: 20,
  },
  percentageText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
    fontStyle: "italic",
  },
  breakdownContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    padding: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  breakdownLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  breakdownIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  breakdownLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  breakdownValue: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "600",
  },
  viewReceiptButton: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#4F46E5",
  },
  viewReceiptButtonDisabled: {
    opacity: 0.7,
    backgroundColor: "#D1D5DB",
    borderColor: "#9CA3AF",
    shadowColor: "#9CA3AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewReceiptButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  viewReceiptIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  viewReceiptTextContainer: {
    flex: 1,
  },
  viewReceiptButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
  },
  viewReceiptSubtext: {
    fontSize: 11,
    color: "#D1D5DB",
    marginTop: 2,
  },
  viewReceiptArrow: {
    fontSize: 20,
    color: "#D1D5DB",
    marginLeft: 10,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
  fixedActionButtons: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  logsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  logsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },
  closeLogsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  closeLogsButtonText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "bold",
  },
});
