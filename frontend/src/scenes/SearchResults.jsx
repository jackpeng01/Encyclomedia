import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";


const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get("query");
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageInput, setPageInput] = useState(currentPage);
    const token = useSelector((state) => state.auth.token);
    const [userData, setUserData] = useState([]);


    useEffect(() => {
        const loadUserData = async () => {
            const fetchedUserData = await getUserByToken(token);
            setUserData(fetchedUserData);
            console.log("userdata: ", userData);
        };
        loadUserData();
    }, [token]);

    useEffect(() => {
        const fetchMovies = async (page = 1) => {
            try {
                setError("");
                const response = await axios.get("http://127.0.0.1:5000/api/poster", {
                    params: { query, page },
                });
                setMovies(response.data.movies);
                setTotalPages(response.data.total_pages);
            } catch (err) {
                setError(err.response?.data?.error || "An error occurred while fetching the movies.");
            }
        };

        if (query) {
            fetchMovies(currentPage);
        }
    }, [query, currentPage]);

    useEffect(() => {
        setPageInput(currentPage);  // Sync page input with currentPage
    }, [currentPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            navigate(`?query=${query}&page=${nextPage}`);
        }
        window.scrollTo({
            top: 0,
            behavior: "smooth",  // Smooth scroll effect
        });
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            navigate(`?query=${query}&page=${prevPage}`);
        }
        window.scrollTo({
            top: 0,
            behavior: "smooth",  // Smooth scroll effect
        });
    };

    const handlePageInputChange = (e) => {
        const value = e.target.value;
        if (value >= 1 && value <= totalPages) {
            setPageInput(value);
        }
    };

    const handlePageSubmit = (e) => {
        if (e.key === "Enter") {
            const page = Number(pageInput);
            if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
                navigate(`?query=${query}&page=${page}`);
            }
        }
        window.scrollTo({
            top: 0,
            behavior: "smooth",  // Smooth scroll effect
        });
    };

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            {/* ✅ Top Bar */}
            <Navbar userData={userData} />
            <br></br>
            <h1>Search Results for "{query}"</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div
    style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)", // 5 columns
        gap: "10px",
        gridAutoRows: "minmax(300px, auto)", // Ensures consistent row height
    }}
>
    {movies.length > 0 ? (
        movies.map((movie) => {
            const isDefaultPoster = !movie.poster_path;
            return (
                <div
                    key={movie.id}
                    style={{
                        textAlign: "center", // Center-aligns text
                    }}
                >
                    <Link to={`/movie/${movie.id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        <img
                            src={isDefaultPoster ? `${process.env.PUBLIC_URL}/default-poster-icon.png` : movie.poster_path}
                            alt={movie.title}
                            style={{
                                width: isDefaultPoster ? "90%" : "100%", // Smaller width for default posters
                                height: "auto", // Maintains aspect ratio
                                maxHeight: isDefaultPoster ? "90%" : "auto", // Smaller height for default posters
                                borderRadius: "5px",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                cursor: "pointer",
                            }}
                        />
                    </Link>
                    {/* Display title only if it's the default poster */}
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

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    style={buttonStyle}
                >
                    Previous
                </button>
                <input
                    type="number"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onKeyDown={handlePageSubmit}
                    style={inputStyle}
                    min="1"
                    max={totalPages}
                />
                <span style={{ margin: "0 10px" }}>
                    / {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    style={buttonStyle}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

// Modern button and input styling
const buttonStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "5px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
    margin: "0 10px",
};

const inputStyle = {
    width: "60px",
    padding: "5px",
    fontSize: "16px",
    textAlign: "center",
    borderRadius: "5px",
    border: "1px solid #ccc",
};

export default SearchResults;
