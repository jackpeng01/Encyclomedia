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
import { Link, useParams } from "react-router-dom";
import BouncingSphere from "../components/BouncingSphere";
import RotatingButtons from "../components/RotatingButtons";
import LandingPageFooter from "../components/LandingPageFooter";
import LoginModal from "../components/LoginModal";
import ResetPasswordModal from "../components/ResetPassModal";
import ResetPasswordRequestModal from "../components/modals/ResetPasswordRequestModal";

const ResetPassPage = () => {
  const { token } = useParams();
  const [open, setOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [signUpMode, setSignUpMode] = useState(false);
  const [showFootnotes, setShowFootnotes] = useState(false);
  useEffect(() => {
    console.log("token:", token);
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
        {/* modal */}
        {token ? (
          <ResetPasswordModal open={true} token={token} />
        ) : (
          <ResetPasswordRequestModal open={true} token={token} />
        )}
      </Container>
      <LandingPageFooter showFootnotes={showFootnotes} />
    </Box>
  );
};

export default ResetPassPage;
