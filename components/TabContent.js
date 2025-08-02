import { Text } from "react-native";
import Transactions from "../pages/Transactions";
import Reports from "../pages/Reports";
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
      return <Reports />;
    default:
      return null;
  }
} 