import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users"; // Ensure correct import path
import Navbar from "../components/Navbar";

const TVSearch = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");
    const category = queryParams.get("category") || "tv"; // Default to "movies"
    const yearStart = queryParams.get("yearStart") || "";
    const yearEnd = queryParams.get("yearEnd") || "";
    const ratingMin = queryParams.get("minRating") || 0; // Default to 0
    const ratingMax = queryParams.get("maxRating") || 10; // Default to 10
    const genre = queryParams.get("genre") || "";
    const [tv, setTV] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // Added loading state
    const token = useSelector((state) => state.auth.token);
    const [userData, setUserData] = useState(null);

    // Load user data when the component mounts
    useEffect(() => {
        const loadUserData = async () => {
            if (token) {
                try {
                    const fetchedUserData = await getUserByToken(token);
                    setUserData(fetchedUserData);
                } catch (err) {
                    console.error("Error fetching user data:", err);
                }
            }
        };
        loadUserData();
    }, [token]);

    // Fetch shows from the backend
    useEffect(() => {
        const fetchTV = async () => {
            try {
                setLoading(true); // Start loading
                setError("");
                const response = await axios.get(`http://127.0.0.1:5000/api/tv/search?query=${query}`, {
                    params: { 
                        query, 
                        category, 
                        yearStart, 
                        yearEnd, 
                        ratingMin, 
                        ratingMax, 
                        genre 
                    }
                });
                setTV(response.data.tv);
            } catch (err) {
                setError("Error fetching tv.");
            } finally {
                setLoading(false); // Stop loading
            }
        };

        if (query) fetchTV();
    }, [query]);

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <Navbar userData={userData} />
            <h1>TV Results for "{query}"</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading ? <p>Loading...</p> : null} {/* Show "Loading..." when fetching */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                {tv.length > 0 ? (
                    tv.map((item) => {
                        const isDefaultPoster = !item.poster_path;
                        return (
                            <div key={item.id} style={{ textAlign: "center" }}>
                                <Link to={`/tv/${item.id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                                    <img
                                        src={isDefaultPoster ? `${process.env.PUBLIC_URL}/default-poster-icon.png` : item.poster_path}
                                        alt={item.title}
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
                                    <p style={{ marginTop: "5px", fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                                        {item.title}
                                    </p>
                                )}
                            </div>
                        );
                    })
                ) : (
                    !loading && <p>No TV found.</p> // Prevents "No TV found." from showing while loading
                )}
            </div>
        </div>
    );
};

export default TVSearch;
