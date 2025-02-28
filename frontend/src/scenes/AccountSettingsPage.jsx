import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";
import ProfilePicture from "../components/modals/ProfilePicture";
import { motion } from "framer-motion";
import BouncingSphere from "../components/BouncingSphere";
import axios from "axios";

const MAX_BIO_LENGTH = 150;

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
  });
  const [successMessage, setSuccessMessage] = useState(false);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUserData = await getUserByToken(token);
      setUserData(fetchedUserData);
      setFormData({
        username: fetchedUserData.username || "",
        email: fetchedUserData.email || "",
        bio: fetchedUserData.bio || "",
      });
    };
    loadUserData();
  }, [token]);

  const handleChange = (e) => {
    if (e.target.name === "bio" && e.target.value.length > MAX_BIO_LENGTH)
      return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    console.log("Updated user data: ", formData);
    try {
      const response = await axios.patch(
        `http://127.0.0.1:5000/api/users/${userData.username}`,
        {
          bio: formData.bio,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setFormData(response.data);
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
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, .8)",
          borderRadius: "20px",
          zIndex: -1,
        }}
      />
      <motion.div
        initial={{ opacity: -1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 5, ease: "easeOut" }}
      >
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "50vw",
            height: "50vh",
            zIndex: -2,
            pointerEvents: "none",
          }}
        >
          <BouncingSphere />
        </Box>
      </motion.div>
      <Navbar userData={userData} />
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            mb: "30px",
          }}
        >
          Account Settings
        </Typography>
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
            {formData.bio.length}/{MAX_BIO_LENGTH} characters used
          </Typography>
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
