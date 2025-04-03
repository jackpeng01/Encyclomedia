import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, Typography, Box, Button, Grid, Card, CardContent,
  DialogActions, DialogContent, TextField, CircularProgress, Rating, Menu, MenuItem
} from "@mui/material";
import { Sort as SortIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useSelector } from "react-redux";
import { getUserByToken } from "../api/users.js";
import axios from "axios";

const LatestReviewsPage = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState({});
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortMethod, setSortMethod] = useState("recent");
  const [sortDirection, setSortDirection] = useState("desc");
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/reviews/recent");
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUserData = await getUserByToken(token);
      setUserData(fetchedUserData);
    };
    if (token) {
      loadUserData();
    }
  }, [token]);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/reviews/recent", {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    let sortedReviews = [...reviews];
    const isAscending = sortDirection === "asc";

    switch (sortMethod) {
      case "rating":
        sortedReviews.sort((a, b) => {
          return isAscending ? a.rating - b.rating : b.rating - a.rating;
        });
        break;
      case "recent":
      default:
        sortedReviews.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
          const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
          return isAscending ? dateA - dateB : dateB - dateA;
        });
    }

    setReviews(sortedReviews);
  }, [sortMethod, sortDirection]);

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleCloseSortMenu = () => {
    setSortAnchorEl(null);
  };

  const handleSortMethodSelect = (method) => {
    if (method === sortMethod) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      if (method === "alphabetical") {
        setSortDirection("asc"); // A to Z by default
      } else {
        setSortDirection("desc"); // Newest first or highest rating first by default
      }
      setSortMethod(method);
    }

    handleCloseSortMenu();
  };

  const formatContent = (content) => {
    let formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>');

    if (formattedContent.includes('<li>')) {
      formattedContent = '<ul>' + formattedContent + '</ul>';
      formattedContent = formattedContent.replace(/<\/ul><ul>/g, '');
    }

    return formattedContent;
  };

  const handleViewDetails = (mediaId, mediaType) => {
    if (mediaType === 'movie') {
      navigate(`/movie/${mediaId}`);
    } else if (mediaType === 'tv') {
      navigate(`/tv/${mediaId}`);
    } else if (mediaType === 'book') {
      navigate(`/book/${mediaId}`);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", overflowX: "hidden" }}>
      {/* Navbar */}
      <Navbar userData={userData} />

      {/* Main Content */}
      <Box sx={{ mt: 10, px: 8, width: "100%" }}>
        {/* Header with title and sort button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            Latest Reviews
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={handleSortClick}
              sx={{ mr: 2 }}
            >
              Sort
            </Button>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleCloseSortMenu}
            >
              <MenuItem
                onClick={() => handleSortMethodSelect('recent')}
                selected={sortMethod === 'recent'}
              >
                Date {sortMethod === 'recent' && (sortDirection === 'desc' ? '(Newest first)' : '(Oldest first)')}
              </MenuItem>
              <MenuItem
                onClick={() => handleSortMethodSelect('rating')}
                selected={sortMethod === 'rating'}
              >
                Rating {sortMethod === 'rating' && (sortDirection === 'desc' ? '(Highest first)' : '(Lowest first)')}
              </MenuItem>
            </Menu>
            <Button
              variant="outlined"
              onClick={() => navigate("/my-reviews")}
              sx={{ mr: 2 }}
            >
              My Reviews
            </Button>
          </Box>
        </Box>

        {/* Reviews Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {reviews.map((review) => (
              <Grid item xs={12} sm={6} md={4} key={review._id}>
                <Card
                  onClick={() => handleViewDetails(review.media_id, review.media_type)}
                  onContextMenu={(e) => handleContextMenu(e, review._id)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" noWrap>
                        {review.title}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>{review.media_title || 'Unknown title'}</strong> • {review.media_type.charAt(0).toUpperCase() + review.media_type.slice(1)} •
                      By {review.user_id}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </Typography>

                    <Box
                      sx={{
                        mt: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        height: '4.5em',
                        '& strong': { fontWeight: 'bold' },
                        '& em': { fontStyle: 'italic' },
                        '& u': { textDecoration: 'underline' },
                        '& ul': { paddingLeft: '1.5rem', margin: 0 },
                        '& li': { marginBottom: '0.25rem' }
                      }}
                      dangerouslySetInnerHTML={{ __html: formatContent(review.content) }}
                    />

                    {review.comments.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto', pt: 1 }}>
                        {review.comments.length} comment{review.comments.length !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {reviews.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 5 }}>
                  No reviews have been written yet.
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
      <Menu
  open={contextMenu !== null}
  onClose={handleCloseContextMenu}
  anchorReference="anchorPosition"
  anchorPosition={contextMenu !== null ? 
    { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
>
  <MenuItem onClick={handleOpenCommentDialog}>Add Comment</MenuItem>
</Menu>

<Dialog open={commentModalOpen} onClose={() => setCommentModalOpen(false)}>
  <DialogTitle>Add Comment</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Your Comment"
      fullWidth
      multiline
      rows={4}
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
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
    </Box>
  );
};

export default LatestReviewsPage;