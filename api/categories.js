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