import URI from "../assets/constants";

export async function fetchTransactions(token, userId, page = 1, limit = 10) {
  try {
    const url = `${URI}/transaction?userId=${userId}&page=${page}&limit=${limit}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to fetch transactions");
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function addTransaction(data, token, userId, isFormData = false) {
  const headers = isFormData
    ? { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    : {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
  const res = await fetch(`${URI}/transaction?userId=${userId}`, {
    method: "POST",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add transaction");
  return await res.json();
}

export async function updateTransaction(data, token, userId, isFormData = false) {
  const headers = isFormData
    ? { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    : {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
  const res = await fetch(`${URI}/transaction/update?userId=${userId}`, {
    method: "POST",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to update transaction");
  }
  return await res.json();
}

export async function deleteTransaction(token, userId, transactionId) {
  try {
    const url = `${URI}/transaction?userId=${userId}&transactionId=${transactionId}`;
    
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to delete transaction");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchTransactionLogs(token, userId, transactionId, page = 1, limit = 10) {
  try {
    const url = `${URI}/transaction/transactionLog?userId=${userId}&transactionId=${transactionId}&page=${page}&limit=${limit}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error("Failed to fetch transaction logs");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}
