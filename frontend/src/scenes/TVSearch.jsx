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
    const [tv, setTV] = useState([]);
    const [error, setError] = useState("");
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

    // Fetch books from the backend
    useEffect(() => {
        const fetchTV = async () => {
            try {
                setError("");
                const response = await axios.get(`http://127.0.0.1:5000/api/tv/search?query=${query}`);
                setTV(response.data.tv);
            } catch (err) {
                setError("Error fetching tv.");
            }
        };

        if (query) fetchTV();
    }, [query]);

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <Navbar userData={userData} /> 
            <h1>TV Results for "{query}"</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                {tv.length > 0 ? (
                    tv.map((item) => (
                        <div key={item.id} style={{ textAlign: "center" }}>
                            <Link to={`/tv/${item.id}`}>
                                <img src={item.poster_path} alt={item.title} style={{
                                width: "100%", // Smaller width for default posters
                                height: "auto", // Maintains aspect ratio
                                maxHeight: "auto", // Smaller height for default posters
                                borderRadius: "5px",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                cursor: "pointer",
                            }} />
                            </Link>
                            <p>{item.title}</p>
                        </div>
                    ))
                ) : (
                    <p>No TV found.</p>
                )}
            </div>
        </div>
    );
};

export default TVSearch;
