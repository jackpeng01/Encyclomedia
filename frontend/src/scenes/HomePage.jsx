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
import BouncingSphere from "../helpers/BouncingSphere";
import RotatingButtons from "../helpers/RotatingButtons";
import HomePageFooter from "../helpers/HomePageFooter";
import LoginModal from "../helpers/LoginModal";

const HomePage = () => {
  const [isLoginOpen, setLoginOpen] = useState(false);
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
        <Toolbar sx={{ justifyContent: "space-between", width: "100%", px: 3 }}>
          {/* Left Side: Logo or Brand Name */}
          <Typography
            variant="h7"
            sx={{
              fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
              fontWeight: 100,
            }}
          >
            <span style={{ fontSize: "1.3em" }}>E</span>NCYCLOMEDI
            <span style={{ fontSize: "1.3em" }}>A</span>
          </Typography>

          {/* Right Side: Navigation Links */}
          <Box sx={{ display: "flex", gap: 3 }}>
            <Button
              sx={{
                textTransform: "none",
                mt: 2,
                fontSize: "1rem",
              }}
              component={Link}
              to="/about"
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
                setLoginOpen(true);
              }}
              color="inherit"
            >
              Login / Signup
            </Button>
            <LoginModal
              open={isLoginOpen}
              onClose={() => setLoginOpen(false)}
              sx={{z:101}}
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
        <motion.div
          initial={{ opacity: -1 }} // ✅ Start at zero size
          animate={{ opacity: 1 }} // ✅ Expand to full size
          transition={{ duration: 5, ease: "easeOut" }} // ✅ Smooth transition
        >
          <Box
            sx={{
              position: "fixed", // ✅ Ensures it stays behind other elements
              top: 0,
              left: 0,
              width: "50vw",
              height: "50vh",
              zIndex: 100, // ✅ Places it behind UI elements
              pointerEvents: "none",
            }}
          >
            <BouncingSphere />
          </Box>
        </motion.div>
        ;
        <motion.img
          src="/encyclomediaglobe.png"
          alt="Logo"
          width="300"
          height="270"
          sx={{ zIndex: 100 }}
          // animate={{ rotate: [0, 360] }} // ✅ Rotates once per cycle
          // transition={{
          //   duration: 10, // ✅ Controls how many seconds per rotation
          //   // ease: "linear", // ✅ Smooth rotation
          //   repeat: Infinity, // ✅ Keeps looping
          // }}
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
          <RotatingButtons />
        </Box>
      </Container>
      <HomePageFooter showFootnotes={showFootnotes} />
    </Box>
  );
};

export default HomePage;
