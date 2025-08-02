import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { fetchDeletedTransactions } from "../api/transactions";
import { Alert } from "react-native";
import URI from "../assets/constants";
import useLoginStore from "../store/store";
import Loader from "../components/Loader";


export default function BinScreen() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletedTransactions, setDeletedTransactions] = useState([]);
  const { token, id } = useLoginStore();

  useEffect(() => {
    const fetchDeleted = async () => {
      try {
        // const token = await AsyncStorage.getItem("token"); // Adjust key as per your app
        // const decoded = jwtDecode(token);
      


        if (token) {
          setUserId(id);
          const data = await fetchDeletedTransactions(token, id, 1, 10);
          setDeletedTransactions(data.transactions);
        
        } else {
          console.warn("No token found");
        }
      } catch (error) {
        console.error("Error loading deleted transactions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeleted();
  }, []);

  //  Handle Restore
  const handleRestore = async (transactionId) => {
    try {
     
      if (!token) throw new Error("No token found");

    
      const queryParams = new URLSearchParams({ userId: id,
        transactionId: transactionId,
       }).toString();

      const res = await fetch(
        `${URI}/transaction/restore?${queryParams}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ transactionId }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore");

      // Update UI after restore
      setDeletedTransactions((prev) =>
        prev.filter((item) => item.id !== transactionId)
      );

      Alert.alert("Success", "Transaction restored successfully");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  //  Handle Permanent Delete
  const handlePermanentDelete = async (transactionId) => {
    try {
      // const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token found");

    
      const queryParams = new URLSearchParams({ userId: id, transactionId: transactionId, }).toString();

      const res = await fetch(
        `${URI}/transaction/deletePermanently?${queryParams}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ transactionId }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      // Update UI after delete
      setDeletedTransactions((prev) =>
        prev.filter((item) => item.id !== transactionId)
      );

      Alert.alert("Deleted", "Transaction permanently deleted");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };
  const renderItem = ({ item }) => (
    <View style={styles.card} key={item.id}>
      <Text style={styles.amount}>₹{item.amount}</Text>
      <Text style={styles.category}>Category: {item.category}</Text>
      <Text
        style={[
          styles.type,
          { color: item.type === "moneyIn" ? "green" : "red" },
        ]}
      >
        {item.type === "moneyIn" ? "Money In" : "Money Out"}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.restoreButton}
        onPress={() => handleRestore(item.id)}>
          <Text style={styles.buttonText}>Restore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} 
        onPress={() => handlePermanentDelete(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader message="Loading deleted transactions..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bin</Text>
      <Text style={styles.subtitle}>Deleted Transactions</Text>

      <FlatList
        data={deletedTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  category: {
    fontSize: 14,
    marginTop: 4,
  },
  type: {
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  restoreButton: {
    backgroundColor: "#4caf50",
    padding: 8,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
