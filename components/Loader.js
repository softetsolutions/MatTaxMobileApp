import { ActivityIndicator, View, StyleSheet } from "react-native";

export default function Loader({ size = "large", color = "#1976d2", style }) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
}); 