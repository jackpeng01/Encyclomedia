import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Navbar from "../components/Navbar";
import { getUserByToken } from "../api/users";

const PlotSearchResults = () => {
    const token = useSelector((state) => state.auth.token);
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");

    const [movies, setMovies] = useState([]);
    const [error, setError] = useState("");
    const [userData, setUserData] = useState({});
    const [isLoading, setIsLoading] = useState(true); // Loading state

    useEffect(() => {
        const loadUserData = async () => {
            const fetchedUserData = await getUserByToken(token);
            setUserData(fetchedUserData);
        };
        loadUserData();
    }, [token]);

    // Utility function to introduce a delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Fetch movies based on the plot description query
    useEffect(() => {
        let isCancelled = false;
    
        const fetchMovies = async () => {
            if (!query) return;
            try {
                setError(""); // Clear previous errors
                setIsLoading(true); // Start loading
                const response = await axios.get("http://127.0.0.1:5000/api/discover/plot", {
                    params: { query },
                });
    
                if (!isCancelled) {
                    setMovies(response.data.movies || []);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err.response?.data?.error || "An error occurred while fetching the movies.");
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false); // End loading
                }
            }
        };
    
        fetchMovies();
    
        return () => {
            isCancelled = true; // Prevent setting state after component unmounts
        };
    }, [query]);
    

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <Navbar userData={userData} />
            <h1>Plot Search Results for "{query}"</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {isLoading ? (
                // Show a spinner while loading
                <div style={{ padding: "5rem" }}>
                    <div className="spinner" />
                    <p>Loading results...</p>
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)", // 5 columns
                        gap: "10px",
                        gridAutoRows: "minmax(300px, auto)", // Consistent row height
                    }}
                >
                    {movies.length > 0 ? (
                        movies.map((movie) => {
                            const isDefaultPoster = !movie.poster_path;
                            return (
                                <div key={movie.id} style={{ textAlign: "center" }}>
                                    <Link
                                        to={`/movie/${movie.id}`}
                                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                    >
                                        <img
                                            src={
                                                isDefaultPoster
                                                    ? `${process.env.PUBLIC_URL}/default-poster-icon.png`
                                                    : movie.poster_path
                                            }
                                            alt={movie.title}
                                            style={{
                                                width: isDefaultPoster ? "90%" : "100%",
                                                height: "auto",
                                                maxHeight: isDefaultPoster ? "90%" : "auto",
                                                borderRadius: "5px",
                                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                                cursor: "pointer",
                                            }}
                                        />
                                    </Link>
                                    {isDefaultPoster && (
                                        <p
                                            style={{
                                                marginTop: "5px",
                                                fontSize: "14px",
                                                fontWeight: "bold",
                                                color: "#333",
                                            }}
                                        >
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
            )}
        </div>
    );
};

export default PlotSearchResults;
