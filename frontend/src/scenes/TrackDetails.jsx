import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { Box, Typography, Button } from "@mui/material";
import { FaStar } from "react-icons/fa";
import { getUserByToken } from "../api/users";

const TrackDetails = () => {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [error, setError] = useState("");
  const [listenDate, setListenDate] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [userData, setUserData] = useState(null);
  const [isLogged, setIsLogged] = useState(false);

  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchUserDataAndCheckLog = async () => {
      if (!token) return;
      try {
        const user = await getUserByToken(token);
        setUserData(user);

        const res = await axios.get("http://127.0.0.1:5000/api/music/log", {
          params: { username: user.username },
        });

        const alreadyLogged = res.data.some((entry) => entry.trackId === id);
        setIsLogged(alreadyLogged);
      } catch (err) {
        console.error("Error loading user or checking music log:", err);
      }
    };

    fetchUserDataAndCheckLog();
  }, [token, id]);

  useEffect(() => {
    const fetchTrackDetails = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/api/music/track/${id}`
        );
        setTrack(response.data);
        setRating(0);
        setHover(0);
      } catch (err) {
        console.error("Failed to load track details:", err);
        setError("Failed to load track details.");
      }
    };

    fetchTrackDetails();

    const today = new Date().toISOString().split("T")[0];
    setListenDate(today);
  }, [id]);

  const handleLogTrack = async () => {
    if (!userData) {
      alert("Please login to log tracks.");
      return;
    }

    const payload = {
      username: userData.username,
      title: track.title,
      artist: track.artist?.name || "Unknown Artist",
      cover: track.album?.cover_medium || null,
      listen_date: listenDate,
      rating: rating,
    };

    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/music/log/${track.id}`,
        payload
      );
      setIsLogged(true);
    } catch (error) {
      console.error("Error logging track:", error);
    }
  };

  const handleSaveForLater = () => {
   // alert("Track added to Listen Later (placeholder action)");
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!track) return <p>Loading track details...</p>;

  return (
    <Box sx={{ paddingTop: 10, paddingX: 5 }}>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
          gap: 4,
          backgroundColor: "#fff",
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Box sx={{ flex: 2 }}>
          <Box sx={{ display: "flex", gap: 4 }}>
            <img
              src={track.album.cover_big}
              alt={track.title}
              style={{ width: "300px", borderRadius: "10px" }}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6">Log/Save</Typography>

              <label>
                <strong>Date Listened: </strong>
                <input
                  type="date"
                  value={listenDate}
                  onChange={(e) => setListenDate(e.target.value)}
                  style={{ marginLeft: "0.5rem", padding: "0.25rem" }}
                />
              </label>

              <Box sx={{ display: "flex", gap: 1 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={24}
                    color={star <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Box>

              <Button
                variant="contained"
                onClick={handleLogTrack}
                disabled={isLogged}
              >
                {isLogged ? "Already Logged" : "Log Track"}
              </Button>
              <Button variant="contained" color="primary" onClick={handleSaveForLater}>
                Add to Listen Later
              </Button>
            </Box>
          </Box>

          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h4" gutterBottom>
              {track.title}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Artist: {track.artist.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Album: {track.album.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Duration: {Math.floor(track.duration / 60)}:
              {("0" + (track.duration % 60)).slice(-2)} minutes
            </Typography>
            <Typography variant="body1" gutterBottom>
              Release Date: {track.release_date || "Unknown"}
            </Typography>
            <Box sx={{ marginTop: 2 }}>
              <audio controls src={track.preview}>
                Your browser does not support the audio element.
              </audio>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TrackDetails;
