import URI from "../assets/constants";

export async function getReceiptById(token, receiptId) {
  const res = await fetch(`${URI}/receipt/${receiptId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch receipt");
  return await res.json();
}

export async function extractReceiptData(file, token) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${URI}/receipt/extraction`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to extract receipt data");
  return await res.json();
}
