import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthInfo } from "./auth";

const BASE_URL = "http://10.144.141.218:5005";

const handleResponse = async (res) => {
  const text = await res.text(); // read as raw text
  let data;

  try {
    data = JSON.parse(text); // try parse JSON
  } catch (err) {
    console.error("Non-JSON response from server:", text);
    throw new Error(text || "Unexpected server response");
  }

  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};


export const setup2FA = async () => {
  const auth = getAuthInfo();
  if (!auth?.token) throw new Error("User not logged in");

  const res = await fetch(`${BASE_URL}/auth/2fa/setup`, {
    headers: { 
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(res);
};

export const enable2FA = async (otp) => {
  const auth = getAuthInfo();
  if (!auth?.token) throw new Error("User not logged in");

  const res = await fetch(`${BASE_URL}/auth/2fa/enable`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({ token: otp }),
  });
  return handleResponse(res);
};

export const disable2FA = async (otp) => {
  const auth = getAuthInfo();
  if (!auth?.token) throw new Error("User not logged in");

  const res = await fetch(`${BASE_URL}/auth/2fa/disable`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify({ token: otp }),
  });
  return handleResponse(res);
};
export const verify2FALogin = async (tempToken, otp) => {
  const res = await fetch(`${BASE_URL}/auth/login/verify-2fa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tempToken, // include it in body
      token: otp, // OTP
    }),
  });

  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.message || "2FA verification failed");
    return data; // { data: authToken }
  } catch (err) {
    console.log("Non-JSON 2FA response:", text);
    throw new Error("2FA verification failed or token expired");
  }
};
