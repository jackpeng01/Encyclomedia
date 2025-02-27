import { Box, Typography, TextField, Button, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";
import ProfilePicture from "../components/modals/ProfilePicture";

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
  });
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Updated user data: ", formData);
    // Add API call to update user info here
  };

  if (!userData) return <p>Loading...</p>;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Navbar userData={userData} />
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <ProfilePicture
          userData={userData}
          viewerData={userData}
          token={token}
        />
      </Box>

      <Box sx={{ width: "90%", maxWidth: 400, margin: "auto", mt: 3 }}>
        {[
          { label: "Username", name: "username", value: formData.username },
          { label: "Email", name: "email", value: formData.email },
          { label: "Bio", name: "bio", value: formData.bio },
        ].map((field, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "gray" }}>
              {field.label}
            </Typography>
            <TextField
              fullWidth
              name={field.name}
              value={field.value}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Box>
        ))}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
        >
          Submit Changes
        </Button>
      </Box>
    </Box>
  );
};

export default AccountSettingsPage;
