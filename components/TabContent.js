import { Text } from "react-native";
import Transactions from "../pages/Transactions";
import Bin from "../pages/Bin";
import AccountantPage from "../pages/AccountantPage";
import Profile from "../pages/ProfilePage";

export default function TabContent({ activeTab }) {
  switch (activeTab) {
    case "transactions":
      return <Transactions />;
    case "authorise":
      return <AccountantPage/>;
    case "bin":
      return <Bin/>;
    case "profile":
      return <Profile/>;
    case "report":
      return <Text style={{ textAlign: "center", marginTop: 40 }}>Report Screen </Text>;
    default:
      return null;
  }
} 