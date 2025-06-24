import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const ScreenContainer = ({
  children,
  style,
  statusBarStyle = "dark",
  backgroundColor = "#fff",
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]}>
      <StatusBar
        style={statusBarStyle}
        translucent={false}
        backgroundColor={backgroundColor}
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenContainer;
