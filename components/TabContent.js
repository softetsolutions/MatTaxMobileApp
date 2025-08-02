import { Text } from "react-native";
import Transactions from "../pages/Transactions";
import Reports from "../pages/Reports";
import Bin from "../pages/Bin";
import Profile from "../components/Profile"

export default function TabContent({ activeTab }) {
  switch (activeTab) {
    case "transactions":
      return <Transactions />;
    case "authorise":
      return <Text style={{ textAlign: "center", marginTop: 40 }}>Authorise Accountant Screen</Text>;
    case "bin":
      return <Bin/>;
    case "profile":
      return <Profile/>;
    case "report":
      return <Reports />;
    default:
      return null;
  }
} 