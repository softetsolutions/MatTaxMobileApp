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

export async function addAccount(accountNo, token, userId) {
  const res = await fetch(`${URI}/accountNo/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ accountNo, userId }),
  });
  if (!res.ok) throw new Error("Failed to create account");
  return await res.json();
}

export async function updateAccount(id, accountNo, token) {
  const res = await fetch(`${URI}/accountNo/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ accountNo }),
  });
  if (!res.ok) throw new Error("Failed to update account");
  return await res.json();
} 