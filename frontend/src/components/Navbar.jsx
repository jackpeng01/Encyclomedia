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
  Menu,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../state/authSlice";
import { getUserByToken } from "../api/users";
import React, { useEffect, useState, useRef } from "react";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LoginModal from "./LoginModal";
import axios from "axios";
import { setDarkMode } from "../state/userSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.auth.token);
  const isDarkMode = useSelector((state) => state.user.isDarkMode);
  const [userData, setUserData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const searchInputRef = useRef(null);
  const selectRef = useRef(null);

  const MIN_PLOT_LENGTH = 10; // Minimum number of characters
  const MAX_PLOT_LENGTH = 300; // Maximum number of characters
  const [plotError, setPlotError] = useState("");

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
      // Clear suggestions if search query is too short
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        if (category === "books") {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/book/suggestions?query=${searchQuery}`
          );
          setSuggestions(response.data.suggestions || []);
        } else if (category === "movies") {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/movie/suggestions?query=${searchQuery}`
          );
          setSuggestions(response.data.suggestions || []);
        } else if (category === "tv") {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/tv/suggestions?query=${searchQuery}`
          );
          setSuggestions(response.data.suggestions || []);
        } else if (category === "music") {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/music/search?q=${encodeURIComponent(searchQuery)}`
          );
          setSuggestions(response.data || []);
        }
      } catch (error) {
        console.error(`Error fetching ${category} suggestions:`, error);
      }
    };

    fetchSuggestions();
  }, [searchQuery, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (category === "users") {
        navigate(
          `/discover/users?query=${encodeURIComponent(
            searchQuery.trim()
          )}&category=${category}`
        );
      } else if (searchQuery.trim()) {
        // Redirect to correct search results page with the query and category
        if (category === "movies") {
          navigate(
            `/search?query=${encodeURIComponent(
              searchQuery.trim()
            )}&category=${category}`
          );
        } else if (category === "books") {
          navigate(
            `/booksearch?query=${encodeURIComponent(searchQuery.trim())}`
          );
          setSuggestions([]);
        } else if (category === "plot") {
          if (searchQuery.length < MIN_PLOT_LENGTH) {
            alert(`Plot must be at least ${MIN_PLOT_LENGTH} characters.`);
            return;
          } else if (searchQuery.length > MAX_PLOT_LENGTH) {
            alert(`Plot must be no more than ${MAX_PLOT_LENGTH} characters.`);
            return;
          } else {
            setPlotError(""); // Clear any previous error
            navigate(`/plot-search?query=${searchQuery.trim()}`);
          }
        } else if (category === "movies") {
          navigate(
            `/search?query=${encodeURIComponent(
              searchQuery.trim()
            )}&category=${category}`
          );
        } else if (category === "music") {
          navigate(
            `/musicsearch?query=${encodeURIComponent(searchQuery.trim())}`
          );
        } else if (category === "tv") {
          navigate(`/tvsearch?query=${encodeURIComponent(
            searchQuery.trim()
          )}&category=${category}`);
        } else if (category === "authors") {
          navigate(`/searchauthor?query=${encodeURIComponent(
            searchQuery.trim()
          )}&category=${category}`);
        }
        else if (category === "people") {
          navigate(
            `/searchpeople?query=${encodeURIComponent(
              searchQuery.trim()
            )}&category=${category}`
          );
        }
      }
    }
  };

  // Handle dropdown menu for profile button
  const handleProfileButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate(`/${userData.username}`);
    handleMenuClose();
  };

  const handleLists = () => {
    navigate("/myLists");
    handleMenuClose();
  };

  const handleToggleDarkMode = () => {
    dispatch(setDarkMode(!isDarkMode));
    handleMenuClose();
  };

  const handleCategoryClick = (cat) => {
    setCategory(cat);

    // Ensure the dropdown closes before refocusing on search
    if (selectRef.current) {
      const selectElement = selectRef.current;
      if (selectElement.parentElement) {
        selectElement.parentElement.blur(); // Manually blur the Select component
      }
    }

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
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
        zIndex: 10000,
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
            }}
          >
            <span style={{ fontSize: "1.3em" }}>E</span>NCYCLOMEDI
            <span style={{ fontSize: "1.3em" }}>A</span>
          </Typography>
        </Box>

        {/* Center Section - Search Bar */}
        <Box sx={{ flexGrow: 1, mx: 5, position: "relative" }}>
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
                width: "60%",
                backgroundColor: "white",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid gray",
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
                inputRef={searchInputRef}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { border: "none" },
                    borderRadius: 0,
                    paddingRight: 0,
                  },
                  "& .MuiInputBase-root": {
                    height: "15px",
                  },
                }}
              />

              <Select
                value={category}
                onChange={(e) => handleCategoryClick(e.target.value)}
                disableUnderline
                ref={selectRef} // Attach the ref here
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
                <MenuItem value="music">Music</MenuItem>
                <MenuItem value="users">Users</MenuItem>
                <MenuItem value="plot">Plot</MenuItem>
                <MenuItem value="people">Cast & Crew</MenuItem>
                <MenuItem value="authors">Authors</MenuItem>
              </Select>
            </Box>
            <button type="submit" style={{ display: "none" }}></button>
          </form>
          {["books", "movies", "tv", "music"].includes(category) &&
            suggestions.length > 0 && (
              <List
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "60%",
                  backgroundColor: "white",
                  boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                  borderRadius: "5px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 10,
                }}
              >
                {suggestions.map((suggestion) => (
                  <ListItem
                    key={suggestion.id}
                    button
                    onClick={() => {
                      navigate(
                        category === "books"
                          ? `/book/${suggestion.id}`
                          : category === "movies"
                            ? `/movie/${suggestion.id}`
                            : category === "music"
                            ? `/track/${suggestion.id}`
                            : `/tv/${suggestion.id}`
                             
                      );
                      setSearchQuery("");
                      setSuggestions([]);
                    }}
                    sx={{ "&:hover": { backgroundColor: "#f0f0f0" } }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {/* Left side: title + author/year */}
                      <ListItemText
                        primary={suggestion.title}
                        secondary={
                          category === "books"
                            ? suggestion.author
                            : category === "music"
                            ? suggestion.artist?.name
                            : suggestion.release_date
                              ? new Date(suggestion.release_date).getFullYear()
                              : ""
                        }
                        sx={{ color: "black" }}
                      />

                      {/* Right side: poster/cover */}
                      {(category === "books" && suggestion.poster) ||
                      (category === "movies" && suggestion.poster) ||
                      (category === "tv" && suggestion.poster) ? (
                        <img
                          src={suggestion.poster}
                          alt={suggestion.title}
                          style={{
                            width: "40px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            marginLeft: "10px",
                          }}
                        />
                      ) : category === "music" && suggestion.album?.cover_medium ? (
                        <img
                          src={suggestion.album.cover_medium}
                          alt={suggestion.title}
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            marginLeft: "10px",
                          }}
                        />
                      ) : null}
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
        </Box>

        {/* Right Section - Buttons */}
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          {userData ? (
            <>
              {/* Profile Button that opens a dropdown menu */}
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
                onClick={handleProfileButtonClick}
              >
                <img
                  src={userData.profilePicture}
                  alt="Profile"
                  width="40"
                  height="40"
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    filter: isDarkMode ? "invert(1)" : "invert(0)",
                  }}
                />
                {userData.username}
              </Button>

              {/* Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/home");
                  }}
                >
                  Home
                </MenuItem>
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/collage-creator");
                    handleMenuClose();
                  }}
                >
                  Collage Creator
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/achievements");
                  }}
                >
                  Achievements
                </MenuItem>
                <MenuItem onClick={handleLists}>Lists</MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/my-reviews");
                    handleMenuClose();
                  }}
                >
                  Reviews
                </MenuItem>
                <MenuItem onClick={handleToggleDarkMode}>Dark Mode</MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/discover");
                  }}
                >
                  Discover
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/trending");
                  }}
                >
                  Trending
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/blocked");
                  }}
                >
                  Blocked
                </MenuItem>
              </Menu>

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
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              sx={{
                textTransform: "none",
                fontSize: "1rem",
                color: "black",
                "&:hover": { color: "black" },
              }}
              onClick={() => setLoginOpen(true)}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      <LoginModal
        open={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        signUpMode={signUpMode}
        setSignUpMode={setSignUpMode}
      />
    </AppBar>
  );
};
export default Navbar;
