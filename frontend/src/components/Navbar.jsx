import { AppBar, Box, Button, Toolbar, Typography, TextField } from "@mui/material";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../state/authSlice";
import LoginModal from "./LoginModal"; // Ensure the correct path for LoginModal
import { useState } from "react";

const Navbar = ({ userData }) => {
  const dispatch = useDispatch();
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [signUpMode, setSignUpMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search results page with the query
      window.location.href = `/search?query=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.49)",
        boxShadow: "none",
        width: "100vw",
        left: 0,
        right: 0,
      }}
      style={{
        zIndex: 1000,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", width: "100%", px: 10 }}>
        {/* Left Section - Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h7"
            sx={{
              fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
              fontWeight: 100,
              ml: 1,
              color: "black",
            }}
          >
            <span style={{ fontSize: "1.3em" }}>E</span>NCYCLOMEDI
            <span style={{ fontSize: "1.3em" }}>A</span>
          </Typography>
        </Box>

        {/* Center Section - Search Bar */}
        <Box sx={{ flexGrow: 1, mx: 5 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", justifyContent: "center" }}>
            <TextField
              variant="outlined"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: "60%",
                backgroundColor: "white",
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'gray',
                  },
                  '&:hover fieldset': {
                    borderColor: 'black',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'black',
                  },
                },
              }}
            />
          </form>
        </Box>

        {/* Right Section - Buttons */}
        <Box sx={{ display: "flex", gap: 3 }}>
          <Button
            sx={{
              textTransform: "none",
              mt: 2,
              fontSize: "1rem",
              color: "black",
              "&:hover": { color: "black" },
            }}
            component={Link}
            to={`/profile/${userData?.username}`}
          >
            Profile
          </Button>

          <Button
            sx={{
              textTransform: "none",
              mt: 2,
              fontSize: "1rem",
              color: "black",
              "&:hover": { color: "black" },
            }}
            onClick={() => {
              dispatch(setToken(null));
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
