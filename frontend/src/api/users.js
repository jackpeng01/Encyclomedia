import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api";

const getUsernameFromToken = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1]; // ✅ Extract payload
    const base64 = atob(base64Url.replace(/-/g, "+").replace(/_/g, "/")); // ✅ Decode Base64
    const jsonPayload = JSON.parse(base64); // ✅ Convert to JSON

    return jsonPayload.sub || jsonPayload.identity || null; // ✅ Extract username
  } catch (error) {
    console.error("❌ Error decoding JWT:", error);
    return null;
  }
};

export const getUserByToken = async (token) => {
  try {
    const username = getUsernameFromToken(token);
    console.log("getuser: ", username);
    const response = await axios.get(`${API_URL}/users/${username}`, {
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
export const getUserByUsername = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/users/${username}`, {
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
