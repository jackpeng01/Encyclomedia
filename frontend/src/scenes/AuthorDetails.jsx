import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";
import {
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from "@mui/material";
import { FaStar } from "react-icons/fa";
import ReviewModal from '../components/modals/ReviewModal.jsx';

const AuthorDetails = () => {
    const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [error, setError] = useState("");
  const [visibleBooks, setVisibleBooks] = useState(5);
  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState([]);
  
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

  const calculateVisibleBooks = () => {
    const containerWidth = window.innerWidth;
    const bookWidth = 140; // Approximate width of an actor card, including gap
    const newVisibleBooks = Math.floor(containerWidth / bookWidth / 2);
    setVisibleBooks(newVisibleBooks);
  };

  useEffect(() => {
    // Recalculate visible actors on load and window resize
    calculateVisibleBooks();
    window.addEventListener("resize", calculateVisibleBooks);
    return () => window.removeEventListener("resize", calculateVisibleBooks);
  }, []);

  useEffect(() => {
    const fetchAuthorDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/authors/${id}`); // Call your backend with the movie ID
        setAuthor(response.data);
      } catch (err) {
        setError("Failed to load person details.");
      }
    };

    fetchAuthorDetails();
  }, [id]);


  const handleLoadMoreBooks = () => {
    setVisibleBooks((prevVisible) => prevVisible + author.work.length); // Increase visible actors by 5
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!author) return <p>Loading author details...</p>;

  const displayedBooks = author.work.slice(0, visibleBooks);

  return (
    <div>
      {/* Navbar */}
      <Box
        sx={
          {
            paddingTop: 10,
            overflowX: "hidden", // Prevent horizontal scroll
            //width: "100vw", // Ensure it uses the full viewport width
          }}
      >
        <Navbar userData={userData} />

        {/* ✅ Main Container */}
        <Box
          sx={{
            maxWidth: '50vw',
            // marginTop: '500px',
            margin: '0 auto', // Center content
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Top Section: Poster and Log/Save */}
          <Box sx={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            {/* Poster Section */}
            <img
              src={author.image_url ? author.image_url : `${process.env.PUBLIC_URL}/default-poster-icon.png`}
              alt={author.name}
              style={{
                width: '100%',
                maxWidth: '300px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
          </Box>

          {/* Movie Info Section */}
          <Box sx={{ marginTop: '2rem' }}>
            <h1 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{author.name}</h1>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Number of Works:</strong> {author.num_books}
            </p>
            <p style={{ color: '#666', marginBottom: '1rem' }}>{author.biography}</p>
          </Box>

          {/* Cast Section */}
          <Box sx={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Titles</h2>
            <Box
              sx={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                scrollbarWidth: 'none', // Firefox
              }}
              className="hide-scrollbar"
            >
              {displayedBooks.map((actor, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: 'center',
                    minWidth: '120px',
                    maxWidth: '120px',
                    flexShrink: 0, // Prevent shrinking
                  }}
                >
                  <Link to={`/book/${actor.id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  <img src={actor.cover_url ? actor.cover_url : `${process.env.PUBLIC_URL}/default-actor-icon.png`}
                    alt={actor.name}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '10px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      marginBottom: '0.5rem',
                    }}
                  />
                  </Link>
                  <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {actor.title}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#666' }}>
                    {actor.character}
                  </p>
                </Box>
              ))}
              {visibleBooks < author.work.length && (
                <button
                  onClick={handleLoadMoreBooks}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '5px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    alignSelf: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ➡️
                </button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default AuthorDetails;
