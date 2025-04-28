import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserByToken } from "../api/users";
import BouncingSphere from "../components/BouncingSphere";
import Navbar from "../components/Navbar";
import ProfilePicture from "../components/modals/ProfilePicture";
import { setDarkMode } from "../state/userSlice";

const MAX_BIO_LENGTH = 150;

const BlockedListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    genrePreferences: [],
  });
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
            Blocked Users
          </Typography>
        </Box>
        <Box sx={{ mt: 4 }}>
          {userData.blocked && userData.blocked.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              {userData.blocked.map((username, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ mb: 1, fontSize: "1.2rem" }}>
                    {username}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={async () => {
                      try {
                        const updatedBlocked = userData.blocked.filter(
                          (u) => u !== username
                        );
                        await axios.patch(
                          `http://127.0.0.1:5000/api/users/${userData.username}`,
                          { blocked: updatedBlocked },
                          { withCredentials: true }
                        );
                        setUserData((prev) => ({
                          ...prev,
                          blocked: updatedBlocked,
                        }));
                      } catch (err) {
                        console.error("Failed to unblock user:", err);
                      }
                    }}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.9rem",
                      borderRadius: "20px",
                    }}
                  >
                    Unblock
                  </Button>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography>No blocked users.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default BlockedListPage;
