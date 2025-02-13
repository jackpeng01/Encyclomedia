import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import { setToken } from "../state/authSlice";

const HomePage = () => {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [signUpMode, setSignUpMode] = useState(false);
  const [showFootnotes, setShowFootnotes] = useState(false);
  const dispatch = useDispatch();

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
      <AppBar
        position="fixed" // ✅ Ensures the bar is fixed to the top
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.7)", // ✅ Transparent black background
          boxShadow: "none", // ✅ Removes shadow
          width: "100vw",
          left: 0,
          right: 0,
        }}
        style={{
          zIndex: 1000, // ✅ Sends it behind all elements
        }}
      >
        <Toolbar
          sx={{ justifyContent: "space-between", width: "100%", px: 10 }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <motion.img
              src="/encyclomediaglobe.png"
              alt="Logo"
              width="80"
              height="70"
              style={{ opacity: 0.4 }} // Slightly transparent
            />
            <Typography
              variant="h7"
              sx={{
                fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
                fontWeight: 100,
                ml: 1, // Add some margin to the left of the text
              }}
            >
              <span style={{ fontSize: "1.3em" }}>E</span>NCYCLOMEDI
              <span style={{ fontSize: "1.3em" }}>A</span>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Button
              sx={{
                textTransform: "none",
                mt: 2,
                fontSize: "1rem",
              }}
              component={Link}
              to="/data"
              color="inherit"
            >
              About
            </Button>
            <Button
              sx={{
                textTransform: "none",
                mt: 2,
                fontSize: "1rem",
              }}
              component={Link}
              onClick={() => {
                dispatch(setToken(null));
              }}
              color="inherit"
            >
              Logout
            </Button>
            <LoginModal
              signUp={signUpMode}
              setSignUp={setSignUpMode}
              open={isLoginOpen}
              onClose={() => setLoginOpen(false)}
              sx={{ z: 101 }}
            />
          </Box>
        </Toolbar>
      </AppBar>
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
          Welcome to Encyclomedia
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
