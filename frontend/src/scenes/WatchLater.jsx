import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Box, Button, Typography, TextField } from "@mui/material";
import { FaStar } from "react-icons/fa";
import { getUserByUsername } from "../api/users";
import { getUserByToken } from "../api/users";

const WatchLater = () => {
    const { username } = useParams(); // Get the username from the route
    const [watchLater, setWatchLater] = useState([]); // Store the movie logs
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState("");
    const token = useSelector((state) => state.auth.token);
    const [ownProfile, setOwnProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");             

    useEffect(() => {
        // Fetch all movie logs on component mount
        const fetchWatchLater = async () => {
            const fetchedProfile = await getUserByUsername(username);
            setUserData(fetchedProfile);

            if (token) {
                const profileToken = await getUserByToken(token);
                setCurrentUser(profileToken);
                if (profileToken.username == username) {
                    setOwnProfile(true);
                }
            }

            try {
                const response = await axios.get("http://127.0.0.1:5000/api/movie/watch_later", {
                    params: { username },
                });

                setWatchLater(response.data); // Store the fetched movie logs
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching movie logs:", error);
            }
        };

        fetchWatchLater();
    }, [username], [token]);

    const handleRemove = async (section, entryId) => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/movie/remove',
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
                setWatchLater((prev) => prev.filter((entry) => entry._id !== entryId));
                // alert("Successfully removed!");
            } else {
                throw new Error("Failed to remove the entry.");
            }
        } catch (error) {
            console.error("Error removing the entry:", error);
            alert("An error occurred while trying to remove the entry.");
        }
    };

    // Filter movies by search query
    const searchMovies = watchLater.filter((entry) =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Navbar */}
            <Navbar userData={currentUser} />

            {/* Main Content */}
            <Box sx={{ maxWidth: "900px", margin: "auto", mt: 10 }}>
                <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
                    {username}'s Watch Later List
                </Typography>

                {/* Search bar */}
                <Box sx={{ display: "flex", justifyContent: "center", my: 3, minWidth: "400px" }}>
                    <TextField
                        label="Search movies"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ width: "100%", maxWidth: 400 }}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>

                {watchLater.length === 0 ? (
                    <Typography variant="h6" color="textSecondary" sx={{ textAlign: "center", mt: 4 }}>
                        No movies found in your watch later.
                    </Typography>
                ) : searchMovies.length === 0 ? (
                    <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
                        No movies found.
                    </Typography>
                ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                        {searchMovies.map((entry, index) => {
                            const isDefaultPoster = !entry.poster; // Check if there's no poster
                            return (
                                <Link
                                    to={`/movie/${entry.movieId}`} // Redirect to the movie details page
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
                                            {/* Remove Button */}
                                            {ownProfile && (
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleRemove("watchLater", entry._id);
                                                        console.log("Remove movie:", entry.movieId);
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

export default WatchLater;
