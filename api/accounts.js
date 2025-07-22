import URI from "../assets/constants";

export async function fetchAccounts(token, userId) {
  const res = await fetch(`${URI}/accountNo/gets?userId=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return await res.json();
}

export async function getAccountById(token, accountId) {
  const res = await fetch(`${URI}/accountNo/getbyId/${accountId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch account");
  return await res.json();
} 