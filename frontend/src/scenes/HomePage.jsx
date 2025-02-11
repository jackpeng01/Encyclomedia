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

const footnotes = [
  { id: "fn1", symbol: "*", text: "That's right. No disclaimers. Sue us." },
  { id: "fn2", symbol: "†", text: "Please do not sue us." },
];

const HomePage = () => {
  const [showFootnotes, setShowFootnotes] = useState(false);
  const [showSecondFootnote, setShowSecondFootnote] = useState(false);

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
              to="/login"
              color="inherit"
            >
              Login/Signup
            </Button>
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
            zIndex: 999999, // ✅ Ensures it's above the sphere
          }}
        >
          <RotatingButtons />
        </Box>
      </Container>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={showFootnotes ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
        transition={{ duration: 3, ease: "easeOut" }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "10px 20px",
          boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "left",
        }}
      >
        {/* ✅ First Footnote */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%", // ✅ Ensures full width
            textAlign: "left", // ✅ Keeps left-aligned text
          }}
        >
          {/* ✅ Left-Aligned Text */}
          <p
            style={{
              fontSize: "14px",
              color: "#555",
              // margin: "5px 0",
              flex: 1,
            }}
          >
            <strong>*</strong> That's right. No disclaimers.{" "}
            <span
              style={{
                textDecoration: "underline",
                color: "blue",
                cursor: "pointer",
              }}
              onClick={() => setShowSecondFootnote(true)}
            >
              Sue
            </span>{" "}
            us.
          </p>

          {/* ✅ Center-Aligned Text */}
          <p
            style={{
              fontSize: "14px",
              color: "#555",
              // flex: 1,
              textAlign: "center",
            }}
          >
            By reading this you transfer legal ownership of your soul to
            Encyclomedia. All rights reserved {new Date().getFullYear()} ©.
          </p>
        </div>

        {/* ✅ Second Footnote (Appears only when clicked) */}
        {showSecondFootnote && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ fontSize: "14px", color: "#555", margin: "5px 0" }}
          >
            <strong>†</strong> Please do not sue us.
          </motion.p>
        )}
      </motion.div>
    </Box>
  );
};

export default HomePage;
