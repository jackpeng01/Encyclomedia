import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users"; // Ensure correct import path
import Navbar from "../components/Navbar";

const BookSearch = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");
    const yearStart = queryParams.get("yearStart");
    const yearEnd = queryParams.get("yearEnd");
    const subjects = queryParams.get("subjects");
    const [books, setBooks] = useState([]);
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
        const fetchBooks = async () => {
            try {
                setError("");
                const response = await axios.get("http://127.0.0.1:5000/api/book/search", {
                    params: { 
                        query, 
                        yearStart, 
                        yearEnd, 
                        subjects 
                    }
                });
                setBooks(response.data.books);
            } catch (err) {
                setError("Error fetching books.");
            }
        };

        if (query) fetchBooks();
    }, [query]);

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <Navbar userData={userData} /> 
            <h1>Book Results for "{query}"</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
                {books.length > 0 ? (
                    books.map((book) => (
                        <div key={book.id} style={{ textAlign: "center" }}>
                            <Link to={`/book/${book.id}`}>
                                <img src={book.cover_url} alt={book.title} style={{ width: "100px", height: "150px" }} />
                            </Link>
                            <p>{book.title}</p>
                            <p><i>{book.author}</i></p>
                        </div>
                    ))
                ) : (
                    <p>No books found.</p>
                )}
            </div>
        </div>
    );
};

export default BookSearch;
