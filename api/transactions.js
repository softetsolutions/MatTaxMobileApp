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
  console.log("Sending transaction data:", data);
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
