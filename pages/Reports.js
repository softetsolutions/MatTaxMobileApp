import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { fetchTransactions } from "../api/transactions";
import useLoginStore from "../store/store";
import DateTimePicker from "@react-native-community/datetimepicker";
import Loader from "../components/Loader";
import { exportToCSV } from "../utils/csvExport";

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const token = useLoginStore((state) => state.token);
  const userId = useLoginStore((state) => state.id);

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  useEffect(() => {
    const fetchTransactionData = async () => {
      setLoading(true);
      try {
        const data = await fetchTransactions(token, userId, currentPage, pageSize);
        
        if (data && data.transactions) {
          setAllTransactions(data.transactions);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.totalItems || 0);
        } else {
          console.error("Unexpected data format:", data);
          throw new Error("Received invalid data format from server");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch transactions");
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token && userId) {
      fetchTransactionData();
    }
  }, [token, userId, currentPage, pageSize]);

  // Filter by date range
  const parseInputDate = (input, isEnd = false) => {
    if (!input) return null;
    const date = new Date(input);
    if (isEnd) {
      date.setHours(23, 59, 59, 999);
    }
    return date;
  };

  const filteredTransactions = allTransactions.filter((txn) => {
    const txnDate = new Date(txn.created_at);
    const start = parseInputDate(startDate);
    const end = parseInputDate(endDate, true);

    return (!start || txnDate >= start) && (!end || txnDate <= end);
  });

  // Total In/Out
  const totalIn = filteredTransactions
    .filter((txn) => txn.type === "moneyIn")
    .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);

  const totalOut = filteredTransactions
    .filter((txn) => txn.type === "moneyOut")
    .reduce((sum, txn) => sum + Number(txn.amount || 0), 0);

  // Vendor Summary
  const vendorSummary = filteredTransactions.reduce((acc, txn) => {
    const name = txn.vendorname || txn.vendor || "Unknown";
    const type = txn.type === "moneyOut" ? "moneyOut" : "moneyIn";
    if (!acc[name]) acc[name] = { moneyIn: 0, moneyOut: 0 };
    acc[name][type] += Number(txn.amount || 0);
    return acc;
  }, {});

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "mm/dd/yyyy";
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (error) {
      return "mm/dd/yyyy";
    }
  };

  const handleDownloadCSV = async () => {
    const data = {
      startDate,
      endDate,
      totalIn,
      totalOut,
      vendorSummary,
    };
    
    await exportToCSV(data, 'report');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRetry = () => {
    setError(null);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader message="Loading your reports..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Failed to load Reports</Text>
        <Text style={styles.errorMessage}>Please check your connection or try again later.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>View and manage your financial reports</Text>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filter Options</Text>
          <TouchableOpacity 
            style={[
              styles.clearButton, 
              (!startDate && !endDate) && styles.clearButtonDisabled
            ]} 
            onPress={clearDateFilters}
            disabled={!startDate && !endDate}
          >
            <Text style={[
              styles.clearButtonText,
              (!startDate && !endDate) && styles.clearButtonTextDisabled
            ]}>Clear All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dateFilterContainer}>
          <Text style={styles.filterLabel}>Date Range</Text>
          <View style={styles.dateInputsContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.dateInputLabel}>From</Text>
              <Text style={styles.dateInputText}>
                {formatDateForDisplay(startDate)}
              </Text>
            </TouchableOpacity>
            <View style={styles.dateSeparator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>to</Text>
              <View style={styles.separatorLine} />
            </View>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.dateInputLabel}>To</Text>
              <Text style={styles.dateInputText}>
                {formatDateForDisplay(endDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.exportContainer}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionCount}>
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
            </Text>
            <Text style={styles.transactionSubtext}>
              Based on your selected filters
            </Text>
          </View>
          <TouchableOpacity style={styles.exportButton} onPress={handleDownloadCSV}>
            <Text style={styles.exportButtonText}>Export CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Money In</Text>
            <Text style={styles.summaryAmountIn}>₹{totalIn.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <View style={styles.summaryTrend}>
              <Text style={styles.trendText}>Income</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Money Out</Text>
            <Text style={styles.summaryAmountOut}>₹{totalOut.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <View style={styles.summaryTrend}>
              <Text style={styles.trendText}>Expenses</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Vendor Summary Table */}
      <View style={styles.tableSection}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>Vendor Wise Summary</Text>
          <Text style={styles.tableSubtitle}>Breakdown by vendor</Text>
        </View>
        
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.headerVendor}>Vendor</Text>
            <Text style={styles.headerMoneyIn}>Money In (₹)</Text>
            <Text style={styles.headerMoneyOut}>Money Out (₹)</Text>
          </View>
          
          {Object.entries(vendorSummary).map(([vendor, totals], index) => (
            <View key={vendor} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlternate]}>
              <Text style={styles.vendorName} numberOfLines={1}>{vendor}</Text>
              <Text style={styles.moneyInText}>
                {totals.moneyIn > 0 ? `₹${totals.moneyIn.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
              </Text>
              <Text style={styles.moneyOutText}>
                {totals.moneyOut > 0 ? `₹${totals.moneyOut.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
              </Text>
            </View>
          ))}
          
          {Object.keys(vendorSummary).length === 0 && (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>No transactions to display</Text>
              <Text style={styles.emptySubtext}>Try adjusting your date filters</Text>
            </View>
          )}
        </View>
      </View>

      {/* Pagination */}
      {allTransactions.length > 0 && (
        <View style={styles.paginationSection}>
          <View style={styles.paginationInfo}>
            <Text style={styles.paginationText}>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
            </Text>
          </View>
          <View style={styles.paginationButtons}>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
                ←
              </Text>
            </TouchableOpacity>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <TouchableOpacity
                  key={pageNum}
                  style={[styles.paginationButton, currentPage === pageNum && styles.paginationButtonActive]}
                  onPress={() => handlePageChange(pageNum)}
                >
                  <Text style={[styles.paginationButtonText, currentPage === pageNum && styles.paginationButtonTextActive]}>
                    {pageNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
            
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
              onPress={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
                →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate ? new Date(endDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 22,
  },
  filterSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
  },
  clearButtonDisabled: {
    opacity: 0.5,
    backgroundColor: "#e5e7eb",
  },
  clearButtonText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#3b82f6",
  },
  clearButtonTextDisabled: {
    color: "#9ca3af",
  },
  dateFilterContainer: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  dateInputsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  dateInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginRight: 6,
  },
  dateInputLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
    fontWeight: "500",
  },
  dateInputText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 6,
    minWidth: 40,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  separatorText: {
    fontSize: 10,
    color: "#6b7280",
    marginHorizontal: 6,
    fontWeight: "500",
  },
  exportContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },
  transactionCount: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  transactionSubtext: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 1,
  },
  exportButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  exportButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 14,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 14,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 6,
    textAlign: "center",
  },
  summaryAmountIn: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 6,
  },
  summaryAmountOut: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 6,
  },
  summaryTrend: {
    backgroundColor: "#f0fdf4",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 10,
    color: "#059669",
    fontWeight: "500",
  },
  tableSection: {
    marginBottom: 24,
  },
  tableHeader: {
    marginBottom: 16,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  tableSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerVendor: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  headerMoneyIn: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
    textAlign: "center",
  },
  headerMoneyOut: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableRowAlternate: {
    backgroundColor: "#f9fafb",
  },
  vendorName: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  moneyInText: {
    flex: 1,
    fontSize: 14,
    color: "#059669",
    textAlign: "center",
    fontWeight: "500",
  },
  moneyOutText: {
    flex: 1,
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
    fontWeight: "500",
  },
  emptyRow: {
    padding: 40,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  paginationSection: {
    alignItems: "center",
    marginTop: 24,
    paddingTop: 20,
  },
  paginationInfo: {
    marginBottom: 16,
  },
  paginationText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  paginationButtons: {
    flexDirection: "row",
    gap: 8,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paginationButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.2,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  paginationButtonTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  paginationButtonTextDisabled: {
    color: "#9ca3af",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
}); 