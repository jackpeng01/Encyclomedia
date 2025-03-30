import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api";

export const addUser = async (newUser) => {
  try {
    const response = await axios.post(`${API_URL}/users`, {
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
    const response = await axios.get(`${API_URL}/users/check-username`, {
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


export const checkEmailUnique = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/users/check-email`, {
      params: { email: email },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });
    return response.data.isUnique;
  } catch (error) {
    console.error("❌ Error checking email:", error);
    return false;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      headers: {
        "Content-Type": "application/json",
      },
      email: email,
      password: password,
      withCredentials: true,
    });
    console.log("✅ Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error logging in:", error);
    throw error;
  }
};


