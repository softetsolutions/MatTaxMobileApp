import URI from "../assets/constants";
import useLoginStore from "../store/store";

export const fetchUserDetails = async (token,userId) => {
    try {
     
      const response = await fetch(`${URI}/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }), // If token exists
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user details");
      }
  
      const data = await response.json();
      return {
        firstName: data.fname,
        lastName: data.lname,
        email: data.email,
        phone: data.phone,
        addressLine1: data.address_line1,
        city: data.city,
        postcode: data.postcode,
        country: data.country,
      };
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  };
  
  // 🔹 Update user details
  export const updateUserDetails = async (token, userId,userData) => {
    try {
      
      const response = await fetch(`${URI}/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }), // If token exists
        },
        body: JSON.stringify({
          fname: userData.firstName,
          lname: userData.lastName,
          phone: userData.phone,
          address_line1: userData.addressLine1,
          city: userData.city,
          postcode: userData.postcode,
          country: userData.country,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user details");
      }
  
      const data = await response.json();
      return {
        firstName: data.fname,
        lastName: data.lname,
        email: data.email,
        phone: data.phone,
        addressLine1: data.address_line1,
        city: data.city,
        postcode: data.postcode,
        country: data.country,
      };
    } catch (error) {
      console.error("Error updating user details:", error);
      throw error;
    }
  };
  export const sendDeleteEmail = async (token, email) => {
    try {
      const response = await fetch(`${URI}/user/sendmail-for-delete-user`, {
        method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify({ email }),
    });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send deletion email");
  
      return data;
    } catch (error) {
      console.error("Error sending delete email:", error);
      throw error;
    }
  };