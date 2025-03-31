import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users"; // Ensure correct import path
import Navbar from "../components/Navbar";

const Trending = () => {
    const [tv, setTV] = useState([]);
    const [movie, setMovie] = useState([]);
    const [book, setBook] = useState([]);
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

    // Fetch trending TV from the backend
    useEffect(() => {
        const fetchTrendingTV = async () => {
            try {
                setError("");
                const response = await axios.get(`http://127.0.0.1:5000/api/trendingtv`);
                setTV(response.data.tv);
                console.log(tv);
            } catch (err) {
                setError("Error fetching tv.");
            }
        };

        fetchTrendingTV();
    }, []);

    useEffect(() => {
        const fetchTrendingMovies = async () => {
            try {
                setError("");
                const response = await axios.get(`http://127.0.0.1:5000/api/trendingmovies`);
                setMovie(response.data.movie);
                console.log(movie);
            } catch (err) {
                setError("Error fetching movie.");
            }
        };

        fetchTrendingMovies();
    }, []);

    useEffect(() => {
        const fetchTrendingBooks = async () => {
            try {
                setError("");
                const response = await axios.get(`http://127.0.0.1:5000/api/trendingbooks`);
                setBook(response.data.book);
                console.log(book);
            } catch (err) {
                setError("Error fetching books.");
            }
        };

        fetchTrendingBooks();
    }, []);

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <Navbar userData={userData} /> 
            <h1>Trending Media</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <h2>Television</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                {tv.map((item) => (
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
                    ))}
            </div>
            <h2>Movies</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                {movie.map((item) => (
                        <div key={item.id} style={{ textAlign: "center" }}>
                            <Link to={`/movie/${item.id}`}>
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
                    ))}
            </div>
            <h2>Books</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                {book.map((item) => (
                        <div key={item.id} style={{ textAlign: "center" }}>
                            <Link to={`/book/${item.id}`}>
                                <img src={item.cover_url} alt={item.title} style={{
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
                    ))}
            </div>
        </div>
    );
};

export default Trending;
