import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function BinScreen() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletedTransactions, setDeletedTransactions] = useState([]);

  useEffect(() => {
    const fetchDeleted = async () => {
      try {
        const token = await AsyncStorage.getItem("token"); // Adjust key as per your app

        const decoded = jwtDecode(token);

        if (token) {
          setUserId(decoded.id);
          const data = await fetchDeletedTransactions(token, 1, 10);

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

  const renderItem = ({ item }) => (
    <View style={styles.card} key={item._id}>
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
        <TouchableOpacity style={styles.restoreButton}>
          <Text style={styles.buttonText}>Restore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bin</Text>
      <Text style={styles.subtitle}>Deleted Transactions</Text>

      <FlatList
        data={deletedTransactions}
        keyExtractor={(item) => item._id}
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
});
