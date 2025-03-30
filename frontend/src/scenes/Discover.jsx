import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Select, MenuItem, List, ListItem, ListItemText } from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar";
import { getUserByToken } from "../api/users";

const Discover = () => {
    const token = useSelector((state) => state.auth.token);
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("movies");
    const [suggestions, setSuggestions] = useState([]);
    const [userData, setUserData] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const loadUserData = async () => {
            const fetchedUserData = await getUserByToken(token);
            setUserData(fetchedUserData);
            console.log("userdata: ", userData);
        };
        loadUserData();
    }, [token]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length < 2) {
                setSuggestions([]);
                return;
            }

            try {
                const response = await axios.get(
                    `http://127.0.0.1:5000/api/book/suggestions?query=${searchQuery}`
                );
                setSuggestions(response.data.suggestions || []);
            } catch (error) {
                console.error("Error fetching book suggestions:", error);
            }
        };

        fetchSuggestions();
    }, [searchQuery]);


    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (category === "users") {
            navigate(`/discover/users?query=${encodeURIComponent(
                searchQuery.trim()
            )}&category=${category}`);
        }
        else if (searchQuery.trim()) {
            // Redirect to correct search results page with the query and category
            if (category === "books") {
                navigate(`/booksearch?query=${encodeURIComponent(searchQuery.trim())}`);
                setSuggestions([]);
            } else if (category === "movies") {
                navigate(
                    `/search?query=${encodeURIComponent(
                        searchQuery.trim()
                    )}&category=${category}`
                );
            } else {
                // TV Shows will go here but for now just going to movies
                navigate(
                    `/search?query=${encodeURIComponent(
                        searchQuery.trim()
                    )}&category=${category}`
                );
            }
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#ffff",
            }}
        >
            <Navbar userData={userData} />
            <Box
                component="form"
                onSubmit={handleSearchSubmit}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "60%",
                    backgroundColor: "white",
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "1px solid gray",
                    "&:hover": {
                        borderColor: "black",
                    },
                }}
            >
                <TextField
                    variant="outlined"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": { border: "none" },
                            borderRadius: 0,
                            paddingRight: 0,
                        },
                        "& .MuiInputBase-root": {
                            height: "15px",
                        },
                    }}
                />

                <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disableUnderline
                    sx={{
                        backgroundColor: "#f4f4f4",
                        minWidth: "100px",
                        height: "30px",
                        borderLeft: "1px solid gray",
                        borderRadius: 0,
                        "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                        },
                        "&:hover": {
                            borderColor: "black",
                        },
                        "&.Mui-focused": {
                            borderColor: "black",
                        },
                    }}
                >
                    <MenuItem value="movies">Movies</MenuItem>
                    <MenuItem value="tv">TV</MenuItem>
                    <MenuItem value="books">Books</MenuItem>
                    <MenuItem value="users">Users</MenuItem>
                </Select>

                {/* Hidden submit button */}
                <button type="submit" style={{ display: "none" }}></button>
            </Box>
            {/* Autocomplete Suggestions (Only for Books) */}
            {category === "books" && suggestions.length > 0 && (
                <List
                    sx={{
                        position: "absolute",
                        top: "55%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "50%",
                        backgroundColor: "white",
                        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                        borderRadius: "5px",
                        maxHeight: "200px",
                        overflowY: "auto",
                    }}
                >
                    {suggestions.map((suggestion) => (
                        <ListItem
                            key={suggestion.id}
                            button="true"
                            onClick={() => {
                                navigate(`/book/${suggestion.id}`);
                                setSearchQuery("");
                                setSuggestions([]);
                            }}
                            sx={{ "&:hover": { backgroundColor: "#f0f0f0" } }}
                        >
                            <ListItemText
                                primary={suggestion.title}
                                secondary={suggestion.author}
                                sx={{ color: "black" }}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default Discover;
