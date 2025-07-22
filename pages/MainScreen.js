import { useEffect, useState } from "react";
import { StyleSheet, Text, Image } from "react-native";
import LoginSignup from "../components/LoginSignup";
import useLoginStore from "../store/store";
import SplashScreen from "../components/SplashScreen";
import ScreenContainer from "../components/ScreenContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import BottomTabBar from "../components/BottomTabBar";
import TabContent from "../components/TabContent";

export default function MainScreen() {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const isLoggedIn = useLoginStore((state) => state.isLoggedIn);
  const setLoginDetails = useLoginStore((state) => state.setLoginDetails);
  const [activeTab, setActiveTab] = useState("transactions");

  useEffect(() => {
    const loadLoginDetailInTheStore = async () => {
      try {
        const value = await AsyncStorage.getItem("token");
        if (value) {
          const decode = jwtDecode(value);
          setLoginDetails(true, value, decode.id, decode.role);
        } else {
          setLoginDetails(false, "value", undefined);
        }
      } catch (e) {
        setLoginDetails(false, "value", undefined);
      } finally {
        setShowSplashScreen(false);
      }
    };
    loadLoginDetailInTheStore();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      ...(!isLoggedIn && { backgroundColor: "#fff" }),
    },
  });

  const tabs = [
    {
      key: "transactions",
      label: "Transactions",
      icon: (color) => (
        <Image source={require("../assets/Transaction_Icon.png")} style={{ width: 24, height: 24, tintColor: color }} />
      ),
    },
    {
      key: "authorise",
      label: "Accountant",
      icon: (color) => (
        <Image source={require("../assets/Authorize_Icon.png")} style={{ width: 24, height: 24, tintColor: color }} />
      ),
    },
    {
      key: "bin",
      label: "Bin",
      icon: (color) => (
        <Image source={require("../assets/Bin_Icon.png")} style={{ width: 24, height: 24, tintColor: color }} />
      ),
    },
    {
      key: "profile",
      label: "Profile",
      icon: (color) => (
        <Image source={require("../assets/user.png")} style={{ width: 24, height: 24, tintColor: color }} />
      ),
    },
    {
      key: "report",
      label: "Report",
      icon: (color) => (
        <Image source={require("../assets/icons8-reports-50.png")} style={{ width: 24, height: 24, tintColor: color }} />
      ),
    },
  ];

  return showSplashScreen ? (
    <SplashScreen />
  ) : (
    <ScreenContainer style={styles.container}>
      {isLoggedIn ? (
        <>
          <TabContent activeTab={activeTab} />
          <BottomTabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      ) : (
        <LoginSignup />
      )}
    </ScreenContainer>
  );
}
