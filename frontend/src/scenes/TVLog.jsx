import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { Box, Button, Typography, IconButton, Slider, TextField } from "@mui/material";
import { FaArrowUp, FaArrowDown, FaEquals, FaStar, FaUndo } from "react-icons/fa";
import { getUserByUsername } from "../api/users";
import { getUserByToken } from "../api/users";

const TVLog = () => {
    const { username } = useParams(); // Get the username
    const [tvLog, setTvLog] = useState([]); // Store the logs
    const [sortedTvLog, setSortedTvLog] = useState([]); // Sorted log
    const [filteredTvLog, setFilteredTvLog] = useState([]); // Filtered log
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState("");
    const [sortOrder, setSortOrder] = useState("default"); // Sorting order
    const [ratingRange, setRatingRange] = useState([0, 5]); // Current rating range filter
    const token = useSelector((state) => state.auth.token);
    const [ownProfile, setOwnProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");         

    useEffect(() => {
        const fetchLogs = async () => {
            const fetchedProfile = await getUserByUsername(username);
            setUserData(fetchedProfile);

            if (token) {
                const profileToken = await getUserByToken(token);
                setCurrentUser(profileToken);
                if (username && profileToken.username == username) {
                    setOwnProfile(true);
                }
            }

            try {
                const response = await axios.get("http://127.0.0.1:5000/api/tv/log", {
                    params: { username },
                });

                setTvLog(response.data); 
                setSortedTvLog(response.data); 
                setFilteredTvLog(response.data); 
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching TV logs:", error);
            }
        };

        fetchLogs();
    }, [token]);

    // Handle sorting changes
    const handleSortChange = () => {
        let nextSortOrder;
        if (sortOrder === "default") {
            nextSortOrder = "highToLow";
        } else if (sortOrder === "highToLow") {
            nextSortOrder = "lowToHigh";
        } else {
            nextSortOrder = "default";
        }

        setSortOrder(nextSortOrder);

        if (nextSortOrder === "highToLow") {
            setSortedTvLog([...filteredTvLog].sort((a, b) => b.rating - a.rating));
        } else if (nextSortOrder === "lowToHigh") {
            setSortedTvLog([...filteredTvLog].sort((a, b) => a.rating - b.rating));
        } else {
            setSortedTvLog(filteredTvLog); // Reset to the filtered list
        }
    };

    // Handle filtering by rating range
    const handleRatingRangeChange = (event, newRange) => {
        setRatingRange(newRange);
        const filtered = tvLog.filter(
            (entry) => entry.rating >= newRange[0] && entry.rating <= newRange[1]
        );
        setFilteredTvLog(filtered);
        setSortedTvLog(filtered);
    };

    // Handle reset filter and sort
    const handleReset = () => {
        setSortOrder("default");
        setRatingRange([0, 5]);
        setFilteredTvLog(tvLog); // Reset filtered movies to all movies
        setSortedTvLog(tvLog); // Reset sorted movies to all movies
    };

    const handleRemove = async (section, entryId) => {
        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/api/tv/remove",
                {
                    username: username,
                    entry: entryId,
                    section: section,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                // Update the state to remove the entry locally
                const updatedMovieLog = tvLog.filter((entry) => entry._id !== entryId);
                setTvLog(updatedMovieLog);
                setFilteredTvLog(updatedMovieLog);
                setSortedTvLog(updatedMovieLog);

                // alert("Successfully removed!");
            } else {
                throw new Error("Failed to remove the entry.");
            }
        } catch (error) {
            console.error("Error removing the entry:", error);
            alert("An error occurred while trying to remove the entry.");
        }
    };

    // Filter tv by search query
    const searchTvShows = sortedTvLog.filter((entry) =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Navbar */}
            <Navbar userData={currentUser} />

            {/* Main Content */}
            <Box sx={{ maxWidth: "900px", margin: "auto", mt: 10 }}>
                <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
                    {username}'s TV Log
                </Typography>
                {/* Search bar */}
                <Box sx={{ display: "flex", justifyContent: "center", my: 3, minWidth: "400px" }}>
                    <TextField
                        label="Search TV shows"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ width: "100%", maxWidth: 400 }}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>

                {/* Sort, Filter, and Reset Buttons */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4, alignItems: "center" }}>
                    {/* Sort Button */}
                    <Button
                        variant="contained"
                        onClick={handleSortChange}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                        {sortOrder === "default" && <FaEquals />}
                        {sortOrder === "highToLow" && <FaArrowDown />}
                        {sortOrder === "lowToHigh" && <FaArrowUp />}
                        Sort by Rating
                    </Button>

                    {/* Rating Range Filter */}
                    <Box sx={{ width: "300px", textAlign: "center" }}>
                        <Typography variant="subtitle1">Filter by Rating Range:</Typography>
                        <Slider
                            value={ratingRange}
                            onChange={handleRatingRangeChange}
                            valueLabelDisplay="auto"
                            min={0}
                            max={5}
                            marks={[
                                { value: 0, label: "0" },
                                { value: 1, label: "1" },
                                { value: 2, label: "2" },
                                { value: 3, label: "3" },
                                { value: 4, label: "4" },
                                { value: 5, label: "5" },
                            ]}
                            sx={{ mt: 2 }}
                        />
                        <Typography variant="body2">
                            Showing TV shows with ratings from {ratingRange[0]} to {ratingRange[1]}
                        </Typography>
                    </Box>

                    {/* Reset Button */}
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleReset}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                        <FaUndo />
                    </Button>
                </Box>

                {sortedTvLog.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" sx={{ textAlign: "center", mt: 4 }}>
                        No shows found in your TV log.
                    </Typography>
                ) : searchTvShows.length === 0 ? (
                    <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
                        No shows found.
                    </Typography>
                ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                        {searchTvShows.map((entry, index) => {
                            const isDefaultPoster = !entry.poster; // Check if there's no poster
                            return (
                                <Link
                                    to={`/tv/${entry.tvId}`} 
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
                                            position: "relative", // Required for hover effect
                                            "&:hover .overlay": {
                                                display: "flex", // Show the overlay content on hover
                                            },
                                        }}
                                        onClick={(e) => e.stopPropagation()} // Prevent link redirection when clicking specific buttons
                                    >
                                        <img
                                            src={isDefaultPoster ? `${process.env.PUBLIC_URL}/default-poster-icon.png` : entry.poster}
                                            alt={entry.title || "Movie Poster"}
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
                                            <Typography variant="h6" sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}>
                                                {entry.title || "Unknown Title"}
                                            </Typography>
                                        )}

                                        {/* Hover Overlay */}
                                        <Box
                                            className="overlay"
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                display: "none", // Initially hidden
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark background for better visibility
                                                color: "white",
                                                padding: 2,
                                                borderRadius: "8px",
                                                textAlign: "center",
                                                fontSize: "0.9rem",
                                                fontWeight: 500,
                                                gap: 1,
                                            }}
                                        >
                                            {/* Display Rating */}
                                            <Box sx={{ display: "flex", gap: "0.2rem", justifyContent: "center" }}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FaStar
                                                        key={star}
                                                        size={20}
                                                        color={star <= (entry.rating || 0) ? "#ffc107" : "#e4e5e9"}
                                                    />
                                                ))}
                                            </Box>

                                            {/* Watch Date */}
                                            <Typography>
                                                {entry.watchDate ? `Watched on: ${entry.watchDate}` : "No Watch Date"}
                                            </Typography>

                                            {/* Tags */}
                                            {entry.tags && entry.tags.length > 0 && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                                        Tags:
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            gap: 0.5,
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        {entry.tags.map((tag, idx) => (
                                                            <Typography
                                                                key={idx}
                                                                sx={{
                                                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                                                    padding: "2px 6px",
                                                                    borderRadius: "12px",
                                                                    fontSize: "0.75rem",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {tag}
                                                            </Typography>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Remove Button */}
                                            {ownProfile && (
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleRemove("tvLog", entry._id);
                                                        console.log("Remove TV:", entry.tvId);
                                                    }}
                                                    sx={{ mt: 1 }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </Box>
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

export default TVLog;
