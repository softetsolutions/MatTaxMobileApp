import { SafeAreaProvider } from "react-native-safe-area-context";
import MainScreen from "./pages/MainScreen";
export default function App() {
  return (
    <SafeAreaProvider>
      {/* <MainScreen /> */}
      <Profile />
    </SafeAreaProvider>
  );
}
