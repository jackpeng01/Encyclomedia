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
    const [sortOrder, setSortOrder] = useState('name');

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

    const handleSortTV = (sortBy, media) => {
        setSortOrder(sortBy);
        
        let sortedResults = [...media];

        console.log(sortedResults);
    
        if (sortBy === 'atoz') {
          // Sort by name
          sortedResults.sort((a, b) => a.title.localeCompare(b.title));
        } 
        else if (sortBy === 'ztoa') {
            // Sort by name
            sortedResults.sort((a, b) => b.title.localeCompare(a.title));
        } 
        else if (sortBy === 'newest') {
          // Sort by release date (newest to oldest)
          sortedResults.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        }
        else if (sortBy === 'oldest') {
            // Sort by release date (newest to oldest)
        sortedResults.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
          }
        else if (sortBy === 'mostpopular') {
        sortedResults.sort((a, b) => b.popularity - a.popularity);
        }
        else if (sortBy === 'leastpopular') {
            sortedResults.sort((a, b) => a.popularity - b.popularity);
            }
        else if (sortBy === 'highestrated') {
            sortedResults.sort((a, b) => b.vote_average - a.vote_average);
        }
        else if (sortBy === 'lowestrated') {
            sortedResults.sort((a, b) => a.vote_average - b.vote_average);
        }
    
        if (media === tv) {
            setTV(sortedResults); 
        }
        else if (media === movie) {
            setMovie(sortedResults);   
        }
        else if (media === book) {
            setBook(sortedResults);   
        }// Update the results state with the sorted array
      };

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <Navbar userData={userData} /> 
            <h1>Trending This Week</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <h2>Television</h2>
            <label for="sortTV" style={{ fontSize: "16px"}}>Sort TV: </label>
            <select style={{ fontSize: "16px"}} onChange={(e) => handleSortTV(e.target.value, tv)}>
                <option value="select">Select</option>
                <option value="mostpopular">Most Popular</option>
                <option value="leastpopular">Least Popular</option>
                <option value="highestrated">Highest Rated</option>
                <option value="lowestrated">Lowest Rated</option>
                <option value="atoz">A to Z</option>
                <option value="ztoa">Z to A</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
            </select>
            <div style={{ paddingTop: "20px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
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
            <label for="sortMovies" style={{ fontSize: "16px"}}>Sort Movies: </label>
            <select style={{ fontSize: "16px"}} onChange={(e) => handleSortTV(e.target.value, movie)}>
                <option value="select">Select</option>
                <option value="mostpopular">Most Popular</option>
                <option value="leastpopular">Least Popular</option>
                <option value="highestrated">Highest Rated</option>
                <option value="lowestrated">Lowest Rated</option>
                <option value="atoz">A to Z</option>
                <option value="ztoa">Z to A</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
            </select>
            <div style={{ paddingTop: "20px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
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
            <label for="sortBooks" style={{ fontSize: "16px"}}>Sort Books: </label>
            <select style={{ fontSize: "16px"}} onChange={(e) => handleSortTV(e.target.value, book)}>
                <option value="select">Select</option>
                <option value="atoz">A to Z</option>
                <option value="ztoa">Z to A</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
            </select>
            <div style={{ paddingTop: "20px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
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
