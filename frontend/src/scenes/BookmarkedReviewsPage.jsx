import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, Typography, Box, Button, Grid, Card, CardContent,
    DialogActions, DialogContent, Menu, MenuItem, TextField, CircularProgress, Rating,
    IconButton
} from "@mui/material";
import { ThumbUp, ThumbDown, Comment as CommentIcon } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { getUserByToken } from "../api/users.js";
import axios from "axios";

const BookmarkedReviewsPage = () => {
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const [userData, setUserData] = useState({});
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        const loadUserData = async () => {
            const fetchedUserData = await getUserByToken(token);
            setUserData(fetchedUserData);
            fetchBookmarkedReviews();
        };
        if (token) {
            loadUserData();
        }
    }, [token]);

    const fetchBookmarkedReviews = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/reviews/bookmarked`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setReviews(response.data);
        } catch (error) {
            console.error("Error loading bookmarked reviews:", error);
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

    const handleOpenCommentDialog = () => {
        setCommentModalOpen(true);
        setContextMenu(null);
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

            fetchBookmarkedReviews();
            setCommentText('');
            setCommentModalOpen(false);
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const formatContent = (content) => {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/__(.*?)__/g, '<u>$1</u>')
            .replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>')
            .replace(/<li>/g, '<ul><li>')
            .replace(/<\/li>/g, '</li></ul>')
            .replace(/<\/ul><ul>/g, '');
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
            <Navbar userData={userData} />
            <Box sx={{ mt: 10, px: 8, width: "100%" }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4">Bookmarked Reviews</Typography>
                    <Button variant="outlined" onClick={() => navigate("/my-reviews")}>
                        Back to My Reviews
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {reviews.map((review) => (
                            <Grid item xs={12} sm={6} md={4} key={review._id}>
                                <Card
                                    onContextMenu={(e) => handleContextMenu(e, review._id)}
                                    sx={{
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
                                        <Box onClick={() => handleViewDetails(review.media_id, review.media_type)} sx={{ cursor: 'pointer' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Typography variant="h6" noWrap>{review.title}</Typography>
                                                <Rating value={review.rating} readOnly size="small" />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                                                <strong>{review.media_title || 'Unknown title'}</strong> • {review.media_type.charAt(0).toUpperCase() + review.media_type.slice(1)} • <Link to={`/profile/${review.user_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                    <span style={{ '&:hover': { textDecoration: 'underline' } }}>{review.user_id}</span>
                                                </Link> • {new Date(review.created_at).toLocaleDateString()}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    mt: 1, mb: 2,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    height: '4.5em'
                                                }}
                                                dangerouslySetInnerHTML={{ __html: formatContent(review.content) }}
                                            />
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ThumbUp fontSize="small" color={review.liked ? "primary" : "action"} />
                                                <Typography variant="caption">{review.likes || 0}</Typography>
                                                <ThumbDown fontSize="small" color={review.disliked ? "error" : "action"} sx={{ ml: 1 }} />
                                                <Typography variant="caption">{review.dislikes || 0}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CommentIcon fontSize="small" />
                                                <Typography variant="caption">
                                                    {review.comments?.length || 0}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}

                        {reviews.length === 0 && (
                            <Grid item xs={12}>
                                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 5 }}>
                                    You haven't bookmarked any reviews yet.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Box>

            <Menu
                open={contextMenu !== null}
                onClose={() => setContextMenu(null)}
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
                        rows={6}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        sx={{ width: { xs: '100%', sm: '400px', md: '500px' }, minHeight: '120px' }}
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

export default BookmarkedReviewsPage;