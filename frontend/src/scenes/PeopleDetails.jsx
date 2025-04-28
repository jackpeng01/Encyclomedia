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

const PeopleDetails = () => {
    const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [error, setError] = useState("");
  const [visibleCast, setVisibleCast] = useState(5);
  const [visibleCrew, setVisibleCrew] = useState(5);
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

  const calculateVisibleCast = () => {
    const containerWidth = window.innerWidth;
    const castWidth = 140; // Approximate width of an actor card, including gap
    const newVisibleCast = Math.floor(containerWidth / castWidth / 2);
    setVisibleCast(newVisibleCast);
  };

  useEffect(() => {
    // Recalculate visible actors on load and window resize
    calculateVisibleCast();
    window.addEventListener("resize", calculateVisibleCast);
    return () => window.removeEventListener("resize", calculateVisibleCast);
  }, []);

  const calculateVisibleCrew = () => {
    const containerWidth = window.innerWidth;
    const crewWidth = 140; // Approximate width of an actor card, including gap
    const newVisibleCrew = Math.floor(containerWidth / crewWidth / 2);
    setVisibleCrew(newVisibleCrew);
  };

  useEffect(() => {
    // Recalculate visible actors on load and window resize
    calculateVisibleCrew();
    window.addEventListener("resize", calculateVisibleCrew);
    return () => window.removeEventListener("resize", calculateVisibleCrew);
  }, []);

  useEffect(() => {
    const fetchPeopleDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/people/${id}`); // Call your backend with the movie ID
        setPerson(response.data);
      } catch (err) {
        setError("Failed to load person details.");
      }
    };

    fetchPeopleDetails();
  }, [id]);


  const handleLoadMoreCast = () => {
    setVisibleCast((prevVisible) => prevVisible + person.cast.length); // Increase visible actors by 5
  };

  const handleLoadMoreCrew = () => {
    setVisibleCrew((prevVisible) => prevVisible + person.crew.length); // Increase visible actors by 5
  };


  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!person) return <p>Loading person details...</p>;

  const displayedCast = person.cast.slice(0, visibleCast);

  const displayedCrew = person.crew.slice(0, visibleCrew);

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
              src={person.profile_path ? person.profile_path : `${process.env.PUBLIC_URL}/default-poster-icon.png`}
              alt={person.name}
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
            <h1 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{person.name}</h1>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Known For:</strong> {person.known_for}
            </p>
            <p style={{ color: '#666', marginBottom: '1rem' }}>{person.biography}</p>
          </Box>

          {/* Cast Section */}
          <Box sx={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Cast</h2>
            <Box
              sx={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                scrollbarWidth: 'none', // Firefox
              }}
              className="hide-scrollbar"
            >
              {displayedCast.map((actor, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: 'center',
                    minWidth: '120px',
                    maxWidth: '120px',
                    flexShrink: 0, // Prevent shrinking
                  }}
                >
                  <Link to={`/${actor.media_type}/${actor.id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  <img src={actor.poster_path ? actor.poster_path : `${process.env.PUBLIC_URL}/default-actor-icon.png`}
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
              {visibleCast < person.cast.length && (
                <button
                  onClick={handleLoadMoreCast}
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

          {/* Crew Section */}
          <Box sx={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Crew</h2>
            <Box
              sx={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                scrollbarWidth: 'none', // Firefox
              }}
              className="hide-scrollbar"
            >
              {displayedCrew.map((actor, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: 'center',
                    minWidth: '120px',
                    maxWidth: '120px',
                    flexShrink: 0, // Prevent shrinking
                  }}
                >
                <Link to={`/${actor.media_type}/${actor.id}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  <img
                    src={actor.poster_path ? actor.poster_path : `${process.env.PUBLIC_URL}/default-actor-icon.png`}
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
                    {actor.job}
                  </p>
                </Box>
              ))}
              {visibleCrew < person.crew.length && (
                <button
                  onClick={handleLoadMoreCrew}
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

export default PeopleDetails;
