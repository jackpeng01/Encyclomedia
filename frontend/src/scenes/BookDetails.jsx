import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getUserByToken } from "../api/users";
import Navbar from "../components/Navbar";
import {
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button
} from "@mui/material";
import { FaStar } from "react-icons/fa";
import ReviewModal from '../components/modals/ReviewModal.jsx';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");
  const [readDate, setReadDate] = useState("");
  const [savedForLater, setSavedForLater] = useState(false);
  const [savedForLog, setSavedForLog] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [readLaterList, setReadLaterList] = useState([]);
  const [bookLogList, setBookLogList] = useState([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  // review and comment states
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
      const reviewUrl = `http://127.0.0.1:5000/api/reviews/book/${id}?sort=${reviewSortBy}`;
      console.log("Fetching reviews with URL:", reviewUrl);
      console.log("Looking for book ID:", id, "with type:", "book");

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
      if (token) {
        try {
          const fetchedUserData = await getUserByToken(token);
          setUserData(fetchedUserData);
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    };
    loadUserData();
  }, [token]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/book/${id}`);
        setBook(response.data.book);
      } catch (err) {
        setError("Failed to load book details.");
      }
    };

    fetchBookDetails();
  }, [id]);

  useEffect(() => {
    const fetchReadLaterList = async () => {
      if (!userData) return;

      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/book/read_later?username=${userData.username}`);
        setReadLaterList(response.data);

        // Check if the book is already in read later
        const foundBook = response.data.find((item) => item.bookId === id);
        if (foundBook) {
          setSavedForLater(true);
          setCurrentBook(foundBook);
        }
      } catch (error) {
        console.error("Error fetching read later list:", error);
      }
    };

    fetchReadLaterList();
  }, [userData, id]);

  useEffect(() => {
    const fetchBookLog = async () => {
      if (!userData) return;

      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/book/log?username=${userData.username}`);
        setBookLogList(response.data);

        // Check if the book is already in book log
        const foundBook = response.data.find((item) => item.bookId === id);
        if (foundBook) {
          setSavedForLog(true);
          setCurrentBook(foundBook);
        }
      } catch (error) {
        console.error("Error fetching book log list:", error);
      }
    };

    fetchBookLog();
  }, [userData, id]);

  const formatPublishDate = (dateString) => {
    if (!dateString || dateString === "Unknown Date") return "Unknown";
    const dateObj = new Date(dateString);
    return isNaN(dateObj.getTime()) ? dateString : dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const cleanDescription = (description) => {
    if (!description) return "No description available.";

    let cleaned = description.split(/\[\s*source\s*\]|\[\d+\]/i)[0].trim();
    if (cleaned.endsWith("(")) {
      cleaned = cleaned.slice(0, -1).trim();
    }
    return cleaned;
  };

  const handleLogBook = async () => {
    if (!userData) {
      alert("Please Login!");
      return;
    }
    try {
      const payload = {
        read_date: readDate,
        rating: rating,
        username: userData.username,
        title: book.title,
        cover: book.cover_url,
        author: book.author,
      };

      const response = await axios.post(`http://127.0.0.1:5000/api/book/log/${id}`, payload);
      alert("Book logged successfully!");
      setSavedForLog(true);
      setCurrentBook(response.data);
      setReadDate("");
      setRating(0);
      console.log("Log response:", response.data);
    } catch (error) {
      console.error("Error logging book:", error);
      alert("Failed to log the book. Please try again.");
    }
  };


  const handleReadLater = async () => {
    if (!userData) {
      alert("Please Login!");
      return;
    }
    try {
      const payload = {
        username: userData.username,
        title: book.title,
        cover: book.cover_url,
      };

      const response = await axios.post(`http://127.0.0.1:5000/api/book/read_later/${id}`, payload);
      setSavedForLater(true);
      setCurrentBook(response.data);
    } catch (error) {
      console.error("Error saving book:", error);
      alert("Failed to save the book. Please try again.");
    }
  };

  const handleRemove = async () => {
    if (!currentBook) {
      alert("Book not found in Read Later!");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/book/remove", {
        username: userData.username,
        entry: currentBook._id,
        section: "readLater",
      });

      if (response.status === 200) {
        setSavedForLater(false);
        setReadLaterList((prev) => prev.filter((item) => item.bookId !== id));
      } else {
        throw new Error("Failed to remove the book.");
      }
    } catch (error) {
      console.error("Error removing book:", error);
      alert("An error occurred while trying to remove the book.");
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!book) return <p>Loading book details...</p>;

  console.log("Book object:", book);

  return (
    <div>
      <Box sx={{ paddingTop: 10 }}>
        <Navbar userData={userData} />
        {/* Main Container */}
        <Box
          sx={{
            maxWidth: "50vw",
            margin: "0 auto",
            padding: "1.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Top Section: Cover and Log/Save */}
          <Box sx={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
            {/* Cover Section */}
            <img
              src={book.cover_url || `${process.env.PUBLIC_URL}/default-book-cover.png`}
              alt={book.title}
              style={{
                width: "100%",
                maxWidth: "300px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            />

            {/* Log and Save Section */}
            <Box sx={{ flex: 1 }}>
              <h2>Log/Save</h2>
              {/* Log Read Book */}
              <Box sx={{ marginBottom: "1.5rem" }}>
                <label>
                  <strong>Date Read:</strong>
                  <input
                    type="date"
                    value={readDate}
                    onChange={(e) => setReadDate(e.target.value)}
                    style={{
                      marginLeft: "0.5rem",
                      padding: "0.25rem",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
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
              <button onClick={savedForLog ? handleRemove : handleLogBook} style={buttonStyle} disabled={savedForLog}>
                {savedForLog ? "Already logged" : "Log Book"}
              </button>
              <br />

              {/* Read Later */}
              <button onClick={savedForLater ? handleRemove : handleReadLater} style={buttonStyle} disabled={savedForLater}>
                {savedForLater ? "Already in Read Later" : "Add to Read Later"}
              </button>
            </Box>
          </Box>

          {/* Book Info Section */}
          <Box sx={{ marginTop: "2rem" }}>
            <h1>{book.title}</h1>
            <p><strong>Author:</strong> {book.author}</p>
            <p><strong>Published:</strong> {formatPublishDate(book.publish_date)}</p>
            <h2>Description</h2>
            <p>{cleanDescription(book.description)}</p>
            {book.genres && <p><strong>Genres:</strong> {book.genres.join(", ")}</p>}
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
            }}
          >
            Write Review
          </button>

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

      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        media={{
          ...book,
          id: id
        }}
        mediaType="book"
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

const buttonStyle = { padding: "0.5rem 1rem", borderRadius: "5px", backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer", marginBottom: "1rem" };

export default BookDetails;
