import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BouncingSphere from "../components/BouncingSphere";
import RotatingButtons from "../components/RotatingButtons";
import LandingPageFooter from "../components/LandingPageFooter";
import LoginModal from "../components/LoginModal";

const LandingPage = () => {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [signUpMode, setSignUpMode] = useState(false);
  const [showFootnotes, setShowFootnotes] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;

      setShowFootnotes(scrolledToBottom);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
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
          backgroundColor: "rgba(255,255,255,0)", // ✅ Transparent black background
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
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => (window.location.href = "/home")}
          >
            <Typography
              variant="h7"
              sx={{
                fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
                fontWeight: 100,
                ml: 1, // Add some margin to the left of the text
                color: "black",
              }}
            >
              <span style={{ fontSize: "1.3em" }}>E</span>NCYCLOMEDI
              <span style={{ fontSize: "1.3em" }}>A</span>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            <Button
              sx={{
                textTransform: "none",
                mt: 2,
                fontSize: "1rem",
                color: "black",
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
                color: "black",
              }}
              component={Link}
              onClick={() => {
                setSignUpMode(false);
                setLoginOpen(true);
              }}
              color="inherit"
            >
              Log in
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
      <Container
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "150vh",
          pt: "400px",
          pb: "800px",
          textAlign: "center",
        }}
      >
        {/* ✅ Logo */}
        <Box
          sx={{
            position: "fixed", // ✅ Ensures it stays behind other elements
            top: 0,
            left: 0,
            width: "50vw",
            height: "50vh",
            // zIndex: 100, // ✅ Places it behind UI elements
            pointerEvents: "none",
          }}
        >
          <BouncingSphere />
        </Box>
        ;
        <motion.img
          src="/encyclomediaglobe.png"
          alt="Logo"
          width="600"
          height="600"
          style={{ opacity: 0.9,  zIndex: 100 }}
          animate={{ rotate: [0, 360] }} // ✅ Rotates once per cycle
          transition={{
            duration: 10, // ✅ Controls how many seconds per rotation
            ease: "easeInOut", // ✅ Smooth rotation
            repeat: Infinity, // ✅ Keeps looping
            // delay: 4,
          }}
        />
        <Typography
          variant="h3"
          sx={{
            fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 100,
          }}
        >
          <span style={{ fontSize: "1.3em" }}>E</span>NCYCLOMEDI
          <span style={{ fontSize: "1.3em" }}>A</span>
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 100,
          }}
        >
          Entertainment for All
        </Typography>
        <Typography
          variant="h6"
          color="darkGrey"
          mt="40px"
          sx={{
            fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 100,
          }}
        >
          Track all entertainment mediums in one place.
        </Typography>
        <Typography
          variant="h6"
          color="darkGrey"
          sx={{
            fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 100,
          }}
        >
          Every. Single. Medium.*
        </Typography>
        <Typography
          variant="h6"
          color="darkGrey"
          sx={{
            fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 100,
          }}
        >
          You name it, we have it.
        </Typography>
        {/* ✅ Button */}
        <Box
          sx={{
            position: "relative",
            zIndex: 100, // ✅ Ensures it's above the sphere
          }}
        >
          <RotatingButtons
            onClick={() => {
              setSignUpMode(true);
              setLoginOpen(true);
            }}
          />
        </Box>
      </Container>
      <LandingPageFooter showFootnotes={showFootnotes} />
    </Box>
  );
};

export default LandingPage;
