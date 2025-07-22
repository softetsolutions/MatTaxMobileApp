import URI from "../assets/constants";

export async function getReceiptById(token, receiptId) {
  const res = await fetch(`${URI}/receipt/getbyId/${receiptId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch receipt");
  return await res.json();
} 