import { SafeAreaProvider } from "react-native-safe-area-context";
import MainScreen from "./pages/MainScreen";
import Profile from "./components/Profile";

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  );
}
