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

export async function fetchSubcategoriesByCategoryId(categoryId, token) {
  try {
    const response = await fetch(`${URI}/subcategory/getall/${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch subcategories');
    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function addSubcategory(name, categoryId, token) {
  const res = await fetch(`${URI}/subcategory/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name, categoryId }),
  });
  if (!res.ok) throw new Error("Failed to create subcategory");
  return await res.json();
}

export async function updateSubcategory(id, name, categoryId, token) {
  const res = await fetch(`${URI}/subcategory/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name, categoryId }),
  });
  if (!res.ok) throw new Error("Failed to update subcategory");
  return await res.json();
} 