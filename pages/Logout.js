// import { Alert, TouchableOpacity, Text, View } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import URI from "../assets/constants"

// const LogoutButton = () => {
//   const navigation = useNavigation();

//   const handleLogOut = async () => {
//     try {
//       const response = await fetch(`${URI}/auth/logout`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({}),
//       });

//       if (response.status !== 200) {
//         Alert.alert("Error", "Error logging out");
//         return;
//       }

//       // Remove token
//       await AsyncStorage.removeItem("token");

//       Alert.alert("Success", "You’ve been logged out safely. See you soon!");

//       // Navigate to login screen
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "Login" }], // Replace "Login" with your login screen name
//       });
//     } catch (e) {
//       console.error(e);
//       Alert.alert("Error", "Please try again.");
//     }
//   };

//   return (
//     <View style={{ marginTop: "auto", borderTopWidth: 1, borderColor: "#ccc" }}>
//       <TouchableOpacity
//         onPress={handleLogOut}
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           padding: 12,
//           borderRadius: 8,
//         }}
//       >
//         {/* You can use an icon from react-native-vector-icons */}
//         <Text style={{ marginLeft: 8, color: "#d00", fontWeight: "bold" }}>
//           Logout
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default LogoutButton;
