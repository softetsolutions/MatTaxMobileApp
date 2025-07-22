import URI from "../assets/constants";

export async function fetchVendors(token, userId) {
  const res = await fetch(`${URI}/vendor/gets?userId=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch vendors");
  return await res.json();
}

export async function getVendorById(token, vendorId) {
  const res = await fetch(`${URI}/vendor/getbyId/${vendorId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch vendor");
  return await res.json();
} 