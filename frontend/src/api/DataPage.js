import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/data";

export const fetchData = async () => {
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

export const addItem = async (newItem) => {
  try {
    const response = await axios.post(API_URL, {
      item: newItem,
      withCredentials: true,
    });
    console.log("✅ POST response:", response);
    return response;
  } catch (error) {
    console.error("❌ Error adding item:", error);
    throw error; // Rethrow error to handle it in the component
  }
};
