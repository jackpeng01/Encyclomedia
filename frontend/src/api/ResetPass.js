import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api";

export const resetPasswordRequest = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/reset-password-request`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        email: email,
        withCredentials: true,
      }
    );
    console.log("✅ reset password response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error resetting :", error);
    throw error;
  }
};

export const resetPassword = async (username, newPassword) => {
  try {
    await axios.post(
      `${API_URL}/auth/reset-password/${username}`,
      {
        newPassword: newPassword,
        headers: {
          // Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
  }
};
