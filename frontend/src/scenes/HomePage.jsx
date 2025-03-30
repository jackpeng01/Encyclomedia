import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";

const HomePage = () => {
  const token = useSelector((state) => state.auth.token);

  const [isLoginOpen, setLoginOpen] = useState(false);
  const [signUpMode, setSignUpMode] = useState(false);
  const [showFootnotes, setShowFootnotes] = useState(false);
  const [userData, setUserData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUserData = await getUserByToken(token);
      setUserData(fetchedUserData);
      console.log("userdata: ", userData);
    };
    loadUserData();
  }, [token]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // ✅ Ensures full viewport height
        // width: "100vw", // ✅ Forces it to take full width
        overflowX: "hidden", // ✅ Prevents unwanted horizontal scrolling
      }}
    >
      {/* ✅ Top Bar */}
      <Navbar userData={userData} />
      {/* ✅ Main Content */}
      <Box
        sx={{
          fullWidth: true,
          mt: 10, // Margin top to push it below the AppBar
          textAlign: "left", // Align text to the left
          px: 10, // Padding on the sides
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome {userData.username}
        </Typography>
        <Typography variant="body1">
          Your one-stop destination for all things media. Explore, learn, and
          enjoy!
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
