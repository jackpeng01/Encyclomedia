import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Box, Button, Typography, TextField } from "@mui/material";
import { getUserByUsername, getUserByToken } from "../api/users";
import { FaStar } from "react-icons/fa";

const MusicLog = () => {
  const { username } = useParams();
  const [musicLog, setMusicLog] = useState([]);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const token = useSelector((state) => state.auth.token);
  const [ownProfile, setOwnProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMusicLog = async () => {
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
        const response = await axios.get("http://127.0.0.1:5000/api/music/log", {
          params: { username },
        });

        setMusicLog(response.data);
      } catch (error) {
        console.error("Error fetching Music Log:", error);
        setError("Failed to load music log.");
      }
    };

    fetchMusicLog();
  }, [username, token]);

  const handleRemoveFromMusicLog = async (entryId) => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/music/remove", {
        username: username,
        entry: entryId,
        section: "musicLog",
      });

      if (response.status === 200) {
        setMusicLog((prev) => prev.filter((entry) => entry._id !== entryId));
      }
    } catch (error) {
      console.error("Error removing track:", error);
      alert("An error occurred while trying to remove the track.");
    }
  };

  const filteredTracks = musicLog.filter((entry) =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar userData={currentUser} />

      <Box sx={{ maxWidth: "900px", margin: "auto", mt: 10 }}>
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          {username}'s Music Log
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
              <Box
                key={index}
                sx={{
                  width: "160px",
                  height: "240px",
                  position: "relative",
                  textAlign: "center",
                  borderRadius: "8px",
                  overflow: "hidden",
                  "&:hover .overlay": {
                    display: "flex",
                  },
                }}
              >
                <Link
                  to={`/track/${entry.trackId}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
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
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                  >
                    {entry.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "0.75rem", color: "gray" }}
                  >
                    {entry.artist}
                  </Typography>
                </Link>

                {/* Hover Overlay */}
                <Box
                  className="overlay"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "none",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    padding: 2,
                    borderRadius: "8px",
                    textAlign: "center",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", gap: "0.2rem", justifyContent: "center" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={20}
                        color={
                          star <= (entry.rating || 0) ? "#ffc107" : "#e4e5e9"
                        }
                      />
                    ))}
                  </Box>
                  <Typography>
                    {entry.listenDate
                      ? `Listened on: ${entry.listenDate}`
                      : "No Listen Date"}
                  </Typography>
                  {ownProfile && (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveFromMusicLog(entry._id)}
                      sx={{ mt: 1 }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MusicLog;
