import { useState,useRef,useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReCaptcha from "react-native-recaptcha-that-works";
import { facebookLoginApi } from "../api/user";
import * as Google from "expo-auth-session/providers/google";

import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";


import { Alert } from "react-native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  CheckBox,
  ScrollView,
  Image,
} from "react-native";
import URI from "../assets/constants";
import  {jwtDecode}  from "jwt-decode";
import useLoginStore from "../store/store";
import { useNavigation } from "@react-navigation/native";

WebBrowser.maybeCompleteAuthSession();


export default function LoginSignup() {
  const navigation = useNavigation();

  const captchaRef = useRef(); 
  const [isLogin, setIsLogin] = useState(true);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const setLoginDetails = useLoginStore((state) => state.setLoginDetails);
  const RECAPTCHA_BASE_URL = "http://mattaxpro.com";
 const RECAPTCHA_SITE_KEY ="6LeKJyUsAAAAAKlrBQOwvz3EBvpMVFENFyhn7Oi0"

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

const FB_APP_ID = "YOUR_FACEBOOK_APP_ID";

const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true, // REQUIRED for Expo
});



const loginWithFacebook = async () => {
  try {
    const authUrl =
      `https://www.facebook.com/v18.0/dialog/oauth` +
      `?client_id=${FB_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=email,public_profile`;

    const result = await AuthSession.startAsync({ authUrl });

    if (result.type !== "success") return;

    const accessToken = result.params.access_token;

    const data = await facebookLoginApi(accessToken);

    // 🔐 2FA case
    if (data.requires2FA) {
      navigation.navigate("TwoFA", { tempToken: data.tempToken });
      return;
    }

    // 🔹 Normal login
    await AsyncStorage.setItem("token", data.token);

    const decoded = jwtDecode(data.token);
    setLoginDetails(true, data.token, decoded.id);

    navigation.navigate("Dashboard");
  } catch (err) {
    console.log("Facebook login error:", err.message);
    Alert.alert("Error", err.message || "Facebook login failed");
  }
};


  const [request, response, promptAsync] = Google.useAuthRequest({
  androidClientId:
    "247744549414-oasr41glaf951c9i940t3qigec96o7h7.apps.googleusercontent.com",

  // keep your existing WEB client id here
  webClientId:
    "397175923929-mc6usvrc0mbq4n1u2ksmshd1eqscc1sj.apps.googleusercontent.com",

  scopes: ["profile", "email"],
});

  
 useEffect(() => {
  if (response?.type === "success") {
    const accessToken = response.authentication.accessToken;

    fetch(`${URI}/auth/google-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ accessToken }),
    })
      .then(res => res.json())
      .then(async data => {
        await AsyncStorage.setItem("userToken", data.data);
        Alert.alert("Success", "Google login successful!");
        navigation.navigate("Dashboard");
      })
      .catch(err => {
        console.log(err);
        Alert.alert("Error", "Google login failed");
      });
  }
}, [response]);

  
  const handleGoogleLogin = () => {
  promptAsync();
};

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const onVerify = (token) => {
    setRecaptchaToken(token);
    console.log("Recaptcha token:", token);
  };

  
  
  const handleSubmit = async () => {
    console.log("handleSubmit called")
    if (!recaptchaToken) {
       console.log("No reCAPTCHA token yet");
      alert("Please complete reCAPTCHA");
      return;
    }

    try {
      setLoader(true);

      const bodyData = {
        email: form.email,
        password: form.password,
        recaptchaToken,
      };
      console.log("Sending login request:", bodyData);

      const res = await fetch(`${URI}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      if (data.requires2FA) {
        await AsyncStorage.setItem("tempToken", data.tempToken); 
  console.log("2FA required! Temp token:", data.tempToken);
  navigation.navigate("Verify2FA");//, { tempToken: data.tempToken }
  return;
}

const token = data.data || data.token;
console.log("Login token:", token);
      if (!token) throw new Error("Invalid login response");

      await AsyncStorage.setItem("token", token);
      const storedToken = await AsyncStorage.getItem("token");
console.log("Stored token in AsyncStorage:", storedToken);
      let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (decodeErr) {
      console.error("JWT decode failed", decodeErr);
      await AsyncStorage.removeItem("token");
      Alert.alert("Session error", "Please login again");
      return;
    }
      setLoginDetails(true, token, decoded.id);

      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (e) {
      console.log("Login Error →", e.message);
      Alert.alert("Error", e.message);
    } finally {
      setLoader(false);
      captchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  // ✅ SIGNUP
  const handleSignup = async () => {
    if (!recaptchaToken) {
      alert("Please complete reCAPTCHA");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoader(true);

      const signupBody = {
        fname: form.firstName,
        lname: form.lastName,
        email: form.email,
        password: form.password,
        role: "user",
        recaptchaToken,
      };

      const uri = `${URI}/auth/register`;

      let res = await fetch(uri, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupBody),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error signing up");
      }

      const user = await res.json();
      alert(user.message);

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setIsLogin(true);
    } catch (e) {
      console.log("Signup Error →", e.message);
      Alert.alert("Error", e.message || "Something went wrong");
    } finally {
      setLoader(false);
      captchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ReCaptcha
  ref={captchaRef}
  siteKey={RECAPTCHA_SITE_KEY}
  baseUrl={RECAPTCHA_BASE_URL}
  onVerify={onVerify}
   onError={(err) => console.log("Captcha error:", err)}
  onLoad={() => console.log("Captcha loaded")}
  size="normal" // better for mobile
/>

      <View style={styles.card}>
        <View style={styles.cardTopBorder} />

        {isLogin ? (
          <>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subText}>Log in to manage your invoices</Text>

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              autoCapitalize="none"
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#888"
              value={form.email}
              onChangeText={(val) => handleChange("email", val)}
            />

          <View style={styles.rowBetween}>
  <Text style={styles.label}>Password</Text>
  <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
    <Text style={styles.forgot}>Forgot Password?</Text>
  </TouchableOpacity>
</View>

            <TextInput
              autoCapitalize="none"
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
              value={form.password}
              onChangeText={(val) => handleChange("password", val)}
            />

            {/* <View style={styles.rememberRow}>
              <CheckBox value={rememberMe} onValueChange={setRememberMe} />
              <Text style={styles.rememberText}>Remember me</Text>
            </View> */}

            {/* <View style={styles.captchaBox}>
              <Text style={styles.captchaText}>I'm not a robot</Text>
            </View> */}
           

          <TouchableOpacity
  style={styles.captchaBox}
  onPress={() => {
    if (captchaRef.current && captchaRef.current.open) {
      captchaRef.current.open();
    } else {
      console.warn("Captcha not ready");
    }
  }}
>
  <Text style={styles.captchaText}>I'm not a robot</Text>
  <View style={[
    styles.checkboxFake,
    { backgroundColor: recaptchaToken ? "#f9c100" : "transparent" }
  ]}/>
</TouchableOpacity>



            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>
                {loader ? <Text>Signing..</Text> : <Text>Sign In</Text>}
              </Text>
            </TouchableOpacity>

            <View style={styles.separator}>
              <View style={styles.line} />
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialRow}>
             <TouchableOpacity  style={styles.socialBtn} onPress={handleGoogleLogin}
        >
  <Image
    source={require("../assets/googleIcon.png")}
    style={{ width: 20, height: 20 }}
    resizeMode="contain"
  />
</TouchableOpacity>

              <View style={styles.socialBtn}>
                <Image
                  source={require("../assets/appleIcon.png")}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
              </View>
             <TouchableOpacity
  style={styles.socialBtn}
  onPress={loginWithFacebook}
>
  <Image
    source={require("../assets/facebookIcon.png")}
    style={{ width: 20, height: 20 }}
    resizeMode="contain"
  />
</TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setIsLogin(false)}>
              <Text style={styles.footerText}>
                Don’t have an account? <Text style={styles.link}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => setIsLogin(true)}>
              <Text style={styles.backLink}>← Back to login</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Create user Account</Text>
            <Text style={styles.subText}>
              Fill in your details to get started
            </Text>

            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#888"
              value={form.firstName}
              onChangeText={(val) => handleChange("firstName", val)}
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#888"
              value={form.lastName}
              onChangeText={(val) => handleChange("lastName", val)}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="user@example.com"
              placeholderTextColor="#888"
              value={form.email}
              onChangeText={(val) => handleChange("email", val)}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
              value={form.password}
              onChangeText={(val) => handleChange("password", val)}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#888"
              secureTextEntry
              value={form.confirmPassword}
              onChangeText={(val) => handleChange("confirmPassword", val)}
            />
           


           <TouchableOpacity
  style={styles.captchaBox}
  onPress={() => {
    if (captchaRef.current && captchaRef.current.open) {
      captchaRef.current.open();
    } else {
      console.warn("Captcha not ready");
    }
  }}
>
  <Text style={styles.captchaText}>I'm not a robot</Text>
  <View style={[
    styles.checkboxFake,
    { backgroundColor: recaptchaToken ? "#f9c100" : "transparent" }
  ]}/>
</TouchableOpacity>



            <Text style={styles.terms}>
              By registering for this service, you agree to our{" "}
              <Text style={styles.link}>Terms & Conditions</Text> and{" "}
              <Text style={styles.link}>Privacy Policy</Text>.
            </Text>

            {/* <TouchableOpacity style={styles.submitBtn} onPress={handleSignup}>
              <Text style={styles.submitText}>Sign Up</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
  style={[
    styles.submitBtn,
    loader && styles.submitBtnDisabled
  ]}
  onPress={handleSignup}
  disabled={loader}
  activeOpacity={0.8}
>
  <Text style={styles.submitText}>
    {loader ? "Signing up..." : "Sign Up"}
  </Text>
</TouchableOpacity>

          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 380,
  },
  cardTopBorder: {
    height: 4,
    backgroundColor: "#f90",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: -24,
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  subText: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 24,
  },
  submitBtnDisabled: {
  opacity: 0.6,
},

  label: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#2c2c2e",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgot: {
    color: "#f9c100",
    fontSize: 12,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rememberText: {
    color: "#ccc",
    marginLeft: 8,
  },
  captchaBox: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  captchaText: {
    color: "#fff",
  },
  checkboxFake: {
  width: 20,
  height: 20,
  borderWidth: 2,
  borderColor: "#fff",
  borderRadius: 4,
  marginTop: 8,
},
  submitBtn: {
    backgroundColor: "#f9c100",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  submitText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  orText: {
    color: "#999",
    marginHorizontal: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#444",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  socialBtn: {
    flex: 1,
    backgroundColor: "#2c2c2e",
    padding: 14,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  footerText: {
    color: "#aaa",
    textAlign: "center",
  },
  link: {
    color: "#f9c100",
    fontWeight: "bold",
  },
  terms: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginBottom: 16,
  },
  backLink: {
    color: "#ccc",
    marginBottom: 12,
  },
});
