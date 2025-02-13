import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/users";

export const getUser = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });
    console.log("✅ Fetched Data:", response.data);
    return response.data; // Return fetched data
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    return []; // Return empty array on error
  }
};

export const addUser = async (newUser) => {
  try {
    const response = await axios.post(API_URL, {
      ...newUser,
      withCredentials: true,
    });
    console.log("✅ POST response:", response);
    return response;
  } catch (error) {
    console.error("❌ Error adding item:", error);
    throw error; // Rethrow error to handle it in the component
  }
};

export const checkUsernameUnique = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/check-username`, {
      params: { username },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });
    return response.data.isUnique;
  } catch (error) {
    console.error("❌ Error checking username:", error);
    return false;
  }
};

export const getUserByUsername = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/${username}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    return null;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      headers: {
        "Content-Type": "application/json",
      },
      email: email,
      password: password,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error logging in:", error);
    throw error;
  }
};
