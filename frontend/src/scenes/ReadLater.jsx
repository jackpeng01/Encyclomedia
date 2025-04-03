import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Box, Button, Typography, TextField } from "@mui/material";
import { getUserByUsername, getUserByToken } from "../api/users";

const ReadLater = () => {
    const { username } = useParams();
    const [readLater, setReadLater] = useState([]);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState("");
    const token = useSelector((state) => state.auth.token);
    const [ownProfile, setOwnProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchReadLater = async () => {
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
                const response = await axios.get("http://127.0.0.1:5000/api/book/read_later", {
                    params: { username },
                });

                setReadLater(response.data);
            } catch (error) {
                console.error("Error fetching read later list:", error);
            }
        };

        fetchReadLater();
    }, [username, token]);

    const handleRemoveFromReadLater = async (entryId) => {
        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/api/book/remove_read_later",
                {
                    username: username,
                    entry: entryId,
                    section: "readLater"
                }
            );
    
            if (response.status === 200) {
                setReadLater((prev) => prev.filter((entry) => entry._id !== entryId));
            }
        } catch (error) {
            console.error("Error removing book:", error);
            alert("An error occurred while trying to remove the book.");
        }
    };
    
    // Filter books by search query
    const filteredBooks = readLater.filter((entry) =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar userData={currentUser} />

            <Box sx={{ maxWidth: "900px", margin: "auto", mt: 10 }}>
                <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
                    {username}'s Read Later List
                </Typography>

                {/* Search bar */}
                <Box sx={{ display: "flex", justifyContent: "center", my: 3, minWidth: "400px" }}>
                    <TextField
                        label="Search books"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ width: "100%", maxWidth: 400 }}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>

                {error ? (
                    <Typography color="error">{error}</Typography>
                ) : filteredBooks.length === 0 ? (
                    <Typography variant="body1" sx={{ textAlign: "center", mt: 4 }}>
                        No books found.
                    </Typography>
                ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                        {filteredBooks.map((entry, index) => (
                            <Box key={index} sx={{ textAlign: "center", maxWidth: "160px" }}>
                                <Link to={`/book/${entry.bookId}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                                    <img
                                        src={entry.cover || `${process.env.PUBLIC_URL}/default-book-cover.png`}
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

                                {ownProfile && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleRemoveFromReadLater(entry._id)}
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

export default ReadLater;
