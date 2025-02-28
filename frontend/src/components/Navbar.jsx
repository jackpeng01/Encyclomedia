import { AppBar, Box, Button, Toolbar, Typography, TextField, MenuItem, Select, List, ListItem, ListItemText } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken } from "../state/authSlice";
import LoginModal from "./LoginModal"; // Ensure the correct path for LoginModal
import { useState, useEffect } from "react";
import axios from "axios";

const Navbar = ({ userData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
            const response = await axios.get(`http://127.0.0.1:5000/api/book/suggestions?query=${searchQuery}`);
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
                component={Link}
                to={`/${userData?.username}`} 
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
