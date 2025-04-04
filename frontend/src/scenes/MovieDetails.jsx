import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";
import {
  Box,
  Button,
  Rating,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TextField
} from "@mui/material";
import ReviewModal from '../components/modals/ReviewModal.jsx';
import { FaStar, FaRegEdit } from "react-icons/fa";

const MovieDetails = () => {
  const { id } = useParams(); // Get the movie ID from the URL
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");
  const [watchedDate, setWatchedDate] = useState("");
  const [tags, setTags] = useState("");
  const [watchLater, setWatchLater] = useState(false);
  const [watchLaterArray, setWatchLaterArray] = useState([]);
  const [visibleActors, setVisibleActors] = useState(5); // Number of actors visible
  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState([]);
  const [rating, setRating] = useState(0); // Added rating state
  const [hover, setHover] = useState(0); // Hover value for stars
  const [currentMovie, setCurrentMovie] = useState(null);
  const [buttonHover, setButtonHover] = useState(false); // Separate state for button hover
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewSortBy, setReviewSortBy] = useState("recent");
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleContextMenu = (event, reviewId) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
    setSelectedReviewId(reviewId);
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleOpenCommentDialog = () => {
    setCommentModalOpen(true);
    handleCloseContextMenu();
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await axios.post(
        `http://127.0.0.1:5000/api/reviews/${selectedReviewId}/comment`,
        { content: commentText },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      fetchReviews();
      setCommentText('');
      setCommentModalOpen(false);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const reviewUrl = `http://127.0.0.1:5000/api/reviews/movie/${id}?sort=${reviewSortBy}`;
      console.log("Fetching reviews with URL:", reviewUrl);
      console.log("Looking for movie ID:", id, "with type:", "movie");

      const response = await axios.get(
        reviewUrl,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log("Reviews API response:", response.data);
      setReviews(response.data);
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id, reviewSortBy]);

  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUserData = await getUserByToken(token);
      setUserData(fetchedUserData);

      // After userData is set, load the watch later items
      if (fetchedUserData) {
        try {
          const response = await axios.get(`http://127.0.0.1:5000/api/movie/watch_later`, {
            params: {
              username: fetchedUserData.username,
            },
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });

          setWatchLaterArray(response.data);

          // Log response for debugging
          console.log("Response Data:", response.data);
          console.log("Movie ID to Check:", id);

          // Find the movie in the watchLaterArray
          const currentMovie = response.data.find(
            (entry) => entry.movieId === Number(id)
          );

          if (currentMovie) {
            setWatchLater(true);
            console.log("Current Movie Found in Watch Later:", currentMovie);
            // Set currentMovie here (you'll need a state for it)
            setCurrentMovie(currentMovie);
          } else {
            setWatchLater(false);
          }
        } catch (err) {
          console.error("Error loading watch later data:", err);
          setError("Failed to load watch later.");
        }
      }
    };

    loadUserData();

    const today = new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split('T')[0];
    setWatchedDate(today); // Set it as the initial state
  }, [token]); // This will re-run when token changes


  const calculateVisibleActors = () => {
    const containerWidth = window.innerWidth;
    const actorCardWidth = 140; // Approximate width of an actor card, including gap
    const newVisibleActors = Math.floor(containerWidth / actorCardWidth / 2);
    setVisibleActors(newVisibleActors);
  };

  useEffect(() => {
    // Recalculate visible actors on load and window resize
    calculateVisibleActors();
    window.addEventListener("resize", calculateVisibleActors);
    return () => window.removeEventListener("resize", calculateVisibleActors);
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const payload = {
          watched_date: watchedDate, // Example date; could be taken from a date picker
          tags: tags, // Example tags; could be taken from a user input field
          username: userData.username, // Replace with the current user's ID (from context or props)
        };
        const response = await axios.get(`http://127.0.0.1:5000/api/movie/${id}`); // Call your backend with the movie ID
        setMovie(response.data);
      } catch (err) {
        setError("Failed to load movie details.");
      }
    };

    fetchMovieDetails();
  }, [id]);

  const handleLogMovie = async () => {
    if (!userData) {
      console.log("Not logged in!");
      alert("Please Login!");
      return;
    }
    try {
      // Example payload: replace these with dynamic values from your UI
      const payload = {
        watched_date: watchedDate, // Example date; could be taken from a date picker
        tags: tags, // Example tags; could be taken from a user input field
        rating: rating,
        username: userData.username, // Replace with the current user's ID (from context or props)
        title: movie.title,
        poster: movie.poster_path,
      };

      // Make the POST request to log the movie
      const response = await axios.post(`http://127.0.0.1:5000/api/movie/log/${movie.id}`, payload);

      // Handle success
      alert("Movie logged successfully!");
      setRating(0);
      setTags("");
      console.log("Log response:", response.data);
    } catch (error) {
      // Handle errors
      console.error("Error logging movie:", error);
      alert("Failed to log the movie. Please try again.");
    }
  };


  const handleSaveForLater = async () => {
    if (!userData) {
      console.log("Not logged in!");
      alert("Please Login!");
      return;
    }
    try {
      // Example payload: replace these with dynamic values from your UI
      const payload = {
        username: userData.username, // Replace with the current user's ID (from context or props)
        title: movie.title,
        poster: movie.poster_path,
      };

      // Make the POST request to save the movie for later
      const response = await axios.post(`http://127.0.0.1:5000/api/movie/watch_later/${movie.id}`, payload);

      // Handle success
      // alert("Movie saved successfully!");
      console.log("Log response:", response.data);

      // Update state to reflect the movie is saved to Watch Later
      setWatchLater(true); // Set the watchLater state to true, which will change the button's appearance
      setCurrentMovie(response.data)
    } catch (error) {
      // Handle errors
      console.error("Error saving movie:", error);
      alert("Failed to save the movie. Please try again.");
    }
  };

  const handleRemove = async (section, entryId) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/movie/remove',
        {
          username: userData.username,
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
        // alert("Successfully removed!");
        setWatchLater(false)
      } else {
        throw new Error("Failed to remove the entry.");
      }
    } catch (error) {
      console.error("Error removing the entry:", error);
      alert("An error occurred while trying to remove the entry.");
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const clearRating = () => {
    setRating(0);
  };

  const handleLoadMoreActors = () => {
    setVisibleActors((prevVisible) => prevVisible + movie.cast.length); // Increase visible actors by 5
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!movie) return <p>Loading movie details...</p>;

  const displayedActors = movie.cast.slice(0, visibleActors);

  return (
    <div>
      {/* Navbar */}
      <Box
        sx={
          {
            paddingTop: 10,
            overflowX: "hidden", // Prevent horizontal scroll
            //width: "100vw", // Ensure it uses the full viewport width
          }}
      >
        <Navbar userData={userData} />

        {/* ✅ Main Container */}
        <Box
          sx={{
            maxWidth: '50vw',
            // marginTop: '500px',
            margin: '0 auto', // Center content
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Top Section: Poster and Log/Save */}
          <Box sx={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            {/* Poster Section */}
            <img
              src={movie.poster_path ? movie.poster_path : `${process.env.PUBLIC_URL}/default-poster-icon.png`}
              alt={movie.title}
              style={{
                width: '100%',
                maxWidth: '300px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Box
              sx={{
                maxWidth: '800px',
                marginTop: '500px',
                margin: '0 auto', // Center content
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Log and Save Section */}
              <Box sx={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Log/Save</h2>
                {/* Log Watched Movie */}
                <Box sx={{ marginBottom: '1.5rem' }}>
                  <label>
                    <strong>Date Watched:</strong>
                    <input
                      type="date"
                      value={watchedDate}
                      onChange={(e) => setWatchedDate(e.target.value)}
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                      }}
                    />
                  </label>
                </Box>
                <Box sx={{ marginBottom: '1.5rem' }}>
                  <label>
                    <strong>Tags:</strong>
                    <input
                      type="text"
                      placeholder="e.g., action, family"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        width: '70%',
                      }}
                    />
                  </label>
                </Box>

                {/* Rating Section */}
                <Box
                  sx={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}
                  onMouseLeave={() => setHover(0)} // Reset hover when the mouse leaves the star container
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={30}
                      color={star <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                      style={{
                        cursor: "pointer",
                        transition: "color 0.2s ease-in-out, transform 0.2s ease-in-out", // Smooth color and size change
                        transform: star === hover ? "scale(1.2)" : "scale(1)", // Slight enlargement on hover
                      }}
                      onMouseEnter={() => setHover(star)} // Set hover when entering a star
                      onClick={() => setRating(star)} // Update rating on click
                    />
                  ))}
                </Box>



                <button
                  onClick={handleLogMovie}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                  }}
                >
                  Log Movie
                </button>
                <br />
                {/* Save for Later */}
                <button
                  onClick={() => {
                    if (watchLater) {
                      handleRemove("watchLater", currentMovie._id); // Call the unsave function
                    } else {
                      handleSaveForLater(); // Call the save function
                    }
                  }}
                  onMouseEnter={() => setButtonHover(true)} // Set hover state to true
                  onMouseLeave={() => setButtonHover(false)} // Reset hover state to false
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                    backgroundColor:
                      buttonHover
                        ? (watchLater ? "#dc3545" : "#28a745") // Red if saved, green if not saved on hover
                        : (watchLater ? "#28a745" : "#ffc107"), // Red if saved, yellow if not saved when not hovered
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease", // Smooth background color transition
                  }}
                >
                  {watchLater ? (buttonHover ? "Unsave from Watch Later" : "Saved to Watch Later") : "Save to Watch Later"}
                </button>
                <button
                  onClick={() => setReviewModalOpen(true)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    backgroundColor: '#6200ea',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  Write Review
                </button>




              </Box>
            </Box>
          </Box>

          {/* Movie Info Section */}
          <Box sx={{ marginTop: '2rem' }}>
            <h1 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{movie.title}</h1>
            {movie.tagline && (
              <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '1rem' }}>
                "{movie.tagline}"
              </p>
            )}
            <p style={{ color: '#666', marginBottom: '1rem' }}>{movie.overview}</p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Release Date:</strong> {movie.release_date}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Rating:</strong> {movie.vote_average.toFixed(1)}
            </p>
            {movie.runtime && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Runtime:</strong> {movie.runtime} minutes
              </p>
            )}
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Genres:</strong> {movie.genres.join(', ')}
            </p>
            {movie.status && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Status:</strong> {movie.status}
              </p>
            )}
          </Box>

          {/* Cast Section */}
          <Box sx={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Cast</h2>
            <Box
              sx={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                scrollbarWidth: 'none', // Firefox
              }}
              className="hide-scrollbar"
            >
              {displayedActors.map((actor, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: 'center',
                    minWidth: '120px',
                    maxWidth: '120px',
                    flexShrink: 0, // Prevent shrinking
                  }}
                >
                  <img
                    src={actor.profile_path ? actor.profile_path : `${process.env.PUBLIC_URL}/default-actor-icon.png`}
                    alt={actor.name}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '10px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {actor.name}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#666' }}>
                    as {actor.character}
                  </p>
                </Box>
              ))}
              {visibleActors < movie.cast.length && (
                <button
                  onClick={handleLoadMoreActors}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '5px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    alignSelf: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ➡️
                </button>
              )}
            </Box>
          </Box>
          {/* Reviews Section */}
          <Box sx={{ marginTop: '2rem' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Reviews</h2>
              <select
                value={reviewSortBy}
                onChange={(e) => setReviewSortBy(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </Box>

            {loadingReviews ? (
              <p>Loading reviews...</p>
            ) : reviews.length > 0 ? (
              <Box>
                {reviews.map((review) => (
                  <Box
                    key={review._id}
                    onContextMenu={(e) => handleContextMenu(e, review._id)}
                    sx={{
                      marginBottom: '1rem',
                      padding: '1rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '10px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <h3 style={{ margin: 0 }}>{review.title}</h3>
                        <p style={{ margin: '0.25rem 0', color: '#666' }}>
                          By {review.user_id} • {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </Box>
                      <Box sx={{ display: 'flex' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            size={16}
                            color={star <= review.rating ? "#ffc107" : "#e4e5e9"}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        marginTop: '1rem',
                        '& strong': { fontWeight: 'bold' },
                        '& em': { fontStyle: 'italic' },
                        '& u': { textDecoration: 'underline' },
                        '& ul': { paddingLeft: '1.5rem' },
                        '& li': { marginBottom: '0.25rem' }
                      }}
                      dangerouslySetInnerHTML={{
                        __html: review.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/__(.*?)__/g, '<u>$1</u>')
                          .replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>')
                          .replace(/<li>/g, '<ul><li>')
                          .replace(/<\/li>/g, '</li></ul>')
                          .replace(/<\/ul><ul>/g, '')
                      }}
                    />

                    {review.comments && review.comments.length > 0 && (
                      <Box sx={{ marginTop: '1rem', borderTop: '1px solid #e0e0e0', paddingTop: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem' }}>Comments ({review.comments.length})</h4>
                        {review.comments.map((comment, index) => (
                          <Box
                            key={index}
                            sx={{
                              padding: '0.5rem',
                              backgroundColor: '#f9f9f9',
                              borderRadius: '5px',
                              marginBottom: '0.5rem'
                            }}
                          >
                            <p style={{ margin: 0, fontWeight: 'bold' }}>{comment.user_id}</p>
                            <p style={{ margin: '0.25rem 0' }}>{comment.content}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                              {new Date(comment.created_at).toLocaleDateString()}
                            </p>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', padding: '2rem 0', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
                <p style={{ margin: 0, color: '#666' }}>No reviews yet. Be the first to write a review!</p>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        media={movie}
        mediaType="movie"
        onReviewSubmitted={(newReview) => {
          console.log("Review submitted:", newReview);
          fetchReviews();
        }}
      />
      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ?
          { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      >
        <MenuItem onClick={handleOpenCommentDialog}>Add Comment</MenuItem>
      </Menu>

      {/* Comment Dialog */}
      <Dialog open={commentModalOpen} onClose={() => setCommentModalOpen(false)}>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Comment"
            fullWidth
            multiline
            rows={6}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{
              width: { xs: '100%', sm: '400px', md: '500px' },
              minHeight: '120px'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddComment}
            color="primary"
            variant="contained"
            disabled={!commentText.trim()}
          >
            Post Comment
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MovieDetails;
