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

export async function addVendor(name, token, userId) {
  const res = await fetch(`${URI}/vendor/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name, userId }),
  });
  if (!res.ok) throw new Error("Failed to create vendor");
  return await res.json();
}

export async function updateVendor(id, name, token) {
  const res = await fetch(`${URI}/vendor/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to update vendor");
  return await res.json();
} 