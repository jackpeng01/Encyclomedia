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
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser, checkUsernameUnique, loginUser } from "../api/Login";
import { setToken } from "../state/authSlice";
import { WaveText } from "./WaveText";

const LoginModal = ({ open, onClose, signUp, setSignUp }) => {
  const bubbleAnimation = {
    hidden: { scale: 0.1, opacity: 1 },
    visible: {
      scale: 1.1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [successfulSignUp, setSuccessfulSignUp] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Error states for validation
  const [errors, setErrors] = useState({
    email: false,
    password: false,
    username: false,
    agreed: false,
  });

  // ✅ Password validation regex: At least 12 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const sanitizeInput = (input) => {
    return input.replace(/[:;\\/]/g, "");
  };

  const validateFields = () => {
    const newErrors = {
      email: !emailRegex.test(email), // ✅ Validates email format
      password: !passwordRegex.test(password), // ✅ Validates password strength
      username: signUp && !username.trim(),
      agreed: signUp && !agreed,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).includes(true); // Returns true if no errors
  };

  const handleLogin = async () => {
    if (!validateFields()) return;
  
    try {
      const response = await loginUser(email, password);
      console.log("Login successful:", response);
      dispatch(setToken(response.token));
  
      // Check if we're already on the home page
      if (window.location.pathname === "/") {
        // Redirect to /home if we're on the root path
        navigate("/home");
      } else {
        // Reload the page otherwise
        window.location.reload();
      }
    } catch (error) {
      console.error("❌ Error logging in:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: true,
        password: true,
      }));
    }
  };

  const handleSignUp = async () => {
    if (!validateFields()) return;
    try {
      const isUsernameUnique = await checkUsernameUnique(username);
      if (!isUsernameUnique) {
        setErrors((prevErrors) => ({ ...prevErrors, username: true }));
        return;
      }
      const newUser = { username, email, password };
      console.log("Signing up with: ", newUser);
      await addUser(newUser);
      setPassword("");
      setSignUp((prev) => !prev);
      setSuccessfulSignUp(true);
    } catch (error) {
      console.error("❌ Error adding user:", error);
      throw error;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setPassword("");
        setErrors({ ...false });
        setSuccessfulSignUp(false);
        onClose();
      }}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          style: {
            // filter: "invert(1)",
            // backgroundColor: "#FFF",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(5px)",
            // padding: "20px",
            borderRadius: "10px",
          },
        },
      }}
    >
      <div
        // style={{
        //   filter: "invert(1)",
        //   backgroundColor: "#FFF",
        //   // padding: "20px",
        // }}
      >
        <DialogContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ textAlign: "center", padding: "10px" }}
          >
            {(signUp || successfulSignUp) && (
              <motion.img
                src="/encyclomediaglobe.png"
                alt="Logo"
                width="300"
                height="270"
                sx={{ zIndex: 100 }}
                animate={
                  successfulSignUp
                    ? { rotate: [0, 360] }
                    : { rotate: [45, -15, 45] }
                }
                transition={
                  successfulSignUp
                    ? { duration: 1, repeat: 1, ease: "easeInOut" }
                    : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }
              />
            )}
            <Typography
              variant="h5"
              align={signUp || successfulSignUp ? "center" : "left"}
              sx={{
                fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
                mb: 2,
              }}
            >
              {signUp ? (
                <WaveText keyProp="signup" text={"Be an Encyclomedian."} />
              ) : successfulSignUp ? (
                <WaveText
                  keyProp="thank"
                  text={"Thank you for joining Encyclomedia!"}
                />
              ) : (
                <WaveText keyProp="login" text={"Welcome back."} />
              )}
            </Typography>
            {successfulSignUp && (
              <Typography
                variant="h7"
                // align={signUp ? "center" : "left"}
                sx={{
                  fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
                  mb: 2,
                }}
              >
                {"Log in to get started"}
              </Typography>
            )}

            {signUp && (
              <TextField
                label="Username"
                type="text"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={async (e) => {
                  const sanitizedUsername = sanitizeInput(e.target.value);
                  setUsername(sanitizedUsername);
                  if (signUp) {
                    const isUnique = await checkUsernameUnique(
                      sanitizedUsername
                    );
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      username: !isUnique,
                    }));
                  }
                }}
                error={errors.username}
                helperText={
                  errors.username
                    ? username.length > 0
                      ? "Username is already taken"
                      : "Username is required"
                    : ""
                }
              />
            )}

            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(sanitizeInput(e.target.value))}
              error={errors.email}
              helperText={errors.email ? "Invalid email" : ""}
            />

            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(sanitizeInput(e.target.value))}
              error={errors.password}
              helperText={
                errors.password
                  ? "Password must be at least 12 characters, contain one uppercase, one lowercase, and one number."
                  : ""
              }
            />

            {!successfulSignUp && (
              <Typography
                variant="h7"
                align="left"
                sx={{
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={() => setSignUp((prev) => !prev)}
              >
                {signUp
                  ? "Already have an account? Log in"
                  : "Don't have an account? Sign up"}
              </Typography>
            )}

            {signUp && (
              <DialogContent fullWidth>
                <h2>Terms and Conditions</h2>
                <FormControlLabel
                  sx={{
                    alignItems: "flex-start",
                    ".MuiTypography-root": { textAlign: "left" },
                  }}
                  control={
                    <Checkbox
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      sx={{ mt: -1 }}
                    />
                  }
                  label="By checking this box, I consent to having my organs harvested."
                />
                {errors.agreed && (
                  <Typography color="error" variant="body2">
                    You must agree to continue.
                  </Typography>
                )}
              </DialogContent>
            )}

            <Button
              variant="contained"
              color="white"
              fullWidth
              sx={{ mt: 2 }}
              onClick={signUp ? handleSignUp : handleLogin}
            >
              {signUp ? "Sign up" : "Log In"}
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
      </div>
    </Dialog>
  );
};

export default LoginModal;
