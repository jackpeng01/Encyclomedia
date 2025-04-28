import {
  Box,
  Typography
} from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getUserByToken } from "../api/users";
import BouncingSphere from "../components/BouncingSphere";
import Navbar from "../components/Navbar";
import { setDarkMode } from "../state/userSlice";

const ACHIEVEMENTS_INFO = {
  "5_books": {
    name: "Plato",
    icon: "📚",
    description: "Read 5 books.",
  },
  "6_books": {
    name: "Aristotle",
    icon: "🤓",
    description: "Read 6 books.",
  },
  "7_books": {
    name: "Socrates",
    icon: "🧭",
    description: "Read 7 books.",
  },
  "8_books": {
    name: "Morons",
    icon: "🤠",
    description: "You fell victim to one of the classic blunders!",
  }
};

const AchievementsPage = () => {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const newAchievement = location.state?.newAchievement;
  const [highlighted, setHighlighted] = useState(null);
  const token = useSelector((s) => s.auth.token);
  const isDarkMode = useSelector((s) => s.user.isDarkMode);

  // Load user
  useEffect(() => {
    getUserByToken(token).then(setUserData);
  }, [token]);

  // Whenever location.state.newAchievement changes, trigger highlight,
  // then clear it after the animation duration (800ms).
  useEffect(() => {
    if (newAchievement) {
      setHighlighted(newAchievement);
      const t = setTimeout(() => setHighlighted(null), 900);
      return () => clearTimeout(t);
    }
  }, [newAchievement]);

  if (!userData) return <p>Loading...</p>;

  return (
    <Box sx={{ pt: 12, pb: 10, px: 4 }}>
      <Navbar userData={userData} />

      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ cursor: "pointer" }}
        onClick={() => dispatch(setDarkMode(!isDarkMode))}
      >
        Achievements
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 3,
          mt: 4,
        }}
      >
        {(userData.achievements || []).map((key) => {
          const info = ACHIEVEMENTS_INFO[key] || {
            name: key,
            icon: "🏆",
            description: "Unknown achievement.",
          };
          const isNew = key === highlighted;

          return (
            <motion.div
              key={key}
              initial={isNew ? { scale: 0.5, rotate: 0, opacity: 0 } : undefined}
              animate={isNew ? {
                scale: [1.2, 0.9, 1],
                rotate: [0, 360],
                opacity: 1
              } : undefined}
              transition={isNew ? {
                duration: 0.8,
                times: [0, 0.5, 1],
                ease: "easeOut"
              } : undefined}
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