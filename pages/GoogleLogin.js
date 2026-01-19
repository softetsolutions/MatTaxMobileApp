// import React from "react";
// import { View, Text, TouchableOpacity, Alert } from "react-native";
// import * as AuthSession from "expo-auth-session";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import URI from "../assets/constants";

// export default function LoginSignup() {
//   const navigation = useNavigation();

//   const GOOGLE_CLIENT_ID =
//     "397175923929-mc6usvrc0mbq4n1u2ksmshd1eqscc1sj.apps.googleusercontent.com";

//   const handleGoogleLogin = async () => {
//     try {
//       // Generate redirect URI
//       const redirectUri = AuthSession.makeRedirectUri();

//       console.log("Redirect URI:", redirectUri);

//       const authUrl =
//         `https://accounts.google.com/o/oauth2/v2/auth` +
//         `?client_id=${GOOGLE_CLIENT_ID}` +
//         `&redirect_uri=${encodeURIComponent(redirectUri)}` +
//         `&response_type=code` +
//         `&scope=openid%20email%20profile`;

//       // Open Google login page
//       const result = await AuthSession.startAsync({ authUrl });

//       if (result.type === "success") {
//         const code = result.params.code;

//         // Hit same backend endpoint as web
//         const response = await fetch(
//           `${URI}/auth/google-login?code=${code}`,
//           {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//           }
//         );

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || "Google Login Failed");
//         }

//         // Save token same as web
//         await AsyncStorage.setItem("userToken", data.data);

//         Alert.alert("Success", "Logged in with Google");
//         navigation.navigate("Dashboard");
//       } else {
//         Alert.alert("Cancelled", "Google login cancelled");
//       }
//     } catch (error) {
//       console.log("Google login error:", error);
//       Alert.alert("Error", error.message || "Google login failed");
//     }
//   };

//   return (
//     <View>
//       <TouchableOpacity
//         onPress={handleGoogleLogin}
//         style={{
//           backgroundColor: "#4285F4",
//           padding: 12,
//           borderRadius: 8,
//           marginVertical: 10
//         }}
//       >
//         <Text
//           style={{
//             color: "#fff",
//             textAlign: "center",
//             fontWeight: "600",
//             fontSize: 16
//           }}
//         >
//           Continue with Google
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
