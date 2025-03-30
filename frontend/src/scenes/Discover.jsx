import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Box,
    TextField,
    Select,
    MenuItem,
    Button,
} from "@mui/material";
import axios from "axios";
import Navbar from "../components/Navbar";
import { getUserByToken } from "../api/users";
import AdvancedSearchModal from "../components/modals/AdvancedSearchModal";

const Discover = () => {
    const token = useSelector((state) => state.auth.token);
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("movies");
    const [yearStart, setYearStart] = useState("");
    const [yearEnd, setYearEnd] = useState("");
    const [genre, setGenre] = useState([]);
    const [minRating, setMinRating] = useState(""); // Min rating
    const [maxRating, setMaxRating] = useState(""); // Max rating
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
    const [userData, setUserData] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const loadUserData = async () => {
            const fetchedUserData = await getUserByToken(token);
            setUserData(fetchedUserData);
        };
        loadUserData();
    }, [token]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        // if (searchQuery === "") return;


        let params = new URLSearchParams({
            query: searchQuery.trim()
        }).toString();
        if (category === "users") {
            navigate(`/discover/users?${params}`);
            return;
        }

        
        if (searchQuery.trim()) {
            // Redirect to correct search results page with the query and category
            if (category === "books") {
                params = new URLSearchParams({
                    query: searchQuery.trim(),
                    yearStart: yearStart || '',
                    yearEnd: yearEnd || '',
                    subjects: genre.join(",") || '',
                    category: category,
                }).toString();
                navigate(`/booksearch?${params}`);
                setSuggestions([]);
            } else if (category === "movies") {
                params = new URLSearchParams({
                    query: searchQuery.trim(),
                    yearStart: yearStart || '',
                    yearEnd: yearEnd || '',
                    genre: genre.join(",") || '',
                    minRating: minRating || '', // Add minRating
                    maxRating: maxRating || '', // Add maxRating
                    category: category,
                }).toString();
                navigate(`/search?${params}`);
            } else {
                // TV Shows will go here but for now just going to movies
                navigate(`/search?${params}}`);
            }
        }

        // Navigate to the search results page with the parameters
        //navigate(`/search?${params}`);

        // Close the advanced search modal after the search is triggered
        setIsAdvancedSearchOpen(false);
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

                {/* Advanced Search Button */}
                {category !== "users" && (
                    <Button
                        onClick={() => setIsAdvancedSearchOpen(true)}
                        sx={{
                            textTransform: "none",
                            color: "black",
                            borderLeft: "1px solid gray",
                            borderRadius: 0,
                            height: "100%",
                            padding: "0 10px",
                        }}
                    >
                        Advanced
                    </Button>
                )}

                {/* Hidden submit button */}
                <button type="submit" style={{ display: "none" }}></button>
            </Box>

            {/* Use the AdvancedSearchModal component */}
            <AdvancedSearchModal
                isOpen={isAdvancedSearchOpen}
                onClose={() => setIsAdvancedSearchOpen(false)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                yearStart={yearStart}
                setYearStart={setYearStart}
                yearEnd={yearEnd}
                setYearEnd={setYearEnd}
                genre={genre}
                setGenre={setGenre}
                minRating={minRating} // Pass minRating
                setMinRating={setMinRating} // Set minRating
                maxRating={maxRating} // Pass maxRating
                setMaxRating={setMaxRating} // Set maxRating
                handleSearchSubmit={handleSearchSubmit}
                category={category}
            />
        </Box>
    );
};

export default Discover;
