import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Box, Button, Typography } from "@mui/material";
import { getUserByUsername, getUserByToken } from "../api/users";

const BookLog = () => {
    const { username } = useParams();
    const [bookLog, setBookLog] = useState([]);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState("");
    const token = useSelector((state) => state.auth.token);
    const [ownProfile, setOwnProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchBookLog = async () => {
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
                const response = await axios.get("http://127.0.0.1:5000/api/book/log", {
                    params: { username },
                });

                setBookLog(response.data);
            } catch (error) {
                console.error("Error fetching Book Log:", error);
            }
        };

        fetchBookLog();
    }, [username, token]);

    const handleRemoveFromBookLog = async (entryId) => {
        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/api/book/remove_log",
                {
                    username: username,
                    entry: entryId,
                    section: "bookLog"
                }
            );
    
            if (response.status === 200) {
                setBookLog((prev) => prev.filter((entry) => entry._id !== entryId));
            }
        } catch (error) {
            console.error("Error removing book:", error);
            alert("An error occurred while trying to remove the book.");
        }
    };
    

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar userData={currentUser} />

            <Box sx={{ maxWidth: "900px", margin: "auto", mt: 10 }}>
                <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
                    {username}'s Book Log
                </Typography>

                {error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                        {bookLog.map((entry, index) => (
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
                                        onClick={() => handleRemoveFromBookLog(entry._id)}
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

export default BookLog;
