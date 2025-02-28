import { Box, Button, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getUserByToken, getUserByUsername } from "../api/users";
import Navbar from "../components/Navbar";
import { FaStar } from "react-icons/fa";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [movieLog, setMovieLog] = useState([]);
  const [watchLaterArray, setWatchLaterArray] = useState([]);
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
          const response = await axios.get(`http://127.0.0.1:5000/api/movie/log`, {
            params: {
              username: username,
            },
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
          setMovieLog(response.data);
          console.log(response.data)
        } catch (err) {
          console.log(err);
          setError("Failed to load movie log.");
        }


        // Gets user's watch later
        try {
          const response = await axios.get(`http://127.0.0.1:5000/api/movie/watch_later`, {
            params: {
              username: username,
            },
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
          setWatchLaterArray(response.data);
        } catch (err) {
          console.log(err);
          setError("Failed to load watch later.");
        }
      }
    };
    fetchProfile();
  }, [username]);

  const handleRemove = async (section, entryId) => {
    try {

      const response = await axios.post('http://127.0.0.1:5000/api/movie/remove',
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
          setWatchLaterArray((prev) => prev.filter((entry) => entry._id !== entryId));
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



  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/users/${username}/upload-profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      // ✅ Update profile picture immediately
      setUserData((prev) => ({
        ...prev,
        profilePicture: response.data.profilePicture,
      }));

      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("❌ Error uploading profile picture:", error);
    }
  };

  if (!userData) return <p>Loading...</p>;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // ✅ Ensures full viewport height
        // width: "100vw", // ✅ Forces it to take full width
        overflowX: "hidden", // ✅ Prevents unwanted horizontal scrolling
      }}
    >
      <Navbar userData={currentUser} />

      {/* ✅ Profile Section */}
      <Box sx={{ textAlign: "center", mt: 10 }}>
        {/* ✅ Clickable Profile Picture */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            cursor: "pointer",
          }}
          onClick={() => fileInputRef.current.click()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={userData.profilePicture}
            alt="Profile"
            width="150"
            height="150"
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              transition: "opacity 0.3s ease-in-out",
              filter: isHovered ? "brightness(70%)" : "none",
              //   filter: "invert(1)",
            }}
          />
          {isHovered && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                padding: "5px 10px",
                borderRadius: "5px",
                fontSize: "14px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Edit
            </div>
          )}
        </div>

        {/* ✅ Username */}
        <Typography
          variant="h4"
          sx={{
            // fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 400,
            mt: 2,
          }}
        >
          {userData.username}
        </Typography>

        {/* ✅ Profile Stats */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 5,
            mt: 2,
            fontSize: "1.2rem",
          }}
        >
          <Typography sx={{ fontWeight: 300 }}>
            <strong>0</strong> <br /> Reviews
          </Typography>
          <Typography sx={{ fontWeight: 300 }}>
            <strong>0</strong> <br /> Lists
          </Typography>
          <Typography sx={{ fontWeight: 300 }}>
            <strong>99</strong> <br /> Media
          </Typography>
          <Typography sx={{ fontWeight: 300 }}>
            <strong>9B</strong> <br /> Followers
          </Typography>
          <Typography sx={{ fontWeight: 300 }}>
            <strong>18B</strong> <br /> Following
          </Typography>
        </Box>

        {/* ✅ Bio Section */}
        <Typography
          sx={{
            maxWidth: "600px",
            margin: "auto",
            mt: 2,
            color: "gray",
            fontSize: "1rem",
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
          pharetra consectetur dolor at molestie.
        </Typography>
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
                    src={isDefaultPoster ? `${process.env.PUBLIC_URL}/default-poster-icon.png` : entry.poster}
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
                    <Typography variant="h6" sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}>
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
                    <Box sx={{ display: "flex", gap: "0.2rem", justifyContent: "center" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          size={20}
                          color={star <= (entry.rating || 0) ? "#ffc107" : "#e4e5e9"}
                        />
                      ))}
                    </Box>

                    {/* Watch Date */}
                    <Typography>
                      {entry.watchDate ? `Watched on: ${entry.watchDate}` : "No Watch Date"}
                    </Typography>

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
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
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    <img
                      src={isDefaultPoster ? `${process.env.PUBLIC_URL}/default-poster-icon.png` : entry.poster}
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
                    <Typography variant="h6" sx={{ fontSize: "0.8rem", fontWeight: 500, mt: 1 }}>
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
                      <Typography>
                        Tags: {entry.tags.join(", ")}
                      </Typography>
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






      </Box>


      {/* ✅ Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default ProfilePage;
