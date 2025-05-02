import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Box, Button, Typography, TextField } from "@mui/material";
import { getUserByUsername, getUserByToken } from "../api/users";

const ListenLater = () => {
  const { username } = useParams();
  const [listenLater, setListenLater] = useState([]);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const token = useSelector((state) => state.auth.token);
  const [ownProfile, setOwnProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchListenLater = async () => {
      const fetchedProfile = await getUserByUsername(username);
      setUserData(fetchedProfile);

      if (token) {
        const profileToken = await getUserByToken(token);
        setCurrentUser(profileToken);
        if (profileToken.username === username) {
          setOwnProfile(true);
        }
      }

      try {
        const response = await axios.get("http://127.0.0.1:5000/api/music/listen_later", {
          params: { username },
        });

        setListenLater(response.data);
      } catch (error) {
        console.error("Error fetching Listen Later:", error);
        setError("Failed to load listen later.");
      }
    };

    fetchListenLater();
  }, [username, token]);

  const handleRemoveFromListenLater = async (entryId) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/music/remove",
        {
          username: username,
          entry: entryId,
          section: "listenLater"
        }
      );

      if (response.status === 200) {
        setListenLater((prev) => prev.filter((entry) => entry._id !== entryId));
      }
    } catch (error) {
      console.error("Error removing track:", error);
      alert("An error occurred while trying to remove the track.");
    }
  };

  const filteredTracks = listenLater.filter((entry) =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar userData={currentUser} />

      <Box sx={{ maxWidth: "900px", margin: "auto", mt: 10 }}>
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          {username}'s Listen Later
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <TextField
            label="Search tracks"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: "100%", maxWidth: 400 }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {error ? (
          <Typography color="error">{error}</Typography>
        ) : filteredTracks.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
            No tracks found.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
            {filteredTracks.map((entry, index) => (
              <Box key={index} sx={{ textAlign: "center", maxWidth: "160px" }}>
                <Link to={`/track/${entry.trackId}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  <img
                    src={entry.cover || `${process.env.PUBLIC_URL}/default-music-cover.png`}
                    alt={entry.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "5px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </Link>
                <Typography variant="h6" sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}>
                  {entry.title}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "gray" }}>
                  {entry.artist}
                </Typography>
                {ownProfile && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleRemoveFromListenLater(entry._id)}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ListenLater;
