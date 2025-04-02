import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";

const RandomMovie = () => {
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      if (token) {
        const fetchedUserData = await getUserByToken(token);
        setUserData(fetchedUserData);
      }
    };
    loadUserData();
  }, [token]);

  const fetchRandomMovie = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/api/movie/random"
      );
      setMovie(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "An error occurred while fetching a random movie."
      );
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Random Movie</h1>
      <button onClick={fetchRandomMovie} style={buttonStyle}>
        Get Random Movie
      </button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {movie && (
        <div style={{ marginTop: "20px" }}>
          <Link
            to={`/movie/${movie.id}`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src={
                movie.poster_path
                  ? movie.poster_path
                  : `${process.env.PUBLIC_URL}/default-poster-icon.png`
              }
              alt={movie.title}
              style={{
                width: movie.poster_path ? "20%" : "15%",
                height: "auto",
                maxHeight: movie.poster_path ? "auto" : "90%",
                borderRadius: "5px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              }}
            />
          </Link>
          <h2>{movie.title}</h2>
        </div>
      )}
    </div>
  );
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "5px",
  backgroundColor: "#007BFF",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.3s",
  margin: "20px 0",
};

export default RandomMovie;
