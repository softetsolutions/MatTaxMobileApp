import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { useEffect, useState, useCallback } from "react";
import TransactionCard from "../components/TransactionCard";
import TransactionDetailsModal from "../components/TransactionDetailsModal";
import { fetchTransactions } from "../api/transactions";
import { fetchCategories } from "../api/categories";
import { fetchVendors } from "../api/vendors";
import { fetchAccounts } from "../api/accounts";
import { fetchSubcategories } from "../api/subcategories";
import useLoginStore from "../store/store";
import { formatDate } from "../utils/date";
import Loader from "../components/Loader";
import AddTransactionModal from "../components/AddTransactionModal";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [vendorMap, setVendorMap] = useState({});
  const [accountMap, setAccountMap] = useState({});
  const [subcategoryMap, setSubcategoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const token = useLoginStore((state) => state.token);
  const userId = useLoginStore((state) => state.id);

  const getData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch categories
      const cats = await fetchCategories(token, userId);
      setCategories(cats);
      const catMap = Object.fromEntries(cats.map(cat => [cat.id, cat.name]));
      setCategoryMap(catMap);

      // Fetch subcategories for each category
      const subcatMap = {};
      for (const cat of cats) {
        try {
          const subcats = await fetchSubcategories(token, cat.id);
          subcats.forEach(subcat => {
            subcatMap[subcat.id] = subcat.name;
          });
        } catch (err) {
        }
      }
      setSubcategoryMap(subcatMap);

      // Fetch vendors
      const vends = await fetchVendors(token, userId);
      setVendors(vends);
      const vendMap = Object.fromEntries(vends.map(vend => [vend.id, vend.name]));
      setVendorMap(vendMap);

      // Fetch accounts
      const accs = await fetchAccounts(token, userId);
      setAccounts(accs);
      const accMap = Object.fromEntries(accs.map(acc => [acc.id, acc.accountNo]));
      setAccountMap(accMap);

      // Fetch first page of transactions
      const data = await fetchTransactions(token, userId, 1, 10);
      setTransactions(data.transactions || data);
      setTotalItems(data.totalItems || (data.transactions || data).length);
      setPage(1);
      setHasMore((data.transactions || data).length === 10);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId) getData();
  }, [token, userId]);

  const loadMoreTransactions = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchTransactions(token, userId, nextPage, 10);
      const newTransactions = data.transactions || data;
      setTransactions(prev => [...prev, ...newTransactions]);
      setTotalItems(data.totalItems || (data.transactions || data).length);
      setPage(nextPage);
      setHasMore(newTransactions.length === 10);
    } catch (err) {
      setError(err.message || "Failed to load more transactions");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, token, userId]);

  const handleTransactionPress = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTransaction(null);
  };
  1
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setEditModalVisible(true);
    setModalVisible(false);
  };

  // New function to handle edit modal close
  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingTransaction(null);
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return <Loader size="large" style={{ marginVertical: 16 }} />;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Transactions</Text>
      <Text style={styles.countText}>{totalItems} transaction{totalItems === 1 ? '' : 's'} found</Text>
      {loading ? (
        <Loader message="Loading transactions..." style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={{ color: 'red', marginTop: 20 }}>{error}</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id?.toString()}
          renderItem={({ item }) => (
            <TransactionCard
              key={item.id}
              date={formatDate(item.created_at)}
              description={item.desc3 || 'No description'}
              amount={item.amount}
              category={categoryMap[item.category] || `Category ${item.category}`}
              type={item.type}
              onPress={() => handleTransactionPress(item)}
            />
          )}
          onEndReached={loadMoreTransactions}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        visible={modalVisible}
        transaction={selectedTransaction}
        onClose={closeModal}
        onEdit={handleEditTransaction}
        onDelete={async (deletedTransaction) => {
          // Remove the deleted transaction from the list
          setTransactions(prev => prev.filter(t => t.id !== deletedTransaction.id));
          setTotalItems(prev => prev - 1);
        }}
        userId={userId}
        categoryMap={categoryMap}
        vendorMap={vendorMap}
        accountMap={accountMap}
        subcategoryMap={subcategoryMap}
        token={token}
      />
      
      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        accounts={accounts}
        setAccounts={setAccounts} 
        categories={categories}
        setCategories={setCategories} 
        subcategories={Object.entries(subcategoryMap).map(([id, name]) => ({ id, name }))}
        setSubcategoryMap={setSubcategoryMap}
        vendors={vendors}
        setVendors={setVendors}
        token={token}
        userId={userId}
        onSubmit={async () => {
          setAddModalVisible(false);
          await getData();
        }}
      />

      {/* Edit Transaction Modal */}
      <AddTransactionModal
        visible={editModalVisible}
        onClose={closeEditModal}
        isEditing={true}
        editingTransaction={editingTransaction}
        accounts={accounts}
        setAccounts={setAccounts} 
        categories={categories}
        setCategories={setCategories} 
        subcategories={Object.entries(subcategoryMap).map(([id, name]) => ({ id, name }))}
        setSubcategoryMap={setSubcategoryMap}
        vendors={vendors}
        setVendors={setVendors}
        token={token}
        userId={userId}
        onSubmit={async () => {
          closeEditModal();
          await getData();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
    marginLeft: 4,
    marginBottom: 8,
  },
  countText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 6,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: '#1976d2',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 2,
  },
}); 