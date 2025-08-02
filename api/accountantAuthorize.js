import URI from "../assets/constants";
import useLoginStore from "../store/store";

export const fetchAccountants = async () => {
  const { token, id: userId } = useLoginStore.getState(); // Get userId & token from store

  try {
    const response = await fetch(`${URI}/user/accountants/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,  // Pass token for auth
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }
      throw new Error("Failed to fetch accountants");
    }

    const data = await response.json(); // Expected array of accountants
    return data;
  } catch (error) {
    console.error("Error fetching accountants:", error);
    throw error;
  }
};
