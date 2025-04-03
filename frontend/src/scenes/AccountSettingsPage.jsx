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

const MAX_BIO_LENGTH = 150;

// Define the genre options
const genreOptions = [
  "Comedy",
  "Romance",
  "Crime",
  "Drama",
  "Fantasy",
  "Thriller",
  "Action",
  "Adventure",
  "Sci-Fi",
  "Horror",
  "Mystery",
  "Documentary",
  "Animation",
  "Family",
  "Biography",
];

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    genrePreferences: [],
  });
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

  const handleChange = (e) => {
    if (e.target.name === "bio" && e.target.value.length > MAX_BIO_LENGTH)
      return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler to update genre preferences from the Autocomplete field
  const handleGenreChange = (event, newValue) => {
    setFormData((prevState) => ({
      ...prevState,
      genrePreferences: newValue,
    }));
  };

  const handleSubmit = async () => {
    console.log("Updated user data: ", formData);
    try {
      const response = await axios.patch(
        `http://127.0.0.1:5000/api/users/${userData.username}`,
        {
          bio: formData.bio,
          genrePreferences: formData.genrePreferences,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setFormData((prevData) => ({
        ...prevData,
        bio: response.data.bio,
        genrePreferences: response.data.genrePreferences,
      }));
      setSuccessMessage(true);
    } catch (error) {
      console.error("❌ Error :", error);
    }
  };

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
            Account Settings
          </Typography>
        </Box>
        <ProfilePicture
          userData={userData}
          viewerData={userData}
          token={token}
        />
      </Box>
      <Box
        zIndex={1}
        sx={{ width: "90%", maxWidth: 400, margin: "auto", mt: 3 }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "gray" }}>
            Username
          </Typography>
          <TextField
            fullWidth
            name="username"
            value={formData.username}
            variant="outlined"
            size="small"
            disabled
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "gray" }}>
            Email
          </Typography>
          <TextField
            fullWidth
            name="email"
            value={formData.email}
            variant="outlined"
            size="small"
            disabled
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "gray" }}>
            Bio
          </Typography>
          <TextField
            fullWidth
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            variant="outlined"
            size="small"
            multiline
            rows={4}
            inputProps={{ maxLength: MAX_BIO_LENGTH }}
          />
          <Typography
            variant="caption"
            sx={{ color: "gray", display: "block", textAlign: "right" }}
          >
            {(formData.bio ? formData.bio.length : 0)}/{MAX_BIO_LENGTH} characters used
          </Typography>
        </Box>
        {/* New Genre Preferences Field */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "gray" }}>
            Genre Preferences
          </Typography>
          <Autocomplete
            multiple
            options={genreOptions}
            value={formData.genrePreferences}
            onChange={handleGenreChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} variant="outlined" size="small" />
            )}
          />
        </Box>
        <Button
          variant="text"
          color="secondary"
          fullWidth
          onClick={handleSubmit}
        >
          Submit Changes
        </Button>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(false)}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(false)}>
          Profile updated successfully!{" "}
          <Typography
            sx={{ cursor: "pointer" }}
            color="inherit"
            onClick={() => (window.location.href = `/${userData.username}`)}
          >
            View profile
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountSettingsPage;