import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import LoginSignup from "../components/LoginSignup";
import useLoginStore from "../store/store";
import SplashScreen from "../components/SplashScreen";
import ScreenContainer from "../components/ScreenContainer";
import InitialAppScreen from "./InitialAppScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export default function MainScreen() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const isLoggedIn = useLoginStore((state) => state.isLoggedIn);
  const setLoginDetails = useLoginStore((state) => state.setLoginDetails);

  useEffect(() => {
    const loadLoginDetailInTheStore = async () => {
      try {
        const value = await AsyncStorage.getItem("token");
        if (value) {
          const decode = jwtDecode(value);
          setLoginDetails(true, value, decode);
        } else {
          setLoginDetails(false, "value", undefined);
        }
      } catch (e) {
        setLoginDetails(false, "value", undefined);
      } finally {
        setShowSplashScreen(false);
      }
    };
    // setTimeout(() => {
    //   setShowSplashScreen(false);
    // }, 5000);
    loadLoginDetailInTheStore();
  }, []);

  return showSplashScreen ? (
    <SplashScreen />
  ) : (
    <ScreenContainer style={styles.container}>
      {isLoggedIn ? <InitialAppScreen /> : <LoginSignup />}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // alignItems: "center",
    // justifyContent: "center",
  },
});
