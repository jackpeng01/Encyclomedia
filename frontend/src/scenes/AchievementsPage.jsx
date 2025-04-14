import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Autocomplete,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";
import ProfilePicture from "../components/modals/ProfilePicture";
import { motion } from "framer-motion";
import BouncingSphere from "../components/BouncingSphere";
import axios from "axios";
import { setDarkMode } from "../state/userSlice";

const ACHIEVEMENTS_INFO = {
  "5_books": {
    name: "Plato",
    icon: "📚",
    description: "Read 5 books.",
  },
  read_10_in_a_month: {
    name: "Speed Reader",
    icon: "🤓",
    description: "Read 10 books in a single month.",
  },
  all_genres: {
    name: "Genre Explorer",
    icon: "🧭",
    description: "Logged a book in every genre.",
  },
  // Add more achievements as needed
};

const AchievementsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    genrePreferences: [],
  });
  const location = useLocation();
  const newAchievement = location.state?.newAchievement;
  const [successMessage, setSuccessMessage] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const isDarkMode = useSelector((state) => state.user.isDarkMode);

  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUserData = await getUserByToken(token);
      setUserData(fetchedUserData);
      setFormData({
        username: fetchedUserData.username || "",
        email: fetchedUserData.email || "",
        bio: fetchedUserData.bio || "",
        // If the API returns genre preferences, use them; otherwise default to an empty array
        genrePreferences: fetchedUserData.genrePreferences || [],
      });
    };
    loadUserData();
  }, [token]);

  if (!userData) return <p>Loading...</p>;

  return (
    <Box
      sx={{
        alignItems: "left",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        position: "relative",
        pt: "100px",
        pb: "400px",
      }}
    >
      <Box
        sx={{
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          position: "fixed",
          top: "10vh",
          bottom: "10vh",
          left: "20vw",
          width: "60vw",
          height: "80vh",
          backdropFilter: "blur(5px)",
          backgroundColor: "rgba(255, 255, 255, .8)",
          borderRadius: "20px",
          zIndex: -1,
        }}
      />

      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "50vw",
          height: "50vh",
          zIndex: -100,
          pointerEvents: "none",
        }}
      >
        <BouncingSphere />
      </Box>

      <Navbar userData={userData} />
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Box
          sx={{ cursor: "pointer" }}
          onClick={() => {
            dispatch(setDarkMode(!isDarkMode));
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
              mb: "30px",
            }}
          >
            Achievements
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 3,
          mt: 4,
          px: 4,
        }}
      >
        {(userData.achievements || []).map((key) => {
          const info = ACHIEVEMENTS_INFO[key] || {
            name: key,
            icon: "🏆",
            description: "Unknown achievement.",
          };

          const isNew = key === newAchievement;

          return (
            <motion.div
              key={key}
              initial={isNew ? { scale: 0.8, opacity: 0 } : false}
              animate={isNew ? { scale: 1.1, opacity: 1 } : false}
              transition={
                isNew ? { duration: 0.6, type: "spring", bounce: 0.4 } : {}
              }
            >
              <Box
                sx={{
                  width: 250,
                  height: 180,
                  backgroundColor: "white",
                  borderRadius: "20px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  p: 2,
                }}
              >
                <Typography variant="h3" sx={{ fontSize: 40 }}>
                  {info.icon}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {info.name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "gray" }}>
                  {info.description}
                </Typography>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
};

export default AchievementsPage;
