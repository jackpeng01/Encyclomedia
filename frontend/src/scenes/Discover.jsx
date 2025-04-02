import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button } from "@mui/material";
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
    const [minRating, setMinRating] = useState("");
    const [maxRating, setMaxRating] = useState("");
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
    const [userData, setUserData] = useState("");

    const navigate = useNavigate();
    const searchInputRef = useRef(null); // Reference for search input

    useEffect(() => {
        const loadUserData = async () => {
            const fetchedUserData = await getUserByToken(token);
            setUserData(fetchedUserData);
        };
        loadUserData();
        searchInputRef.current.focus(); // Automatically focus the search bar after category click
    }, [token]);

    const handleSearchSubmit = () => {
        if (!searchQuery.trim()) return;

        let params = new URLSearchParams({ query: searchQuery.trim() }).toString();

        if (category === "users") {
            navigate(`/discover/users?${params}`);
            return;
        }

        if (category === "books") {
            params = new URLSearchParams({
                query: searchQuery.trim(),
                yearStart: yearStart || "",
                yearEnd: yearEnd || "",
                subjects: genre.join(",") || "",
                category: category,
            }).toString();
            navigate(`/booksearch?${params}`);
        } else if (category === "movies") {
            params = new URLSearchParams({
                query: searchQuery.trim(),
                yearStart: yearStart || "",
                yearEnd: yearEnd || "",
                genre: genre.join(",") || "",
                minRating: minRating || "",
                maxRating: maxRating || "",
                category: category,
            }).toString();
            navigate(`/search?${params}`);
        } else if (category === "plot") {
            navigate(`/plot-search?query=${searchQuery.trim()}`);
        } else {
            navigate(`/search?${params}`);
        }

        setIsAdvancedSearchOpen(false);
    };

    // Handle the Enter key press for triggering search
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    // Function to handle category click (sets category but doesn't trigger search)
    const handleCategoryClick = (cat) => {
        setCategory(cat); // Set the selected category
        searchInputRef.current.focus(); // Automatically focus the search bar after category click
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#ffff",
                paddingTop: "50px",
            }}
        >
            <Navbar userData={userData} />

            {/* Category Buttons */}
            <Box sx={{ display: "flex", gap: 2, mb: 2, marginTop: "10rem" }}>
                {["movies", "tv", "books", "users", "plot"].map((cat) => (
                    <Button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)} // Set the category and focus the search bar
                        sx={{
                            backgroundColor: category === cat ? "#6b46c1" : "#f4f4f4",
                            color: category === cat ? "white" : "black",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            "&:hover": { backgroundColor: "#6b46c1", color: "white" },
                        }}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                ))}
            </Box>

            {/* Search Container */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "60%",
                    gap: 2, // Spacing between search bar and button
                }}
            >
                {/* Search Bar */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        flexGrow: 1, // Takes available space
                        backgroundColor: "rgba(255, 255, 255, 0.9)", // Slightly transparent white
                        borderRadius: "25px", // More rounded
                        border: "1px solid #ccc", // Subtle border
                        padding: "8px 16px", // Padding inside the box
                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // Soft shadow
                    }}
                >
                    {/* Search Icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        style={{ width: "24px", height: "24px", marginRight: "8px", color: "#666" }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010 17.5a7.5 7.5 0 006.65-3.85z"
                        />
                    </svg>

                    <TextField
                        variant="standard"
                        placeholder="I am looking for ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                        inputRef={searchInputRef}
                        onKeyDown={handleKeyDown} // Listen for key down event
                        InputProps={{
                            disableUnderline: true, // Remove default underline
                            style: { fontSize: "18px", color: "#333" }, // Bigger font
                        }}
                        sx={{
                            "& .MuiInputBase-root": {
                                height: "40px",
                                backgroundColor: "transparent",
                            },
                        }}
                    />
                </Box>

                {/* Advanced Search Button */}
                {category !== "users" && category !== "plot" && (
                    <Button
                        onClick={() => setIsAdvancedSearchOpen(true)}
                        sx={{
                            backgroundColor: "#f4f4f4",
                            color: "black",
                            padding: "8px 4px", // Adjust padding for size
                            fontSize: "16px", // Increase text size
                            borderRadius: "8px",
                            height: "50px", // Set height explicitly
                            minWidth: "50px", // Control button width
                            "&:hover": { backgroundColor: "#6b46c1", color: "white" },
                        }}
                    >
                        +
                    </Button>
                )}
            </Box>

            {/* Advanced Search Modal */}
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
                minRating={minRating}
                setMinRating={setMinRating}
                maxRating={maxRating}
                setMaxRating={setMaxRating}
                handleSearchSubmit={handleSearchSubmit}
                category={category}
            />
        </Box>
    );
};

export default Discover;
