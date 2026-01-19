import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScreen from "../pages/MainScreen";
import LoginSignup from "../components/LoginSignup";
import ForgotPasswordScreen from "../pages/ForgotPassword";
import ConfirmDeleteAccountScreen from "../pages/ConfirmationPage";
import VerifyTwoFAScreen from "../pages/verifyTwoFAScreen";


const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Login" component={LoginSignup} />
      <Stack.Screen name="Verify2FA" component={VerifyTwoFAScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> 
      <Stack.Screen name="ConfirmDeleteAccount" component={ConfirmDeleteAccountScreen} />

    </Stack.Navigator>
  );
}
