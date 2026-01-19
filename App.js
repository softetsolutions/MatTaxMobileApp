import { SafeAreaProvider } from "react-native-safe-area-context";
import MainScreen from "./pages/MainScreen";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./Navigation/RootNavigator";
import Toast from "react-native-toast-message"
export default function App() {
  return (
    <SafeAreaProvider>
       <NavigationContainer>
        <RootNavigator />
        <Toast />
      {/* <MainScreen /> */}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
