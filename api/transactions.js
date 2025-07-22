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