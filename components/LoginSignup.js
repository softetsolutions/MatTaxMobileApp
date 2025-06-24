import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { jwtDecode } from "jwt-decode";
import useLoginStore from "../store/store";

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const setLoginDetails = useLoginStore((state) => state.setLoginDetails);

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoader(true);
      const uri = `${URI}/auth/${isLogin ? "login" : "register"}`;
      let res = await fetch(uri, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isLogin ? { email: form.email, password: form.password } : form
        ),
      });
      res = await res.json();
      await AsyncStorage.setItem("token", res.data);
      const decodedTokenValue = jwtDecode(res?.data) || "";
      console.log("decodedTokenValue", decodedTokenValue);
      setLoginDetails(true, res.data, decodedTokenValue.id);
    } catch (e) {
      setError(e.message);
      console.error("message", e.message);
    } finally {
      setLoader(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
              <TouchableOpacity>
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

            <View style={styles.captchaBox}>
              <Text style={styles.captchaText}>I'm not a robot</Text>
            </View>

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
              <View style={styles.socialBtn}>
                <Image
                  source={require("../assets/googleIcon.png")}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.socialBtn}>
                <Image
                  source={require("../assets/appleIcon.png")}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.socialBtn}>
                <Image
                  source={require("../assets/facebookIcon.png")}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
              </View>
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

            <View style={styles.captchaBox}>
              <Text style={styles.captchaText}>I'm not a robot</Text>
            </View>

            <Text style={styles.terms}>
              By registering for this service, you agree to our{" "}
              <Text style={styles.link}>Terms & Conditions</Text> and{" "}
              <Text style={styles.link}>Privacy Policy</Text>.
            </Text>

            <TouchableOpacity style={styles.submitBtn}>
              <Text style={styles.submitText}>Sign Up</Text>
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
