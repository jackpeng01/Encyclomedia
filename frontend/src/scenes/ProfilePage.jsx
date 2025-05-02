import { Box, Button, Typography, Chip, Tabs, Tab } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getUserByToken, getUserByUsername } from "../api/users";
import Navbar from "../components/Navbar";
import { FaStar } from "react-icons/fa";
import ProfilePicture from "../components/modals/ProfilePicture";
import axios from "axios";
import FollowButton from "../components/FollowButton";
import { view } from "framer-motion";
import ProfileStats from "../components/modals/ProfileStats";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const [viewerData, setViewerData] = useState([]);
  const [forceRefresh, setForceRefresh] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch viewerData if token is present
        let fetchedViewerData = {};
        if (token) {
          fetchedViewerData = await getUserByToken(token);
        }

        // Fetch userData if username is provided
        let fetchedProfile = {};
        if (username) {
          fetchedProfile = await getUserByUsername(username);
        }

        // Ensure default values to avoid undefined properties
        fetchedViewerData.following = fetchedViewerData.following || [];
        fetchedProfile.following = fetchedProfile.following || [];

        setViewerData(fetchedViewerData);
        setUserData(fetchedProfile);
        setFavorites(fetchedProfile.favorites || []);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [token, username, forceRefresh]);

  const [movieLog, setMovieLog] = useState([]);
  const [watchLaterArray, setWatchLaterArray] = useState([]);
  const [movieTime, setMovieTime] = useState(0);
  const [movieCount, setMovieCount] = useState(0);
  const [movieActivity, setMovieActivity] = useState("");
  const [tvLog, setTvLog] = useState([]);
  const [watchLaterShows, setWatchLaterShows] = useState([]);
  const [tvTime, setTvTime] = useState(0);
  const [tvCount, setTvCount] = useState(0);
  const [tvActivity, setTvActivity] = useState("");
  const [readLaterArray, setReadLaterArray] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loggedBooks, setLoggedBooks] = useState([]);
  const [musicLog, setMusicLog] = useState([]);
  const [listenLaterMusic, setListenLaterMusic] = useState([]);
  const [bookCount, setBookCount] = useState([]);
  const [bookActivity, setBookActivity] = useState("");
  const [mostRead, setMostRead] = useState("");
  const [error, setError] = useState("");
  const [ownProfile, setOwnProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const profileToken = await getUserByToken(token);
      setCurrentUser(profileToken);
      if (profileToken.username === username) {
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
          //calculate total watched time
          setMovieTime(response.data.reduce((sum, item) => sum + item.runtime, 0));
          //calculate total movies watched (doesn not include repeats)
          const movieIds = response.data.map(item => item.movieId);
          const uniqueMovieIds = new Set(movieIds);
          setMovieCount(uniqueMovieIds.size);
          //calculates month with highest activity
          const moviesByMonth = response.data.reduce((acc, movie) => {
            const date = movie.watchDate.slice(0, 7);
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});
          let highestMonth = "No data";
          let highestCount = 0;
          for (const [month, count] of Object.entries(moviesByMonth)) {
            if (count > highestCount) {
              highestCount = count;
              highestMonth = month;
            }
          }
          setMovieActivity(highestMonth);
          console.log(movieActivity);
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
          const response = await axios.get(`http://127.0.0.1:5000/api/tv/log`, {
            params: {
              username: username,
            },
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
          setTvLog(response.data);
          setTvTime(response.data.reduce((sum, item) => sum + item.number_of_episodes, 0));
          const tvIds = response.data.map(item => item.movieId);
          const uniqueTvIds = new Set(tvIds);
          setTvCount(uniqueTvIds.size);
          //calculates month with highest activity
          const tvByMonth = response.data.reduce((acc, tv) => {
            const date = tv.watchDate.slice(0, 7);
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});
          let highestMonth = "No data";
          let highestCount = 0;
          for (const [month, count] of Object.entries(tvByMonth)) {
            if (count > highestCount) {
              highestCount = count;
              highestMonth = month;
            }
          }
          setTvActivity(highestMonth);
          console.log(tvActivity);
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
          const response = await axios.get(
            "http://127.0.0.1:5000/api/book/read_later",
            {
              params: { username: username },
            }
          );

          setReadLaterArray(response.data);
        } catch (err) {
          console.error(err);
          setError("Failed to load Read Later list.");
        }

        try {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/book/log`,
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
          setLoggedBooks(response.data);
          const bookIds = response.data.map(item => item.bookId);
          const uniqueBookIds = new Set(bookIds);
          setBookCount(uniqueBookIds.size);
          //find month with most logged books
          const booksByMonth = response.data.reduce((acc, book) => {
            const date = book.readDate.slice(0, 7);
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});
          let highestMonth = "No data";
          let highestCount = 0;
          for (const [month, count] of Object.entries(booksByMonth)) {
            if (count > highestCount) {
              highestCount = count;
              highestMonth = month;
            }
          }
          setBookActivity(highestMonth);
          //find most read author
          const mostRead = response.data.reduce((acc, book) => {
            const author = book.author
            acc[author] = (acc[author] || 0) + 1;
            return acc;
          }, {});
          let highestAuthor = "No data";
          let maxCount = 0;
          for (const [author, count] of Object.entries(mostRead)) {
            if (count > maxCount) {
              maxCount = count;
              highestAuthor = author;
            }
          }
          setMostRead(highestAuthor);
          console.log(response.data);
        } catch (err) {
          console.log(err);
          setError("Failed to load book log.");
        }
        /* Fetch music log */
        try {
          const response = await axios.get(`http://127.0.0.1:5000/api/music/log`, {
            params: { username }
          });
          setMusicLog(response.data);
        } catch (err) {
          console.log(err);
        }
        /* Fetch listen later */
        try {
          const response = await axios.get("http://127.0.0.1:5000/api/music/listen_later", {
            params: { username }
          });
          setListenLaterMusic(response.data);
        } catch (err) {
          console.log(err);
          setError("Failed to load Listen Later music.");
        }

      }
    };
    fetchProfile();
  }, [token, username]);

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
          setReadLaterArray((prev) =>
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

  const handleRemoveMusic = async (section, entryId) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/music/remove",
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
        setMusicLog((prev) => prev.filter((entry) => entry._id !== entryId));
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

  const [activeTab, setActiveTab] = useState(0); // State to track the active tab

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!userData) return <p>Loading...</p>;
  if (
    (viewerData.blocked && viewerData.blocked.includes(userData.username)) ||
    (userData.blocked && userData.blocked.includes(viewerData.username))
  ) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          padding: 4,
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
          This profile is unavailable.
        </Typography>
        <Typography sx={{ color: "gray", textAlign: "center" }}>
          You cannot view this profile because one of you has blocked the other.
        </Typography>
      </Box>
    );
  }

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

      {/* Profile Header Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          mt: 10,
          px: 4,
          flexWrap: "wrap",
        }}
      >
        {/* Left Section: Profile Picture & Username */}
        <Box sx={{ textAlign: "center" }}>
          <ProfilePicture userData={userData} viewerData={[]} token={token} />
          <Typography variant="h5" sx={{ fontWeight: 400 }}>
            {userData.username}
          </Typography>
          <Box sx={{ mt: "10px" }}>
            {!ownProfile && viewerData && (
              <FollowButton
                userData={userData}
                viewerData={viewerData}
                initialIsFollowing={viewerData.following.includes(
                  userData.username
                )}
                setForceRefresh={setForceRefresh}
              />
            )}
          </Box>
          <Box sx={{ textAlign: "left", mt: 0 }}>
            {userData.username === viewerData.username && (
              <Button
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  color: "black",
                  display: "block",
                  textAlign: "left",
                  "&:hover": { color: "black" },
                  padding: 0,
                }}
                onClick={() => navigate("/settings")}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>

        {/* Right Section: Profile Statistics, Bio & Genre Preferences */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            borderRadius: "10px",
            maxWidth: "600px",
            minWidth: "400px",
          }}
        >
          {/* Profile Statistics */}
          <ProfileStats userData={userData} />

          {/* Bio */}
          <Typography
            sx={{
              color: "gray",
              fontSize: "1rem",
              textAlign: "center",
              maxWidth: "500px",
              mt: 2,
            }}
          >
            {userData.bio}
          </Typography>

          {userData.genrePreferences && userData.genrePreferences.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
              width: "100%",
              // pl: 2, // optional padding to align with the rest of the content
            }}
          >
            {/* <Typography variant="body2" sx={{ color: "gray", mr: 1 }}>
                Favorite Genres:
              </Typography> */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "flex-start",
              }}
            >
              {userData.genrePreferences.map((genre, idx) => (
                <Chip key={idx} label={genre} variant="outlined" />
              ))}
            </Box>
          </Box>
        )}
        </Box>
      </Box>

      {/* The rest of your ProfilePage content (Favorite Media, Movie Log, etc.) */}
      <Box sx={{ maxWidth: "950px", margin: "auto", mt: 5 }}>
        {/* Tabs for navigation */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ marginBottom: 3 }}
        >
          <Tab label="Favorite Media" />
          <Tab label="Movie Log" />
          <Tab label="Watch Later (Movies)" />
          <Tab label="TV Log" />
          <Tab label="Watch Later (TV)" />
          <Tab label="Book Log" />
          <Tab label="Read Later" />
          <Tab label="Music Log" />
          <Tab label="Listen Later (Music)" />

        </Tabs>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {favorites.length === 0 ? (
                <Typography sx={{ textAlign: "center", color: "gray", mt: 2 }}>
                  You have no favorite media yet.
                </Typography>
              ) : (
                [...favorites].reverse().slice(0, 5).map((entry, index) => (
                  <Link
                    to={`/${entry.mediaType}/${entry.id}`}
                    key={index}
                    style={{ textDecoration: "none" }}
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
                        src={entry.poster || `${process.env.PUBLIC_URL}/default-cover.png`}
                        alt={entry.title}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "5px",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                      >
                        {entry.title}
                      </Typography>
                    </Box>
                  </Link>
                ))
              )}
            </Box>
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/${username}/favorite-media`)}
              >
                View All Favorite Media
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {movieLog.length === 0 ? (
              <Typography sx={{ textAlign: "center", color: "gray", mt: 2 }}>
                Your movie log is empty.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {movieLog.slice(0, 5).map((entry, index) => {
                  const isDefaultPoster = !entry.poster;
                  return (
                    <Link
                      to={`/movie/${entry.movieId}`}
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
                          position: "relative",
                          "&:hover .overlay": {
                            display: "flex",
                          },
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={
                            isDefaultPoster
                              ? `${process.env.PUBLIC_URL}/default-poster-icon.png`
                              : entry.poster
                          }
                          alt={entry.title || "Movie Poster"}
                          style={{
                            width: isDefaultPoster ? "85%" : "100%",
                            height: "auto",
                            maxHeight: isDefaultPoster ? "85%" : "auto",
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
                        <Box
                          className="overlay"
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "none",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            color: "white",
                            padding: 2,
                            borderRadius: "8px",
                            textAlign: "center",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            gap: 1,
                          }}
                        >
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
                          <Typography>
                            {entry.watchDate
                              ? `Watched on: ${entry.watchDate}`
                              : "No Watch Date"}
                          </Typography>
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
                          {ownProfile && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemove("movieLog", entry._id);
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
            )}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/${username}/movie-log`)}
              >
                View Full Movie Log
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            {watchLaterArray.length === 0 ? (
              <Typography sx={{ textAlign: "center", color: "gray", mt: 2 }}>
                You have no movies saved to watch later.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {watchLaterArray.slice(0, 5).map((entry, index) => (
                  <Link
                    to={`/movie/${entry.movieId}`}
                    key={index}
                    style={{ textDecoration: "none" }}
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
                        src={
                          entry.poster || `${process.env.PUBLIC_URL}/default-poster-icon.png`
                        }
                        alt={entry.title}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "5px",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                      >
                        {entry.title}
                      </Typography>
                    </Box>
                  </Link>
                ))}
              </Box>
            )}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/${username}/watch-later`)}
              >
                View All Watch Later (Movies)
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            {tvLog.length === 0 ? (
              <Typography sx={{ textAlign: "center", color: "gray", mt: 2 }}>
                Your TV log is empty.
              </Typography>
            ) : (
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
                          position: "relative",
                          "&:hover .overlay": {
                            display: "flex",
                          },
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={
                            isDefaultPoster
                              ? `${process.env.PUBLIC_URL}/default-poster-icon.png`
                              : entry.poster
                          }
                          alt={entry.title || "TV Poster"}
                          style={{
                            width: isDefaultPoster ? "85%" : "100%",
                            height: "auto",
                            maxHeight: isDefaultPoster ? "85%" : "auto",
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
                        <Box
                          className="overlay"
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "none",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            color: "white",
                            padding: 2,
                            borderRadius: "8px",
                            textAlign: "center",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                            gap: 1,
                          }}
                        >
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
                          <Typography>
                            {entry.watchDate
                              ? `Watched on: ${entry.watchDate}`
                              : "No Watch Date"}
                          </Typography>
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
                          {ownProfile && (
                            <Button
                              variant="contained"
                              color="error"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveTV("tvLog", entry._id);
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
            )}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/${username}/tv-log`)}
              >
                View Full TV Log
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 4 && (
          <Box>
            {watchLaterShows.length === 0 ? (
              <Typography sx={{ textAlign: "center", color: "gray", mt: 2 }}>
                You have no TV shows saved to watch later.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {watchLaterShows.slice(0, 5).map((entry, index) => (
                  <Link
                    to={`/tv/${entry.tvId}`}
                    key={index}
                    style={{ textDecoration: "none" }}
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
                        src={
                          entry.poster || `${process.env.PUBLIC_URL}/default-poster-icon.png`
                        }
                        alt={entry.title}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "5px",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                      >
                        {entry.title}
                      </Typography>
                    </Box>
                  </Link>
                ))}
              </Box>
            )}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/${username}/watch-later-tv`)}
              >
                View All Watch Later (TV)
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 5 && (
          <Box>
            {loggedBooks.length === 0 ? (
              <Typography sx={{ textAlign: "center", color: "gray", mt: 2 }}>
                Your book log is empty.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {loggedBooks.slice(0, 5).map((entry, index) => (
                  <Link
                    to={`/book/${entry.bookId}`}
                    key={index}
                    style={{ textDecoration: "none" }}
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
                        src={
                          entry.cover || `${process.env.PUBLIC_URL}/default-book-cover.png`
                        }
                        alt={entry.title}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "5px",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                      >
                        {entry.title}
                      </Typography>
                    </Box>
                  </Link>
                ))}
              </Box>
            )}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/${username}/book-log`)}
              >
                View Full Book Log
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 6 && (
          <Box>
            {readLaterArray.length === 0 ? (
              <Typography sx={{ textAlign: "center", color: "gray", mt: 2 }}>
                You have no books saved to read later.
              </Typography>
            ) : (
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
                        src={
                          entry.cover || `${process.env.PUBLIC_URL}/default-book-cover.png`
                        }
                        alt={entry.title}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "5px",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                      >
                        {entry.title}
                      </Typography>
                    </Box>
                  </Link>
                ))}
              </Box>
            )}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/${username}/read-later`)}
              >
                View All Read Later
              </Button>
            </Box>
          </Box>
        )}
        {activeTab === 7 && (
          <Box>
            {musicLog.length === 0 ? (
              <Typography sx={{ textAlign: "center", color: "gray", mt: 2 }}>
                Your music log is empty.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {musicLog.slice(0, 5).map((entry, index) => (
                  <Link
                    to={`/track/${entry.trackId}`}
                    key={index}
                    style={{ textDecoration: "none" }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    <Box
                      sx={{
                        width: "160px",
                        height: "240px",
                        position: "relative",
                        textAlign: "center",
                        borderRadius: "8px",
                        overflow: "hidden",
                        "&:hover .overlay": {
                          display: "flex",
                        },
                      }}
                    >
                      <img
                        src={entry.cover || `${process.env.PUBLIC_URL}/default-cover.png`}
                        alt={entry.title}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "5px",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                      >
                        {entry.title} - {entry.artist}
                      </Typography>

                      <Box
                        className="overlay"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "none",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          color: "white",
                          padding: 2,
                          borderRadius: "8px",
                          textAlign: "center",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", gap: "0.2rem", justifyContent: "center" }}>
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
                        <Typography>
                          {entry.listenDate ? `Listened on: ${entry.listenDate}` : "No Listen Date"}
                        </Typography>

                        {ownProfile && (
                          <Button
                            variant="contained"
                            color="error"
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveMusic("musicLog", entry._id);
                            }}
                            sx={{ mt: 1 }}
                          >
                            Remove
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Link>
                ))}
              </Box>
            )}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/${username}/music-log`)}
              >
                View Full Music Log
              </Button>
            </Box>
          </Box>
        )}
        {activeTab === 8 && (
        <Box>
          {listenLaterMusic.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: "gray", mt: 2 }}>
              You have no tracks saved to Listen Later.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {listenLaterMusic.slice(0, 5).map((entry, index) => (
                <Link
                  to={`/track/${entry.trackId}`}
                  key={index}
                  style={{ textDecoration: "none" }}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  <Box
                    sx={{
                      width: "160px",
                      height: "240px",
                      textAlign: "center",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={entry.cover || `${process.env.PUBLIC_URL}/default-music-cover.png`}
                      alt={entry.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "5px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}
                    >
                      {entry.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.75rem", color: "gray" }}
                    >
                      {entry.artist}
                    </Typography>
                    
                  </Box>
                </Link>
              ))}
            </Box>
          )}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/${username}/listen-later`)}
            >
              View All Listen Later (Music)
            </Button>
          </Box>
        </Box>
      )}


        {/* User Stats Section */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '50px'}}>
         <div style={{
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#d9d8d4',
          padding: '20px',
          borderRadius: '10px',
          width: '300px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          margin: 'auto',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
        <h2 style={{
          fontSize: '24px',
          color: '#54608a',
          marginBottom: '15px'
        }}>Movie Stats</h2>
        <p style={{ margin: '10px 0', color: '#333' }}>
          <strong>Minutes Watched: </strong>
          <span style={{ color: '#54608a' }}>{movieTime}</span> minutes
        </p>
        <p style={{ margin: '10px 0', color: '#333' }}>
          <strong>Movies Watched: </strong>
          <span style={{ color: '#54608a' }}>{movieCount}</span> movies
        </p>
        <p style={{ margin: '10px 0', color: '#333' }}>
          <strong>Most Activity in: </strong>
          <span style={{ color: '#54608a' }}>{movieActivity}</span>
        </p>
      </div>
      <div style={{
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#d9d8d4',
          padding: '20px',
          borderRadius: '10px',
          width: '300px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          margin: 'auto',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
        <h2 style={{
          fontSize: '24px',
          color: '#54608a',
          marginBottom: '15px'
        }}>TV Stats</h2>
        <p style={{ margin: '10px 0', color: '#333' }}>
          <strong>Episodes Watched: </strong>
          <span style={{ color: '#54608a' }}>{tvTime}</span> episodes
        </p>
        <p style={{ margin: '10px 0', color: '#333' }}>
          <strong>Shows Watched: </strong>
          <span style={{ color: '#54608a' }}>{tvCount}</span> shows
        </p>
        <p style={{ margin: '10px 0', color: '#333' }}>
          <strong>Most Activity in: </strong>
          <span style={{ color: '#54608a' }}>{tvActivity}</span>
        </p>
      </div>
      <div style={{
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#d9d8d4',
          padding: '20px',
          borderRadius: '10px',
          width: '300px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          margin: 'auto',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
        <h2 style={{
          fontSize: '24px',
          color: '#54608a',
          marginBottom: '15px'
        }}>Book Stats</h2>
        <p style={{ margin: '10px 0', color: '#333' }}>
          <strong>Most Read Author: </strong>
          <span style={{ color: '#54608a' }}>{mostRead}</span>
        </p>
        <p style={{ margin: '10px 0', color: '#333' }}>
          <strong>Books Read: </strong>
          <span style={{ color: '#54608a' }}>{bookCount}</span> books
        </p>
        <p style={{ margin: '10px 0', color: '#333' }}>
          <strong>Most Activity in: </strong>
          <span style={{ color: '#54608a' }}>{bookActivity}</span>
        </p>
      </div>
      </div>
      </Box>
    </Box>
  );
};

export default ProfilePage;
