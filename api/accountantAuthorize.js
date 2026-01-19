import { getAuthInfo } from "./auth";
import URI from "../assets/constants"; // Import your URI here

// Request authorization for an accountant
export const requestAuthorization = async (accountantId) => {
  try {
    const { token, userId } = getAuthInfo();

    const response = await fetch(`${URI}/accountant/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: userId,
        accountId: accountantId,
        status: "pending",
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to request authorization");
    }

    return true;
  } catch (err) {
    console.error("Authorization request failed:", err);
    throw err;
  }
};

// Remove authorization
export const removeAuthorization = async (accountantId) => {
  try {
    const { token, userId } = getAuthInfo();

    const response = await fetch(`${URI}/accountant/remove-auth`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        accountId: accountantId,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to remove authorization");
    }

    return true;
  } catch (err) {
    console.error("Deauthorization failed:", err);
    throw err;
  }
};

// Fetch authorization status
export const fetchAuthorizationStatus = async () => {
  try {
    const { token, userId } = getAuthInfo();

    const response = await fetch(`${URI}/user/accountants/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch authorization status");

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch authorization status:", err);
    throw err;
  }
};

// Fetch all accountants
export const fetchAccountants = async () => {
  try {
    const { token, userId } = getAuthInfo();

    const response = await fetch(`${URI}/user/accountants/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Unauthorized: Please login again");
      throw new Error("Failed to fetch accountants");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching accountants:", err);
    throw err;
  }
};

// Search accountant by email
export const searchAccountantByEmail = async (email) => {
  try {
    const { token } = getAuthInfo();

    const response = await fetch(
      `${URI}/user/accountant-by-email/${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 403) return null; // not found
      throw new Error("Failed to search accountant");
    }

    const data = await response.json();
    return data || {};
  } catch (error) {
    console.error("Error searching accountant:", error);
    throw error;
  }
};
