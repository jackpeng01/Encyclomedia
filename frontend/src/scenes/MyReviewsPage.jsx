import React, { useState, useEffect } from "react";
import {
    TextField,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    Menu,
    MenuItem,
    CircularProgress,
    Rating
} from "@mui/material";
import {
    Sort as SortIcon, Public as PublicIcon, Bookmark as BookmarkIcon,
    ThumbUp, ThumbDown, Comment as CommentIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { getUserByToken } from "../api/users.js";
import axios from "axios";

const MyReviewsPage = () => {
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const [userData, setUserData] = useState({});
    const [reviews, setReviews] = useState([]);
    const [displayedReviews, setDisplayedReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortMethod, setSortMethod] = useState("recent");
    const [sortDirection, setSortDirection] = useState("desc");
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [commentText, setCommentText] = useState('');

    const handleContextMenu = (event, reviewId) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
                : null
        );
        setSelectedReviewId(reviewId);
    };

    const fetchReviews = async () => {
        setLoading(true);
        try {
            if (userData && userData.username) {
                const response = await axios.get(`http://127.0.0.1:5000/api/reviews/user/${userData.username}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setReviews(response.data);
                setDisplayedReviews(response.data);
            }
        } catch (error) {
            console.error("❌ Error loading reviews:", error);
        } finally {
            setLoading(false);
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

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleOpenDeleteDialog = () => {
        setConfirmDeleteOpen(true);
        handleCloseContextMenu();
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

    const handleDeleteReview = async () => {
        try {
            await axios.delete(`http://127.0.0.1:5000/api/reviews/${selectedReviewId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const updatedReviews = reviews.filter(review => review._id !== selectedReviewId);
            setReviews(updatedReviews);
            setDisplayedReviews(updatedReviews);
            setConfirmDeleteOpen(false);
        } catch (error) {
            console.error("❌ Error deleting review:", error);
        }
    };

    // Fetch user reviews on component mount
    useEffect(() => {
        const loadReviews = async () => {
            setLoading(true);
            try {
                if (userData && userData.username) {
                    const response = await axios.get(`http://127.0.0.1:5000/api/reviews/user/${userData.username}`, {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    setReviews(response.data);
                }
            } catch (error) {
                console.error("❌ Error loading reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userData && userData.username) {
            loadReviews();
        }
    }, [userData, token]);

    useEffect(() => {
        sortReviews(sortMethod, sortDirection);
    }, [reviews, sortMethod, sortDirection]);

    const sortReviews = (method, direction) => {
        let sortedReviews = [...reviews];
        const isAscending = direction === "asc";

        switch (method) {
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

        setDisplayedReviews(sortedReviews);
    };

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
        // Navigate to the appropriate media page based on mediaType
        if (mediaType === 'movie') {
            navigate(`/movie/${mediaId}`);
        } else if (mediaType === 'tv') {
            navigate(`/tv/${mediaId}`);
        } else if (mediaType === 'book') {
            navigate(`/book/${mediaId}`);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                overflowX: "hidden",
            }}
        >
            {/* Navbar */}
            <Navbar userData={userData} />

            {/* Main Content */}
            <Box
                sx={{
                    mt: 10,
                    px: 8,
                    width: "100%",
                }}
            >
                {/* Header with title and sort button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4">
                        Your Reviews
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
                            startIcon={<BookmarkIcon />}
                            onClick={() => navigate("/bookmarked-reviews")}
                            sx={{ mr: 2 }}
                        >
                            Bookmarked
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<PublicIcon />}
                            onClick={() => navigate("/recent-reviews")}
                        >
                            Latest Reviews
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
                        {displayedReviews.map((review) => (
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
                                                <Typography variant="h6" noWrap>
                                                    {review.title}
                                                </Typography>
                                                <Rating value={review.rating} readOnly size="small" />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                                                <strong>{review.media_title || 'Unknown title'}</strong> • {review.media_type.charAt(0).toUpperCase() + review.media_type.slice(1)} • {new Date(review.created_at).toLocaleDateString()}
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
                                                <Typography variant="caption">{review.comments?.length || 0}</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}

                        {displayedReviews.length === 0 && (
                            <Grid item xs={12}>
                                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 5 }}>
                                    You haven't written any reviews yet. Browse movies, TV shows, or books to write reviews!
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
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={handleOpenCommentDialog}>Add Comment</MenuItem>
                {/* Only show delete option for user's own reviews */}
                {selectedReviewId && reviews.find(r => r._id === selectedReviewId)?.user_id === userData.username && (
                    <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: 'error.main' }}>Delete Review</MenuItem>
                )}
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <DialogTitle>Delete Review</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this review? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteReview} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
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
        </Box>

    );
};

export default MyReviewsPage;