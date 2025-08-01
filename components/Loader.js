import { ActivityIndicator, View, Text, StyleSheet } from "react-native";

export default function Loader({ size = "large", color = "#1976d2", style, message }) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
  },
}); 