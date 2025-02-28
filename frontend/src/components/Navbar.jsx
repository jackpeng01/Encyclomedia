import { useDispatch, useSelector } from "react-redux";
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
  TextField, MenuItem, Select,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../state/authSlice";
import { getUserByToken } from "../api/users";
import React, { useEffect, useState } from "react";
import LoginModal from "./LoginModal";

const Navbar = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUserData = await getUserByToken(token);
      setUserData(fetchedUserData);
      console.log("userdata: ", userData);
    };
    loadUserData();
  }, [token]);
  const navigate = useNavigate();
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [signUpMode, setSignUpMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("movies"); 


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to correct search results page with the query and category
      if (category === "books") {
        navigate(`/booksearch?query=${encodeURIComponent(searchQuery.trim())}`);
      } else if (category === "movies") {
        navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}&category=${category}`);
      } else {
        // TV Shows will go here but for now just going to movies
        navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}&category=${category}`);
      }
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        // backdropFilter: "blur(10px)",
        backgroundColor: "rgb(255, 255, 255, 0)", // ✅ Light gray for better contrast
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

        {/* ✅ Right Section - Buttons */}
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          {/* ✅ Centers items vertically */}
          {/* ✅ Profile Picture */}
        </Box>
        {/* Center Section - Search Bar */}
        <Box sx={{ flexGrow: 1, mx: 5 }}>
          <form
            onSubmit={handleSearchSubmit}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <TextField
              variant="outlined"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: "50%", // Adjusted width for a more compact look
                backgroundColor: "white",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "gray",
                  },
                  "&:hover fieldset": {
                    borderColor: "black",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "black",
                  },
                  borderRadius: "10px", // More rounded corners
                },
              }}
            />
            {/* Category Dropdown */}
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{
                ml: 2,
                width: "150px",
                backgroundColor: "white",
                borderRadius: "10px",
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'gray' },
                  '&:hover fieldset': { borderColor: 'black' },
                  '&.Mui-focused fieldset': { borderColor: 'black' },
                },
              }}
            >
              <MenuItem value="movies">Movies</MenuItem>
              <MenuItem value="tv">TV Shows</MenuItem>
              <MenuItem value="books">Books</MenuItem>
            </Select>

            {/* Hidden submit button */}
            <button type="submit" style={{ display: "none" }}></button>
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
                onClick={() => (window.location.href = `/${userData.username}`)}
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
              <Button
                sx={{
                  textTransform: "none",
                  //   mt: 2,
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
