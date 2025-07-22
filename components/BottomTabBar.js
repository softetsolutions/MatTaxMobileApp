import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomTabBar({ tabs, activeTab, setActiveTab }) {
  const insets = useSafeAreaInsets ? useSafeAreaInsets() : { bottom: 0 };
  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}> 
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tabButton}
          onPress={() => setActiveTab(tab.key)}
        >
          {tab.icon(tab.key === activeTab ? "#1976d2" : tab.key === "bin" ? "#d32f2f" : "gray")}
          <Text style={{ color: tab.key === activeTab ? "#1976d2" : tab.key === "bin" ? "#d32f2f" : "gray", fontSize: 10, textAlign: 'center', maxWidth: 60 }} numberOfLines={1} ellipsizeMode="tail">
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    minWidth: 70,
    paddingHorizontal: 4,
  },
}); 