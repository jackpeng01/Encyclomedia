import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getUserByToken, getUserByUsername } from "../api/users";
import Navbar from "../components/Navbar";
import { FaStar } from "react-icons/fa";
import ProfilePicture from "../components/modals/ProfilePicture";
import axios from "axios";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const [viewerData, setViewerData] = useState([]);

  useEffect(() => {
    const loadViewerData = async () => {
      const fetchedViewerData = await getUserByToken(token);
      setViewerData(fetchedViewerData);
    };
    loadViewerData();
  }, [token]);
  const [movieLog, setMovieLog] = useState([]);
  const [watchLaterArray, setWatchLaterArray] = useState([]);
  const [tvLog, setTvLog] = useState([]);
  const [watchLaterShows, setWatchLaterShows] = useState([]);
  const [readLaterArray, setReadLaterArray] = useState([]);
  const [loggedBooks, setLoggedBooks] = useState([]);
  const [error, setError] = useState("");
  const [ownProfile, setOwnProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const fetchedProfile = await getUserByUsername(username);
      setUserData(fetchedProfile);

      const profileToken = await getUserByToken(token);
      setCurrentUser(profileToken);
      if (profileToken.username == username) {
        setOwnProfile(true);
      }

      if (fetchProfile) {
        // Gets user's movie log
        try {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/movie/log`,
            {
              params: {
                username: username,
              },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          setMovieLog(response.data);
          console.log(response.data);
        } catch (err) {
          console.log(err);
          setError("Failed to load movie log.");
        }

        // Gets user's watch later
        try {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/movie/watch_later`,
            {
              params: {
                username: username,
              },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          setWatchLaterArray(response.data);
        } catch (err) {
          console.log(err);
          setError("Failed to load watch later.");
        }

        try {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/tv/log`,
            {
              params: {
                username: username,
              },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          setTvLog(response.data);
          console.log(response.data);
        } catch (err) {
          console.log(err);
          setError("Failed to load TV log.");
        }

        // Gets user's watch later shows
        try {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/tv/watch_later`,
            {
              params: {
                username: username,
              },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          setWatchLaterShows(response.data);
        } catch (err) {
          console.log(err);
          setError("Failed to load watch later.");
        }

        // Fetch Read Later Books
        try {
          const response = await axios.get("http://127.0.0.1:5000/api/book/read_later", {
              params: { username: username },
          });

          setReadLaterArray(response.data);
        } catch (err) {
          console.error(err);
          setError("Failed to load Read Later list.");
        }
      }
    };
    fetchProfile();
  }, [username]);

  const handleRemove = async (section, entryId) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/movie/remove",
        {
          username: username,
          entry: entryId,
          section: section,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Update the state to remove the entry locally
        if (section === "movieLog") {
          setMovieLog((prev) => prev.filter((entry) => entry._id !== entryId));
        } else if (section === "watchLater") {
          setWatchLaterArray((prev) =>
            prev.filter((entry) => entry._id !== entryId)
          );
        } else if (section === "readLater") {
          setReadLaterArray((prev) => prev.filter((entry) => entry._id !== entryId));
        }
        

        // alert("Successfully removed!");
      } else {
        throw new Error("Failed to remove the entry.");
      }
    } catch (error) {
      console.error("Error removing the entry:", error);
      alert("An error occurred while trying to remove the entry.");
    }
  };

  const handleRemoveTV = async (section, entryId) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/tv/remove",
        {
          username: username,
          entry: entryId,
          section: section,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Update the state to remove the entry locally
        if (section === "tvLog") {
          setTvLog((prev) => prev.filter((entry) => entry._id !== entryId));
        } else if (section === "watchLater") {
          setWatchLaterShows((prev) =>
            prev.filter((entry) => entry._id !== entryId)
          );
        } 
        

        // alert("Successfully removed!");
      } else {
        throw new Error("Failed to remove the entry.");
      }
    } catch (error) {
      console.error("Error removing the entry:", error);
      alert("An error occurred while trying to remove the entry.");
    }
  };

  if (!userData) return <p>Loading...</p>;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Navbar userData={currentUser} />

      {/* ✅ Profile Header Section (Flex Layout) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5, // Adds spacing between profile info & stats
          mt: 10,
          px: 4,
          flexWrap: "wrap", // Ensures responsiveness on smaller screens
        }}
      >
        {/* ✅ Left Section: Profile Picture & Username */}
        <Box sx={{ textAlign: "center" }}>
          <ProfilePicture userData={userData} viewerData={[]} token={token} />
          <Typography variant="h5" sx={{ fontWeight: 400 }}>
            {userData.username}
          </Typography>
          <Box sx={{ textAlign: "left", mt: 0 }}>
            {userData.username === viewerData.username && (
              <Button
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  color: "black",
                  display: "block", // Ensures button is left-aligned with username
                  textAlign: "left",
                  "&:hover": { color: "black" },
                  padding: 0, // Removes extra spacing
                }}
                onClick={() => navigate("/settings")}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>

        {/* ✅ Right Section: Profile Statistics & Bio (Same Box) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            // backgroundColor: "rgba(0, 0, 0, 0.05)", // Light gray background
            borderRadius: "10px",
            maxWidth: "600px",
            minWidth: "400px",
          }}
        >
          {/* ✅ Stats (Horizontally Stacked) */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 5,
              fontSize: "1.2rem",
              textAlign: "center",
              mb: 5, // Adds spacing before the bio
            }}
          >
            {[
              { label: "Reviews", value: 0 },
              { label: "Lists", value: 0 },
              { label: "Media", value: 99 },
              { label: "Followers", value: "9B" },
              { label: "Following", value: "18B" },
            ].map((stat, index) => (
              <Box key={index} sx={{ textAlign: "center" }}>
                <Typography sx={{ fontWeight: 500, fontSize: "1.5rem" }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontWeight: 300, fontSize: "1rem" }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* ✅ Bio (Now Inside the Same Box) */}
          <Typography
            sx={{
              color: "gray",
              fontSize: "1rem",
              textAlign: "center",
              maxWidth: "500px",
            }}
          >
            {userData.bio}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: "900px", margin: "auto", mt: 5 }}>
        {/* Favorite Media Section */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 400,
            mb: 2,
          }}
        >
          Favorite Media:
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            "The Great Gatsby",
            "Cars 2",
            "Diary of a Wimpy Kid: Rodrick Rules",
            "The Brothers Karamazov",
            "Boruto",
            "Introduction to Algorithms",
          ].map((media, index) => (
            <Box
              key={index}
              sx={{
                width: "160px",
                height: "200px",
                backgroundColor: "lightgray",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderRadius: "5px",
                fontSize: "1rem",
                fontWeight: "400",
                padding: "10px",
              }}
            >
              {media}
            </Box>
          ))}
        </Box>

        {/* Movie Log Section */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 400,
            mb: 2,
            mt: 5,
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => navigate(`/${username}/movie-log`)} // Redirect to Movie Log page
        >
          Movie Log:
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {movieLog.slice(0, 5).map((entry, index) => {
            const isDefaultPoster = !entry.poster; // Check if there's no poster
            return (
              <Link
                to={`/movie/${entry.movieId}`} // Redirect to the movie details page
                key={index}
                style={{ textDecoration: "none" }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <Box
                  key={index}
                  sx={{
                    width: "160px",
                    height: "240px",
                    display: "inline-block",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    borderRadius: "8px",
                    overflow: "hidden",
                    position: "relative", // Required for hover effect
                    "&:hover .overlay": {
                      display: "flex", // Show the overlay content on hover
                    },
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent link redirection when clicking specific buttons
                >
                  <img
                    src={
                      isDefaultPoster
                        ? `${process.env.PUBLIC_URL}/default-poster-icon.png`
                        : entry.poster
                    }
                    alt={entry.title || "Movie Poster"}
                    style={{
                      width: isDefaultPoster ? "85%" : "100%", // Smaller width for default posters
                      height: "auto", // Maintains aspect ratio
                      maxHeight: isDefaultPoster ? "85%" : "auto", // Smaller height for default posters
                      borderRadius: "5px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                    }}
                  />
                  {isDefaultPoster && (
                    <Typography
                      variant="h6"
                      sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                    >
                      {entry.title || "Unknown Title"}
                    </Typography>
                  )}

                  {/* Hover Overlay */}
                  <Box
                    className="overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "none", // Initially hidden
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark background for better visibility
                      color: "white",
                      padding: 2,
                      borderRadius: "8px",
                      textAlign: "center",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      gap: 1,
                    }}
                  >
                    {/* Display Rating */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: "0.2rem",
                        justifyContent: "center",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          size={20}
                          color={
                            star <= (entry.rating || 0) ? "#ffc107" : "#e4e5e9"
                          }
                        />
                      ))}
                    </Box>

                    {/* Watch Date */}
                    <Typography>
                      {entry.watchDate
                        ? `Watched on: ${entry.watchDate}`
                        : "No Watch Date"}
                    </Typography>

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          Tags:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            justifyContent: "center",
                          }}
                        >
                          {entry.tags.map((tag, idx) => (
                            <Typography
                              key={idx}
                              sx={{
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                padding: "2px 6px",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {tag}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Remove Button */}
                    {ownProfile && (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove("movieLog", entry._id);
                          console.log("Remove movie:", entry.movieId);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </Box>
              </Link>
            );
          })}
        </Box>

        {/* Watch Later Section */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 400,
            mb: 2,
            mt: 5,
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => navigate(`/${username}/watch-later`)} // Redirect to Watch Later page
        >
          Watch Later:
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {watchLaterArray.slice(0, 5).map((entry, index) => {
            const isDefaultPoster = !entry.poster; // Check if there's no poster
            return (
              <Link
                to={`/movie/${entry.movieId}`} // Redirect to the movie details page
                key={index}
                style={{ textDecoration: "none" }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <Box
                  key={index}
                  sx={{
                    width: "160px",
                    height: "240px",
                    display: "inline-block",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    borderRadius: "8px",
                    overflow: "hidden",
                    position: "relative", // Required for hover effect
                    "&:hover .overlay": {
                      display: "flex", // Show the overlay content on hover
                    },
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent link redirection when clicking specific buttons
                >
                  <Link
                    to={`/movie/${entry.movieId}`}
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    <img
                      src={
                        isDefaultPoster
                          ? `${process.env.PUBLIC_URL}/default-poster-icon.png`
                          : entry.poster
                      }
                      alt={entry.title || "Movie Poster"}
                      style={{
                        width: isDefaultPoster ? "85%" : "100%", // Smaller width for default posters
                        height: "auto", // Maintains aspect ratio
                        maxHeight: isDefaultPoster ? "85%" : "auto", // Smaller height for default posters
                        borderRadius: "5px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        cursor: "pointer",
                      }}
                    />
                  </Link>
                  {isDefaultPoster && (
                    <Typography
                      variant="h6"
                      sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                    >
                      {entry.title || "Unknown Title"}
                    </Typography>
                  )}

                  {/* Hover Overlay */}
                  <Box
                    className="overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "none", // Initially hidden
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark background for better visibility
                      color: "white",
                      padding: 2,
                      borderRadius: "8px",
                      textAlign: "center",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      gap: 1,
                    }}
                  >
                    {/* Tags (Optional Section) */}
                    {entry.tags && entry.tags.length > 0 && (
                      <Typography>Tags: {entry.tags.join(", ")}</Typography>
                    )}

                    {/* Remove Button */}
                    {ownProfile && (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove("watchLater", entry._id);
                          console.log("Remove movie:", entry.movieId);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </Box>
              </Link>
            );
          })}
        </Box>

        {/* TV Log Section */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 400,
            mb: 2,
            mt: 5,
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => navigate(`/${username}/tv-log`)} 
        >
          TV Log:
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {tvLog.slice(0, 5).map((entry, index) => {
            const isDefaultPoster = !entry.poster; 
            return (
              <Link
                to={`/tv/${entry.tvId}`} 
                key={index}
                style={{ textDecoration: "none" }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <Box
                  key={index}
                  sx={{
                    width: "160px",
                    height: "240px",
                    display: "inline-block",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    borderRadius: "8px",
                    overflow: "hidden",
                    position: "relative", // Required for hover effect
                    "&:hover .overlay": {
                      display: "flex", // Show the overlay content on hover
                    },
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent link redirection when clicking specific buttons
                >
                  <img
                    src={
                      isDefaultPoster
                        ? `${process.env.PUBLIC_URL}/default-poster-icon.png`
                        : entry.poster
                    }
                    alt={entry.title || "TV Poster"}
                    style={{
                      width: isDefaultPoster ? "85%" : "100%", // Smaller width for default posters
                      height: "auto", // Maintains aspect ratio
                      maxHeight: isDefaultPoster ? "85%" : "auto", // Smaller height for default posters
                      borderRadius: "5px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      cursor: "pointer",
                    }}
                  />
                  {isDefaultPoster && (
                    <Typography
                      variant="h6"
                      sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                    >
                      {entry.title || "Unknown Title"}
                    </Typography>
                  )}

                  {/* Hover Overlay */}
                  <Box
                    className="overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "none", // Initially hidden
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark background for better visibility
                      color: "white",
                      padding: 2,
                      borderRadius: "8px",
                      textAlign: "center",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      gap: 1,
                    }}
                  >
                    {/* Display Rating */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: "0.2rem",
                        justifyContent: "center",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          size={20}
                          color={
                            star <= (entry.rating || 0) ? "#ffc107" : "#e4e5e9"
                          }
                        />
                      ))}
                    </Box>

                    {/* Watch Date */}
                    <Typography>
                      {entry.watchDate
                        ? `Watched on: ${entry.watchDate}`
                        : "No Watch Date"}
                    </Typography>

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          Tags:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            justifyContent: "center",
                          }}
                        >
                          {entry.tags.map((tag, idx) => (
                            <Typography
                              key={idx}
                              sx={{
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                                padding: "2px 6px",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {tag}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Remove Button */}
                    {ownProfile && (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveTV("tvLog", entry._id);
                          console.log("Remove TV:", entry.tvId);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </Box>
              </Link>
            );
          })}
        </Box>

          {/* Watch Later Shows Section */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 400,
            mb: 2,
            mt: 5,
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => navigate(`/${username}/watch-later-tv`)} // Redirect to Watch Later page
        >
          Watch Later (TV):
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {watchLaterShows.slice(0, 5).map((entry, index) => {
            const isDefaultPoster = !entry.poster; // Check if there's no poster
            return (
              <Link
                to={`/tv/${entry.tvId}`} // Redirect to the movie details page
                key={index}
                style={{ textDecoration: "none" }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <Box
                  key={index}
                  sx={{
                    width: "160px",
                    height: "240px",
                    display: "inline-block",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    borderRadius: "8px",
                    overflow: "hidden",
                    position: "relative", // Required for hover effect
                    "&:hover .overlay": {
                      display: "flex", // Show the overlay content on hover
                    },
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent link redirection when clicking specific buttons
                >
                  <Link
                    to={`/tv/${entry.tvId}`}
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    <img
                      src={
                        isDefaultPoster
                          ? `${process.env.PUBLIC_URL}/default-poster-icon.png`
                          : entry.poster
                      }
                      alt={entry.title || "TV Poster"}
                      style={{
                        width: isDefaultPoster ? "85%" : "100%", // Smaller width for default posters
                        height: "auto", // Maintains aspect ratio
                        maxHeight: isDefaultPoster ? "85%" : "auto", // Smaller height for default posters
                        borderRadius: "5px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        cursor: "pointer",
                      }}
                    />
                  </Link>
                  {isDefaultPoster && (
                    <Typography
                      variant="h6"
                      sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                    >
                      {entry.title || "Unknown Title"}
                    </Typography>
                  )}

                  {/* Hover Overlay */}
                  <Box
                    className="overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "none", // Initially hidden
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.7)", // Dark background for better visibility
                      color: "white",
                      padding: 2,
                      borderRadius: "8px",
                      textAlign: "center",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      gap: 1,
                    }}
                  >
                    {/* Tags (Optional Section) */}
                    {entry.tags && entry.tags.length > 0 && (
                      <Typography>Tags: {entry.tags.join(", ")}</Typography>
                    )}

                    {/* Remove Button */}
                    {ownProfile && (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveTV("watchLater", entry._id);
                          console.log("Remove TV:", entry.tvId);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </Box>
              </Link>
            );
          })}
        </Box>

          {/* Read Later Section */}
          <Typography
            variant="h5"
            sx={{
              fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
              fontWeight: 400,
              mb: 2,
              mt: 5,
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate(`/${username}/read-later`)} // Redirect to Read Later page
          >
            Read Later:
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {readLaterArray.slice(0, 5).map((entry, index) => (
              <Link
                to={`/book/${entry.bookId}`}
                key={index}
                style={{ textDecoration: "none" }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <Box
                  sx={{
                    width: "160px",
                    height: "240px",
                    display: "inline-block",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={entry.cover || `${process.env.PUBLIC_URL}/default-book-cover.png`}
                    alt={entry.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "5px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Typography variant="h6" sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}>
                    {entry.title}
                  </Typography>
                </Box>
              </Link>
            ))}
          </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
