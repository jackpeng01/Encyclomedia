import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";
import Navbar from "../components/Navbar";
import { getUserByToken } from "../api/users";
import AdvancedSearchModal from "../components/modals/AdvancedSearchModal";
import axios from "axios";
import { setMovies, clearMovies, setBooks } from "../state/mediaSlice"; // Import the action


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
    const [plotError, setPlotError] = useState("");
    const MIN_PLOT_LENGTH = 10;  // Minimum number of characters
    const MAX_PLOT_LENGTH = 300; // Maximum number of characters
    // const [movies, setMovies] = useState([]);
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const hasFetchedMedia = useRef(false); // ✅ Track API call status
    const movies = state.media?.movies; // Safely access movies
    const books = state.media?.books;

    const navigate = useNavigate();
    const searchInputRef = useRef(null);

    useEffect(() => {
        const loadUserData = async () => {
            const fetchedUserData = await getUserByToken(token);
            setUserData(fetchedUserData);
            console.log(movies)
            console.log(books)


            if (!hasFetchedMedia.current && (movies.length === 0 || books.length === 0)) {
                hasFetchedMedia.current = true; // Mark API as called

                try {
                    let interestsQuery = "";
                    if (fetchedUserData.genrePreferences) {
                        interestsQuery = fetchedUserData.genrePreferences.join(",");
                    }
                    console.log(fetchedUserData.genrePreferences)
                    const response = await axios.get("http://127.0.0.1:5000/api/discover/recommended", {
                        params: { query: interestsQuery },
                    });

                    dispatch(setMovies(response.data.movies));
                    dispatch(setBooks(response.data.books))
                } catch (error) {
                    console.error("Error fetching recommended movies:", error);
                }
            }

        };
        loadUserData();
        searchInputRef.current.focus();
        // dispatch(clearMovies());

    }, [token]);

    const handleRefresh = async () => {
        try {
            // Convert genre preferences to a comma-separated string
            let interestsQuery = userData.genrePreferences ? userData.genrePreferences.join(",") : "";

            // Extract previously recommended movie titles and years
            const previousMovies = movies.map(movie => movie.title);
            const previousBooks = books.map(book => book.title);

            const response = await axios.get("http://127.0.0.1:5000/api/discover/recommended", {
                params: {
                    query: interestsQuery,
                    previousMovies: JSON.stringify(previousMovies), // Send as JSON string
                    previousBooks: JSON.stringify(previousBooks) // Send as JSON string
                },
            });

            dispatch(setMovies(response.data.movies));
            dispatch(setBooks(response.data.books));
        } catch (error) {
            console.error("Error fetching recommended movies:", error);
        }
    };

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
                category,
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
                category,
            }).toString();
            navigate(`/search?${params}`);
        } else if (category === "plot") {
            if (searchQuery.length < MIN_PLOT_LENGTH) {
                alert(`Plot must be at least ${MIN_PLOT_LENGTH} characters.`);
                return;
            } else if (searchQuery.length > MAX_PLOT_LENGTH) {
                alert(`Plot must be no more than ${MAX_PLOT_LENGTH} characters.`);
                return;
            } else {
                setPlotError(""); // Clear any previous error
                navigate(`/plot-search?query=${searchQuery.trim()}`);
            }
        } else {
            navigate(`/search?${params}`);
        }

        setIsAdvancedSearchOpen(false);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSearchSubmit();
        }
    };

    const handleCategoryClick = (cat) => {
        setCategory(cat);
        searchInputRef.current.focus();
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", backgroundColor: "#ffff", paddingTop: "50px" }}>
            <Navbar userData={userData} />

            <Box sx={{ display: "flex", gap: 2, mb: 2, marginTop: "10rem" }}>
                {["movies", "tv", "books", "users", "plot"].map((cat) => (
                    <Button
                        key={cat}
                        onClick={() => setCategory(cat)}
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

            <Box sx={{ display: "flex", alignItems: "center", width: "60%", gap: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        flexGrow: 1,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "25px",
                        border: "1px solid #ccc",
                        padding: "8px 16px",
                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <TextField
                        variant="standard"
                        placeholder="I am looking for ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                        inputRef={searchInputRef}
                        onKeyDown={(event) => event.key === "Enter" && handleSearchSubmit()}
                        InputProps={{ disableUnderline: true, style: { fontSize: "18px", color: "#333" } }}
                        sx={{ "& .MuiInputBase-root": { height: "40px", backgroundColor: "transparent" } }}
                    />
                </Box>

                {category !== "users" && category !== "plot" && (
                    <Button
                        onClick={() => setIsAdvancedSearchOpen(true)}
                        sx={{
                            backgroundColor: "#f4f4f4",
                            color: "black",
                            padding: "8px 4px",
                            fontSize: "16px",
                            borderRadius: "8px",
                            height: "50px",
                            minWidth: "50px",
                            "&:hover": { backgroundColor: "#6b46c1", color: "white" },
                        }}
                    >
                        +
                    </Button>
                )}
            </Box>

            {/* Recommendations Heading and Refresh Button */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "80%", marginTop: "2rem", marginBottom: "1rem" }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
                    Recommendations
                </Typography>
                <Button
                    onClick={handleRefresh}
                    sx={{
                        backgroundColor: "#6b46c1",
                        color: "white",
                        padding: "6px 12px",
                        fontSize: "14px",
                        borderRadius: "6px",
                        "&:hover": { backgroundColor: "#5a38b3" },
                    }}
                >
                    Refresh
                </Button>
            </Box>

            {/* Movie Posters */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0px", marginBottom: "30px", maxWidth: "87%" }}> {/* Added marginBottom here */}
                {movies.length > 0 ? (
                    movies.map((movie) => {
                        const isDefaultPoster = !movie.poster_path;
                        return (
                            <div key={movie.id} style={{ textAlign: "center" }}>
                                <Link to={`/movie/${movie.id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                                    <img
                                        src={isDefaultPoster ? `${process.env.PUBLIC_URL}/default-poster-icon.png` : movie.poster_path}
                                        alt={movie.title}
                                        style={{
                                            width: isDefaultPoster ? "50%" : "60%",
                                            height: "auto",
                                            maxHeight: isDefaultPoster ? "90%" : "auto",
                                            borderRadius: "5px",
                                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                            cursor: "pointer",
                                        }}
                                    />
                                </Link>
                                {isDefaultPoster && (
                                    <p style={{ marginTop: "5px", fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                                        {movie.title}
                                    </p>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p>No movies to display.</p>
                )}
            </div>

            {/* Book Posters */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "15px", maxWidth: "87%" }}>
                {books.length > 0 ? (
                    books.map((book) => (
                        <div key={book.id} style={{ textAlign: "center" }}>
                            <Link to={`/book/${book.id}`}>
                                <img src={book.cover_url} alt={book.title} style={{ width: "50%", height: "auto" }} />
                            </Link>
                            <p>{book.title}</p>
                            <p><i>{book.author}</i></p>
                        </div>
                    ))
                ) : (
                    <p>No books found.</p>
                )}
            </div>


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
