import URI from "../assets/constants";

export async function fetchCategories(token, userId) {
  const res = await fetch(`${URI}/category/gets?userId=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return await res.json();
}

export async function addCategory(name, token, userId) {
  const res = await fetch(`${URI}/category/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name, userId }),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return await res.json();
}

export async function updateCategory(id, name, token) {
  const res = await fetch(`${URI}/category/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to update category");
  return await res.json();
} 