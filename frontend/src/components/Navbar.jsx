import { AppBar, Box, Button, Toolbar, Typography, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../state/authSlice";
import LoginModal from "./LoginModal"; // Ensure the correct path for LoginModal
import { useState } from "react";

const Navbar = ({ userData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
        backgroundColor: "rgb(255, 255, 255)", // ✅ Light gray for better contrast
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
        {/* ✅ Left Section - Logo */}
        <Box
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => (window.location.href = "/home")}
        >
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
                width: "50%", // Adjusted width for a more compact look
                backgroundColor: "white",
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
                  borderRadius: "10px", // More rounded corners
                },
              }}
            />
          </form>
        </Box>

        {/* Right Section - Buttons */}
        <Box sx={{ display: "flex", gap: 3 }}>
          {userData ? (
            <>
              {/* Profile Button */}
              <Button
                sx={{
                  textTransform: "none",
                  fontSize: "1rem",
                  color: "black", // ✅ Ensures black text
                  "&:hover": { color: "black" }, // ✅ Keeps text black on hover
                  display: "flex",
                  alignItems: "center", // ✅ Ensures image and text are aligned
                  gap: 1.5, // ✅ Adds spacing between the image and text
                  padding: "6px 10px", // ✅ Adds padding for better clickability
                }}
                component={Link}
                to={`/${userData?.username}`} // ✅ Navigates to profile
              >
                {/* ✅ Profile Picture Inside Button */}
                <img
                  src={userData.profilePicture}
                  alt="Profile"
                  width="40"
                  height="40"
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                {userData.username}
              </Button>

              {/* Logout Button */}
              <Button
                sx={{
                  textTransform: "none",
                  fontSize: "1rem",
                  color: "black",
                  "&:hover": { color: "black" },
                }}
                onClick={() => {
                  dispatch(setToken(null));
                  window.location.reload();
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            // Show Login button if user is not logged in
            <Button
              sx={{
                textTransform: "none",
                fontSize: "1rem",
                color: "black",
                "&:hover": { color: "black" },
              }}
              onClick={() => setLoginOpen(true)} // Open LoginModal on click
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* LoginModal - This will be displayed if isLoginOpen is true */}
      <LoginModal
        open={isLoginOpen}
        onClose={() => setLoginOpen(false)} // Close the modal when the user clicks outside or presses the close button
        signUpMode={signUpMode}
        setSignUpMode={setSignUpMode} // To toggle between Login and SignUp modes
      />
    </AppBar>
  );
};

export default Navbar;
