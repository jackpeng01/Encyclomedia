import { useDispatch, useSelector } from "react-redux";
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
  TextField,
  MenuItem,
  Select,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../state/authSlice";
import { getUserByToken } from "../api/users";
import React, { useEffect, useState } from "react";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import DemoIcon from "@mui/icons-material/Code";
import LoginModal from "./LoginModal";
import axios from "axios";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUserData = await getUserByToken(token);
      setUserData(fetchedUserData);
    };
    loadUserData();
  }, [token]);

  const [isLoginOpen, setLoginOpen] = useState(false);
  const [signUpMode, setSignUpMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("movies");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/api/book/suggestions?query=${searchQuery}`
        );
        setSuggestions(response.data.suggestions || []);
      } catch (error) {
        console.error("Error fetching book suggestions:", error);
      }
    };

    fetchSuggestions();
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to correct search results page with the query and category
      if (category === "books") {
        navigate(`/booksearch?query=${encodeURIComponent(searchQuery.trim())}`);
        setSuggestions([]);
      } else if (category === "movies") {
        navigate(
          `/search?query=${encodeURIComponent(
            searchQuery.trim()
          )}&category=${category}`
        );
      } else {
        // TV Shows will go here but for now just going to movies
        navigate(
          `/search?query=${encodeURIComponent(
            searchQuery.trim()
          )}&category=${category}`
        );
      }
    }
  };

  const handleListsClick = () => {
    navigate("/myLists");
  };

  const handleLocalDemoClick = () => {
    navigate("/local-lists");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "rgb(255, 255, 255, 0)",
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
              color: "black",
            }}
          >
            <span style={{ fontSize: "1.3em" }}>E</span>NCYCLOMEDI
            <span style={{ fontSize: "1.3em" }}>A</span>
          </Typography>
        </Box>
        {/* Center Section - Search Bar */}
        <Box sx={{ flexGrow: 1, mx: 5 }}>
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: "flex",
              justifyContent: "left",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "60%", // total width of the combined component
                backgroundColor: "white",
                borderRadius: "20px",
                overflow: "hidden", // ensure no radius leaks
                border: "1px solid gray", // unified border
                "&:hover": {
                  borderColor: "black",
                },
              }}
            >
              <TextField
                variant="outlined"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { border: "none" },
                    borderRadius: 0, // remove internal rounding
                    paddingRight: 0, // no gap between inputs
                  },
                  "& .MuiInputBase-root": {
                    height: "15px",
                  },
                }}
              />

              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disableUnderline
                sx={{
                  backgroundColor: "#f4f4f4",

                  minWidth: "100px",
                  height: "30px",
                  borderLeft: "1px solid gray",
                  borderRadius: 0,
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&:hover": {
                    borderColor: "black",
                  },
                  "&.Mui-focused": {
                    borderColor: "black",
                  },
                }}
              >
                <MenuItem value="movies">Movies</MenuItem>
                <MenuItem value="tv">TV</MenuItem>
                <MenuItem value="books">Books</MenuItem>
              </Select>
            </Box>

            {/* Hidden submit button */}
            <button type="submit" style={{ display: "none" }}></button>
          </form>
          {/* Autocomplete Suggestions (Only for Books) */}
          {category === "books" && suggestions.length > 0 && (
            <List
              sx={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "50%",
                backgroundColor: "white",
                boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                borderRadius: "5px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {suggestions.map((suggestion) => (
                <ListItem
                  key={suggestion.id}
                  button="true"
                  onClick={() => {
                    navigate(`/book/${suggestion.id}`);
                    setSearchQuery("");
                    setSuggestions([]);
                  }}
                  sx={{ "&:hover": { backgroundColor: "#f0f0f0" } }}
                >
                  <ListItemText
                    primary={suggestion.title}
                    secondary={suggestion.author}
                    sx={{ color: "black" }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Right Section - Buttons */}
        <Box sx={{ display: "flex", gap: 3 }}>
          <Button
            sx={{
              ml: "10px",
              textTransform: "none",
              fontSize: "1rem",
              color: "black",
              "&:hover": { color: "black" },
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
            onClick={handleListsClick}
            // startIcon={<FormatListBulletedIcon />}
          >
            My Lists
          </Button>
          {userData ? (
            <>
              {/* Profile Button */}
              <Button
                sx={{
                  textTransform: "none",
                  fontSize: "1rem",
                  color: "black",
                  "&:hover": { color: "black" },
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  padding: "6px 10px",
                }}
                onClick={() => (window.location.href = `/${userData.username}`)}
              >
                {/* Profile Picture Inside Button */}
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
