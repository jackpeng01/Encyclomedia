import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users"; // Ensure correct import path
import Navbar from "../components/Navbar";

const AuthorSearch = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");
    const [authors, setAuthors] = useState([]);
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

    // Fetch people from the backend
    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                setLoading(true); // Start loading
                setError("");
                const response = await axios.get(`http://127.0.0.1:5000/api/searchauthor?query=${query}`, {
                    params: { 
                        query, 
                    }
                });
                console.log(response.data);
                setAuthors(response.data.authors);
            } catch (err) {
                setError("Error fetching people.");
            } finally {
                setLoading(false); // Stop loading
            }
        };

        if (query) fetchAuthors();
    }, [query]);

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <Navbar userData={userData} />
            <h1>Results for "{query}"</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading ? <p>Loading...</p> : null} {/* Show "Loading..." when fetching */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                {authors.length > 0 ? (
                    authors.map((item) => {
                        const isDefaultPoster = !item.image_url;
                        return (
                            <div key={item.id} style={{ textAlign: "center" }}>
                                <Link to={`/authors/${item.id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                                    <img
                                        src={isDefaultPoster ? `${process.env.PUBLIC_URL}/default-poster-icon.png` : item.image_url}
                                        alt={item.name}
                                        style={{
                                            width: isDefaultPoster ? "90%" : "100%",
                                            height: "auto",
                                            maxHeight: isDefaultPoster ? "90%" : "auto",
                                            borderRadius: "5px",
                                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                            cursor: "pointer",
                                        }}
                                    />
                                    <p style={{ marginTop: "5px", fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                                        {item.name}
                                    </p>
                                </Link>

                            </div>
                        );
                    })
                ) : (
                    !loading && <p>No authors found.</p> // Prevents "No TV found." from showing while loading
                )}
            </div>
        </div>
    );
};

export default AuthorSearch;
