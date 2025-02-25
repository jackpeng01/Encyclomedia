import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";
import { Box } from "@mui/material";

const MovieDetails = () => {
  const { id } = useParams(); // Get the movie ID from the URL
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");
  const [watchedDate, setWatchedDate] = useState("");
  const [tags, setTags] = useState("");
  const [watchLater, setWatchLater] = useState(false);
  const [watchLaterArray, setWatchLaterArray] = useState([]);
  const [visibleActors, setVisibleActors] = useState(5); // Number of actors visible
  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUserData = await getUserByToken(token);
      setUserData(fetchedUserData);

      // After userData is set, load the watch later items
      if (fetchedUserData) {
        console.log("insie Fetched");
        try {
          const response = await axios.get(`http://127.0.0.1:5000/api/watch_later`, {
            params: {
              username: fetchedUserData.username,
            },
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
          setWatchLaterArray(response.data);
          if (response.data.includes(parseInt(id))) {
            console.log("Here");
            setWatchLater(true);
          }
        } catch (err) {
          console.log(err);
          setError("Failed to load watch later.");
        }
      }
    };

    loadUserData();
  }, [token]); // This will re-run when token changes

  const calculateVisibleActors = () => {
    const containerWidth = window.innerWidth;
    const actorCardWidth = 140; // Approximate width of an actor card, including gap
    const newVisibleActors = Math.floor(containerWidth / actorCardWidth / 2);
    setVisibleActors(newVisibleActors);
  };

  useEffect(() => {
    // Recalculate visible actors on load and window resize
    calculateVisibleActors();
    window.addEventListener("resize", calculateVisibleActors);
    return () => window.removeEventListener("resize", calculateVisibleActors);
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const payload = {
          watched_date: watchedDate, // Example date; could be taken from a date picker
          tags: tags, // Example tags; could be taken from a user input field
          username: userData.username, // Replace with the current user's ID (from context or props)
        };
        const response = await axios.get(`http://127.0.0.1:5000/api/movie/${id}`); // Call your backend with the movie ID
        setMovie(response.data);
      } catch (err) {
        setError("Failed to load movie details.");
      }
    };

    fetchMovieDetails();
  }, [id]);

  const handleLogMovie = async () => {
    if (!userData) {
      console.log("Not logged in!");
      alert("Please Login!");
      return;
    }
    try {
      // Example payload: replace these with dynamic values from your UI
      const payload = {
        watched_date: watchedDate, // Example date; could be taken from a date picker
        tags: tags, // Example tags; could be taken from a user input field
        username: userData.username, // Replace with the current user's ID (from context or props)
      };

      // Make the POST request to log the movie
      const response = await axios.post(`http://127.0.0.1:5000/api/log_movie/${movie.id}`, payload);

      // Handle success
      alert("Movie logged successfully!");
      console.log("Log response:", response.data);
    } catch (error) {
      // Handle errors
      console.error("Error logging movie:", error);
      alert("Failed to log the movie. Please try again.");
    }
  };


  const handleSaveForLater = async () => {
    if (!userData) {
      console.log("Not logged in!");
      alert("Please Login!");
      return;
    }
    try {
      // Example payload: replace these with dynamic values from your UI
      const payload = {
        username: userData.username, // Replace with the current user's ID (from context or props)
      };

      // Make the POST request to save the movie for later
      const response = await axios.post(`http://127.0.0.1:5000/api/watch_later_movie/${movie.id}`, payload);

      // Handle success
      alert("Movie saved successfully!");
      console.log("Log response:", response.data);

      // Update state to reflect the movie is saved to Watch Later
      setWatchLater(true); // Set the watchLater state to true, which will change the button's appearance
    } catch (error) {
      // Handle errors
      console.error("Error saving movie:", error);
      alert("Failed to save the movie. Please try again.");
    }
  };


  const handleLoadMoreActors = () => {
    setVisibleActors((prevVisible) => prevVisible + movie.cast.length); // Increase visible actors by 5
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!movie) return <p>Loading movie details...</p>;

  const displayedActors = movie.cast.slice(0, visibleActors);

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
              src={movie.poster_path ? movie.poster_path : `${process.env.PUBLIC_URL}/default-poster-icon.png`}
              alt={movie.title}
              style={{
                width: '100%',
                maxWidth: '300px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Box
              sx={{
                maxWidth: '800px',
                marginTop: '500px',
                margin: '0 auto', // Center content
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Log and Save Section */}
              <Box sx={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Log/Save</h2>
                {/* Log Watched Movie */}
                <Box sx={{ marginBottom: '1.5rem' }}>
                  <label>
                    <strong>Date Watched:</strong>
                    <input
                      type="date"
                      value={watchedDate}
                      onChange={(e) => setWatchedDate(e.target.value)}
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                      }}
                    />
                  </label>
                </Box>
                <Box sx={{ marginBottom: '1.5rem' }}>
                  <label>
                    <strong>Tags:</strong>
                    <input
                      type="text"
                      placeholder="e.g., action, family"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        width: '70%',
                      }}
                    />
                  </label>
                </Box>
                <button
                  onClick={handleLogMovie}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                  }}
                >
                  Log Movie
                </button>
                <br />
                {/* Save for Later */}
                <button
                  onClick={handleSaveForLater}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    backgroundColor: watchLater ? '#28a745' : '#ffc107', // Green when saved, yellow otherwise
                    color: '#fff',
                    border: 'none',
                    cursor: watchLater ? 'not-allowed' : 'pointer', // Change cursor when disabled
                  }}
                  disabled={watchLater} // Disable button when watchLater is true
                >
                  {watchLater ? 'Saved to Watch Later' : 'Save to Watch Later'}
                </button>
              </Box>
            </Box>
          </Box>

          {/* Movie Info Section */}
          <Box sx={{ marginTop: '2rem' }}>
            <h1 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{movie.title}</h1>
            {movie.tagline && (
              <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '1rem' }}>
                "{movie.tagline}"
              </p>
            )}
            <p style={{ color: '#666', marginBottom: '1rem' }}>{movie.overview}</p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Release Date:</strong> {movie.release_date}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Rating:</strong> {movie.vote_average.toFixed(1)}
            </p>
            {movie.runtime && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Runtime:</strong> {movie.runtime} minutes
              </p>
            )}
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Genres:</strong> {movie.genres.join(', ')}
            </p>
            {movie.status && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Status:</strong> {movie.status}
              </p>
            )}
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
              {displayedActors.map((actor, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: 'center',
                    minWidth: '120px',
                    maxWidth: '120px',
                    flexShrink: 0, // Prevent shrinking
                  }}
                >
                  <img
                    src={actor.profile_path ? actor.profile_path : `${process.env.PUBLIC_URL}/default-actor-icon.png`}
                    alt={actor.name}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '10px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {actor.name}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#666' }}>
                    as {actor.character}
                  </p>
                </Box>
              ))}
              {visibleActors < movie.cast.length && (
                <button
                  onClick={handleLoadMoreActors}
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

export default MovieDetails;
