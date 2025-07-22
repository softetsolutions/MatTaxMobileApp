import { Image } from "react-native";

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

export default tabs; 