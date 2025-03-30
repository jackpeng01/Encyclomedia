import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Navbar from "../components/Navbar";
import ProfilePicture from "../components/modals/ProfilePicture";
import { Box, Typography } from "@mui/material";
import { getUserByToken } from "../api/users";

const UserSearch = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");
    const token = useSelector((state) => state.auth.token);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [userData, setUserData] = useState({});

    useEffect(() => {
        const loadUserData = async () => {
            const fetchedUserData = await getUserByToken(token);
            setUserData(fetchedUserData);
        };
        loadUserData();
    }, [token]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setError("");
                const response = await axios.get("http://127.0.0.1:5000/api/discover/users", {
                    params: { query },
                });
                setUsers(response.data.users || []);
            } catch (err) {
                setError(err.response?.data?.error || "An error occurred while fetching users.");
            }
        };
        fetchUsers();
    }, [query]);

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <Navbar userData={userData} />
            <h1>Search Results for "{query}"</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
                {users.length > 0 ? (
                    users.map((user) => (
                        <Box
                            sx={{ textAlign: "center", padding: 2, border: "1px solid #ccc", borderRadius: "10px" }}
                            key={user.username}
                        >
                            <Link to={`/${user.username}`} style={{ textDecoration: "none", color: "black" }}>
                                <ProfilePicture userData={user} viewerData={''} token={''} />
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                    {user.username}
                                </Typography>
                            </Link>
                        </Box>
                    ))
                ) : (
                    <p>No users found.</p>
                )}
            </Box>
        </div>
    );
};

export default UserSearch;
