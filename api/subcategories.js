import URI from "../assets/constants";

export async function fetchSubcategories(token, categoryId) {
  const res = await fetch(`${URI}/subcategory/getall/${categoryId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  return await res.json();
}

export async function getSubcategoryById(token, subcategoryId, categoryId) {
  const res = await fetch(`${URI}/subcategory/getbyId?id=${subcategoryId}&categoryId=${categoryId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch subcategory");
  return await res.json();
} 