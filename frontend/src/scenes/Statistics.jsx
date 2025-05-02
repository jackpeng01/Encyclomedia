import { Box, Button, Typography, Chip } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getUserByToken, getUserByUsername } from "../api/users";
import Navbar from "../components/Navbar";
import { FaStar } from "react-icons/fa";
import ProfilePicture from "../components/modals/ProfilePicture";
import axios from "axios";
import FollowButton from "../components/FollowButton";
import { view } from "framer-motion";
import ProfileStats from "../components/modals/ProfileStats";

const Statistics = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const [viewerData, setViewerData] = useState([]);
  const [forceRefresh, setForceRefresh] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch viewerData if token is present
        let fetchedViewerData = {};
        if (token) {
          fetchedViewerData = await getUserByToken(token);
        }

        // Fetch userData if username is provided
        let fetchedProfile = {};
        if (username) {
          fetchedProfile = await getUserByUsername(username);
        }

        // Ensure default values to avoid undefined properties
        fetchedViewerData.following = fetchedViewerData.following || [];
        fetchedProfile.following = fetchedProfile.following || [];

        setViewerData(fetchedViewerData);
        setUserData(fetchedProfile);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [token, username, forceRefresh]);

  const [movieLog, setMovieLog] = useState([]);
  const [tvLog, setTvLog] = useState([]);
  const [loggedBooks, setLoggedBooks] = useState([]);
  const [movieTime, setMovieTime] = useState(0);
  const [tvTime, setTvTime] = useState(0);
  const [bookPages, setBookPages] = useState([]);
  const [error, setError] = useState("");
  const [ownProfile, setOwnProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const profileToken = await getUserByToken(token);
      setCurrentUser(profileToken);
      if (profileToken.username === username) {
        setOwnProfile(true);
      }

      if (fetchProfile) {
        // Gets user's movie log
        try {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/movie/log`,
            {
              params: {
                username: username,
              },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          setMovieLog(response.data);
          console.log(response.data);
        } catch (err) {
          console.log(err);
          setError("Failed to load movie log.");
        }

        try {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/tv/log`,
            {
              params: {
                username: username,
              },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          setTvLog(response.data);
          console.log(response.data);
        } catch (err) {
          console.log(err);
          setError("Failed to load TV log.");
        }

        try {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/book/log`,
            {
              params: {
                username: username,
              },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          setLoggedBooks(response.data);
          console.log(response.data);
        } catch (err) {
          console.log(err);
          setError("Failed to load book log.");
        }
      }
    };
    fetchProfile();
  }, [token, username]);

  if (!userData) return <p>Loading...</p>;

  return (
    <div style={{ textAlign: "center", padding: "3rem" }}>
            <Navbar userData={userData} /> 
            <h1>User Statistics: {movieTime}</h1>
    </div>
  );
};

export default Statistics;
