import { Text } from "react-native";
import Transactions from "../pages/Transactions";

export default function TabContent({ activeTab }) {
  switch (activeTab) {
    case "transactions":
      return <Transactions />;
    case "authorise":
      return <Text style={{ textAlign: "center", marginTop: 40 }}>Authorise Accountant Screen</Text>;
    case "bin":
      return <Text style={{ textAlign: "center", marginTop: 40 }}>Bin Screen</Text>;
    case "profile":
      return <Text style={{ textAlign: "center", marginTop: 40 }}>Profile Screen</Text>;
    case "report":
      return <Text style={{ textAlign: "center", marginTop: 40 }}>Report Screen </Text>;
    default:
      return null;
  }
} 