import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import QRCode from "react-native-qrcode-svg";

import { setup2FA,enable2FA,disable2FA } from "../api/2FA";

export default function TwoFAScreen({ is2FAEnabled, setIs2FAEnabled }) {
  const [twoFAData, setTwoFAData] = useState(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    try {
      setLoading(true);
      const data = await setup2FA();
      setTwoFAData(data);
    } catch (err) {
      Toast.show({ type: "error", text1: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    try {
      setLoading(true);
      await enable2FA(otp);
      setIs2FAEnabled(true);
      setOtp("");
      setTwoFAData(null);
      Toast.show({ type: "success", text1: "2FA enabled" });
    } catch (err) {
      Toast.show({ type: "error", text1: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      setLoading(true);
      await disable2FA(otp);
      setIs2FAEnabled(false);
      setOtp("");
      Toast.show({ type: "success", text1: "2FA disabled" });
    } catch (err) {
      Toast.show({ type: "error", text1: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
        Two-Factor Authentication
      </Text>

      {!is2FAEnabled ? (
        <>
          {!twoFAData ? (
            <TouchableOpacity onPress={handleSetup} style={styles.button}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Setup 2FA</Text>}
            </TouchableOpacity>
          ) : (
            <View style={{ alignItems: "center" }}>
              <QRCode value={twoFAData.otpauth_url} size={180} />
              <Text style={{ marginVertical: 10 }}>Enter OTP from Authenticator</Text>

              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter OTP"
              />

              <TouchableOpacity onPress={handleEnable} style={styles.greenBtn}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Enable 2FA</Text>}
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <>
          <Text style={{ color: "green", marginBottom: 10 }}>2FA is enabled</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
            placeholder="OTP to disable"
          />
          <TouchableOpacity onPress={handleDisable} style={styles.redBtn}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Disable 2FA</Text>}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = {
  button: {
    backgroundColor: "#eab308",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  greenBtn: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  redBtn: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    width: "60%",
    textAlign: "center",
  },
};
