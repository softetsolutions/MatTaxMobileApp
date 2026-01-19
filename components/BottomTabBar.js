import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import URI from "../assets/constants"
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";



export default function BottomTabBar({ tabs, activeTab, setActiveTab }) {
  const insets = useSafeAreaInsets ? useSafeAreaInsets() : { bottom: 0 };
  const navigation = useNavigation();

   const handleLogOut = async () => {
    
    try {
      const response = await fetch(`${URI}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.status !== 200) {
        Alert.alert("Error", "Error logging out");
        return;
      }

      await AsyncStorage.removeItem("token");
      Alert.alert("Success", "You’ve been logged out safely. See you soon!");

      // Reset navigation stack to Login screen
    navigation.navigate("Login");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Please try again.");
    }
  };
  return (
    <View style={[styles.tabBar, { height: 60 + insets.bottom }]}> 
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tabButton}
          onPress={() => {
  if (tab.key === "logout") {
    handleLogOut(); // call the logout function
  } else {
    setActiveTab(tab.key); // normal tab switch
  }
}}
        >
          {tab.icon(tab.key === activeTab ? "#1976d2" : tab.key === "bin"|| tab.key === "logout" ? "#d32f2f" : "gray")}
          <Text style={{ color: tab.key === activeTab ? "#1976d2" : tab.key === "bin" || tab.key === "logout" ? "#d32f2f" : "gray", fontSize: 10, textAlign: 'center', maxWidth: 60 }} numberOfLines={1} ellipsizeMode="tail">
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    height: 60,
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 100,
  },
  tabButton: {
   alignItems: "center",
  justifyContent: "center",
  minWidth: 55,
  paddingVertical: 4,
  },
}); 