import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../state/authSlice";
import LoginModal from "./LoginModal"; // Ensure the correct path for LoginModal
import { useState } from "react";

const Navbar = ({ userData }) => {
  const dispatch = useDispatch();
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [signUpMode, setSignUpMode] = useState(false);

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.49)", // ✅ Light gray for better contrast
        boxShadow: "none",
        width: "100vw",
        left: 0,
        right: 0,
      }}
      style={{
        zIndex: 1000, // ✅ Keeps navbar on top
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", width: "100%", px: 10 }}>
        {/* ✅ Left Section - Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h7"
            sx={{
              fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
              fontWeight: 100,
              ml: 1,
              color: "black", // ✅ Ensures black text
            }}
          >
            <span style={{ fontSize: "1.3em" }}>E</span>NCYCLOMEDI
            <span style={{ fontSize: "1.3em" }}>A</span>
          </Typography>
        </Box>

        {/* ✅ Right Section - Buttons */}
        <Box sx={{ display: "flex", gap: 3 }}>
          <Button
            sx={{
              textTransform: "none",
              mt: 2,
              fontSize: "1rem",
              color: "black", // ✅ Ensures black text
              "&:hover": { color: "black" }, // ✅ Ensures hover text remains black
            }}
            component={Link}
            to={`/profile/${userData?.username}`} // ✅ Avoid errors if userData is null
          >
            Profile
          </Button>

          <Button
            sx={{
              textTransform: "none",
              mt: 2,
              fontSize: "1rem",
              color: "black", // ✅ Ensures black text
              "&:hover": { color: "black" }, // ✅ Ensures hover text remains black
            }}
            onClick={() => {
              dispatch(setToken(null)); // ✅ Logout action
            }}
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
  );
};

export default Navbar;
