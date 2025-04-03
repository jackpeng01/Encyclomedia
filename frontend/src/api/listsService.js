import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/lists";

export const getLists = async (token) => {
  console.log(token);
  try {
    const response = await axios.get(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        // Accept: "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching lists:", error);
    throw error;
  }
};

export const getList = async (listId) => {
  try {
    const response = await axios.get(`${API_URL}/${listId}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching list ${listId}:`, error);
    throw error;
  }
};

export const createList = async (newList, token) => {
  try {
    const response = await axios.post(`${API_URL}`, newList, {
      headers: {
        Authorization: `Bearer ${token}`,

        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error creating list:", error);
    throw error;
  }
};

export const updateList = async (listId, updatedList, token) => {
  try {
    const response = await axios.put(`${API_URL}/${listId}`, updatedList, {
      headers: {
        Authorization: `Bearer ${token}`,

        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating list ${listId}:`, error);
    throw error;
  }
};

export const deleteList = async (listId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${listId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        // Accept: "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error deleting list ${listId}:`, error);
    throw error;
  }
};

// Function to migrate from localStorage to server
export const migrateLocalLists = async () => {
  try {
    // Get lists from localStorage
    const localLists = JSON.parse(localStorage.getItem("lists") || "[]");

    if (localLists.length === 0) {
      return { migrated: 0 };
    }

    // Create each list on the server
    const results = [];
    for (const list of localLists) {
      // Convert local format to server format
      const serverList = {
        name: list.name,
        description: list.description || "",
        items: list.items || [],
      };

      const createdList = await createList(serverList);
      results.push(createdList);
    }

    // After successful migration, can clear localStorage
    localStorage.removeItem("lists");

    return { migrated: results.length, lists: results };
  } catch (error) {
    console.error("❌ Error migrating lists:", error);
    throw error;
  }
};

export const getPublicLists = async () => {
  try {
    const response = await axios.get(`${API_URL.replace('/lists', '/public-lists')}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching public lists:", error);
    throw error;
  }
};

export const followList = async (listId, token) => {
  try {
    const response = await axios.post(`${API_URL}/${listId}/follow`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error following list ${listId}:`, error);
    throw error;
  }
};

export const unfollowList = async (listId, token) => {
  try {
    const response = await axios.post(`${API_URL}/${listId}/unfollow`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error unfollowing list ${listId}:`, error);
    throw error;
  }
};

export const getFollowedLists = async (token) => {
  try {
    const response = await axios.get(`${API_URL.replace('/lists', '/users/followed-lists')}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching followed lists:", error);
    throw error;
  }
};