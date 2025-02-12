import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import React, { useState } from "react";

const LoginModal = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [agreed, setAgreed] = useState(false);

  const handleLogin = () => {
    console.log("Logging in with:", { email, password });
    onClose(); // Close modal after login attempt
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          style: {
            backgroundColor: "rgba(255, 255, 255, 0.8)", // Light blue with slight transparency
            backdropFilter: "blur(5px)", // Optional: Adds a blur effect to the background
            padding: "20px",
            borderRadius: "10px",
          },
        },
      }}
    >
      <DialogContent>
        {/* Framer Motion for Smooth Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ textAlign: "center", padding: "20px" }}
        >
          {isSignUp && (
            <motion.img
              src="/encyclomediaglobe.png"
              alt="Logo"
              width="300"
              height="270"
              sx={{ zIndex: 100 }}
              animate={{ rotate: [0, 360] }} // ✅ Rotates once per cycle
              transition={{
                duration: 10, // ✅ Controls how many seconds per rotation
                // ease: "linear", // ✅ Smooth rotation
                //   repeat: Infinity, // ✅ Keeps looping
              }}
            />
          )}
          <Typography
            variant="h5"
            align="left"
            sx={{
              fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
              mb: 2,
            }}
          >
            {isSignUp ? "Be an Encyclomedian." : "Log In"}
          </Typography>
          {isSignUp && (
            <TextField
              label="Username"
              type="username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Typography
            variant="h7"
            align="left"
            sx={{
              mt: 2,
            }}
            onClick={() => {
              setIsSignUp(!isSignUp);
            }}
          >
            {isSignUp
              ? "Already have an account? Login here"
              : "Don't have an account? Sign up here"}
          </Typography>
          {isSignUp && (
            <DialogContent fullWidth>
              <h2>Terms and Conditions</h2>
              {/* Checkbox aligned to the top of the text */}
              <FormControlLabel
                sx={{ alignItems: "flex-start" }} // Aligns checkbox to the top
                control={
                  <Checkbox
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    sx={{ mt: -1 }} // Optional: Adjust spacing slightly
                  />
                }
                label="I am ready to be amazed."
              />
            </DialogContent>
          )}

          <Button
            variant="contained"
            color="white"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleLogin}
          >
            {isSignUp ? "Sign up" : "Log In"}
          </Button>

          <Button
            variant="text"
            color="secondary"
            fullWidth
            sx={{ mt: 1 }}
            onClick={onClose}
          >
            Close
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
