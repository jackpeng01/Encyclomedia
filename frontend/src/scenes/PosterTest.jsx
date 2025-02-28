import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const PosterTest = () => {
  const [query, setQuery] = useState(""); // State for the movie name query
  const [movies, setMovies] = useState([]); // State for an array of movie data (not just posters)
  const [error, setError] = useState(""); // State for error messages

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent page refresh on form submit
    if (!query) {
      setError("Please enter a movie name."); // Display error if query is empty
      return;
    }

    try {
      setError(""); // Clear any previous errors
      setMovies([]); // Clear movies for a fresh search

      // Make an Axios request to the Flask backend
      const response = await axios.get("http://127.0.0.1:5000/api/movie/poster", {
        params: { query: query }, // Send the query as a URL parameter
      });

      // Update the state with the array of movies
      setMovies(response.data.movies); // Expecting data to include more details (e.g., ID, poster URL, title)
    } catch (err) {
      // Handle errors from the backend
      setError(err.response?.data?.error || "An error occurred while fetching the posters.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Search for Movie Posters</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Enter movie name"
          value={query}
          onChange={(e) => setQuery(e.target.value)} // Update the query state
          style={{
            padding: "0.5rem",
            fontSize: "1rem",
            marginRight: "0.5rem",
            width: "300px",
          }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}>
          Search
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Display errors */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "10px",
        }}
      >
        {/* Display each poster image in a grid */}
        {movies.length > 0 ? (
          movies.map((movie, index) => (
            <Link
              key={index}
              to={`/movie/${movie.id}`} // Navigate to the movie details page using the movie ID
              style={{ textDecoration: "none" }}
            >
              <img
                src={movie.poster_path} // Assuming `poster_path` holds the URL to the poster
                alt={movie.title || `Movie Poster ${index + 1}`}
                style={{
                  width: "150px",
                  height: "auto",
                  borderRadius: "5px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                }}
              />
            </Link>
          ))
        ) : (
          <p>No posters to display.</p>
        )}
      </div>
    </div>
  );
};

export default PosterTest;
