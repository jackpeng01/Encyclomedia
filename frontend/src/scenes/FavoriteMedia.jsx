import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { Box, Button, Typography, TextField } from "@mui/material";
import { FaUndo } from "react-icons/fa";
import { getUserByUsername } from "../api/users";
import { getUserByToken } from "../api/users";

const FavoriteMedia = () => {
  const { username } = useParams(); // Get the username
  const [favorites, setFavorites] = useState([]); // Store the favorite media
  const [filteredFavorites, setFilteredFavorites] = useState([]); // Filtered favorites
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const token = useSelector((state) => state.auth.token);
  const [ownProfile, setOwnProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [viewerData, setViewerData] = useState([]);
  const [forceRefresh, setForceRefresh] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch viewerData if token is present
        let fetchedViewerData = {};
        if (token) {
          fetchedViewerData = await getUserByToken(token);
        }

        // Fetch userData if username is provided
        let fetchedProfile = {};
        if (username) {
          fetchedProfile = await getUserByUsername(username);
        }

        // Ensure default values to avoid undefined properties
        fetchedViewerData.following = fetchedViewerData.following || [];
        fetchedProfile.following = fetchedProfile.following || [];

        setViewerData(fetchedViewerData);
        setUserData(fetchedProfile);

        // Reverse sort the favorites
        const reversedFavorites = (fetchedProfile.favorites || []).reverse();
        setFavorites(reversedFavorites);
        setFilteredFavorites(reversedFavorites); // Initialize filtered favorites
        console.log("Fetched favorites:", reversedFavorites);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [token, username, forceRefresh]);

  // Filter favorites by search query
  const searchFavorites = filteredFavorites.filter((entry) =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar */}
      <Navbar userData={currentUser} />

      {/* Main Content */}
      <Box sx={{ maxWidth: "900px", margin: "auto", mt: 10 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
          {username}'s Favorite Media
        </Typography>

        {/* Search bar */}
        <Box sx={{ display: "flex", justifyContent: "center", my: 3, minWidth: "400px" }}>
          <TextField
            label="Search Favorites"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: "100%", maxWidth: 400 }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {favorites.length === 0 ? (
          <Typography variant="h6" color="textSecondary" sx={{ textAlign: "center", mt: 4 }}>
            No favorite media found.
          </Typography>
        ) : searchFavorites.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
            No favorites match your search.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
            {searchFavorites.map((entry, index) => {
              const isDefaultPoster = !entry.poster; // Check if there's no poster
              return (
                <Link
                  to={`/${entry.mediaType}/${entry.id}`} // Adjust route based on media type
                  key={index}
                  style={{ textDecoration: "none" }}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  <Box
                    key={index}
                    sx={{
                      width: "160px",
                      height: "240px",
                      display: "inline-block",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={
                        isDefaultPoster
                          ? `${process.env.PUBLIC_URL}/default-poster-icon.png`
                          : entry.poster
                      }
                      alt={entry.title || "Media Poster"}
                      style={{
                        width: isDefaultPoster ? "85%" : "100%", // Smaller width for default posters
                        height: "auto", // Maintains aspect ratio
                        maxHeight: isDefaultPoster ? "85%" : "auto", // Smaller height for default posters
                        borderRadius: "5px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        cursor: "pointer",
                      }}
                    />
                    {isDefaultPoster && (
                      <Typography
                        variant="h6"
                        sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                      >
                        {entry.title || "Unknown Title"}
                      </Typography>
                    )}
                  </Box>
                </Link>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FavoriteMedia;