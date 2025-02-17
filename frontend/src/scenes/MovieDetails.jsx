import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const MovieDetails = () => {
  const { id } = useParams(); // Get the movie ID from the URL
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/movie/${id}`); // Call your backend with the movie ID
        setMovie(response.data);
      } catch (err) {
        setError("Failed to load movie details.");
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!movie) return <p>Loading movie details...</p>;

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>{movie.title}</h1>
      <p>{movie.overview}</p>
      <img
        src={movie.poster_path}
        alt={movie.title}
        style={{
          width: "300px",
          height: "auto",
          borderRadius: "5px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      />
      <p>Release Date: {movie.release_date}</p>
      <p>Rating: {movie.vote_average}</p>
    </div>
  );
};

export default MovieDetails;
