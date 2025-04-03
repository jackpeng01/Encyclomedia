import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Rating,
    CircularProgress,
    Alert,
    IconButton,
    Divider,
    Tooltip
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaListUl
} from 'react-icons/fa';

const ReviewModal = ({ open, onClose, media, mediaType, onReviewSubmitted }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const token = useSelector((state) => state.auth.token);
    const textFieldRef = useRef(null);

    const applyFormatting = (formatType) => {
        const textField = textFieldRef.current;
        if (!textField) return;

        const start = textField.selectionStart;
        const end = textField.selectionEnd;
        const selectedText = content.substring(start, end);

        let formattedText = '';
        let cursorOffset = 0;

        switch (formatType) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                cursorOffset = 2;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                cursorOffset = 1;
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                cursorOffset = 2;
                break;
            case 'bullet':
                formattedText = selectedText.split('\n').map(line => `• ${line}`).join('\n');
                cursorOffset = 2;
                break;
            default:
                return;
        }

        const newContent = content.substring(0, start) + formattedText + content.substring(end);
        setContent(newContent);

        // Set cursor position after formatting
        setTimeout(() => {
            textField.focus();
            if (start === end) {
                // If no text was selected, place cursor inside the formatting marks
                textField.selectionStart = start + cursorOffset;
                textField.selectionEnd = start + cursorOffset;
            } else {
                // If text was selected, place cursor at the end of the formatted text
                textField.selectionStart = start + formattedText.length;
                textField.selectionEnd = start + formattedText.length;
            }
        }, 0);
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim() || rating === 0) {
          setError("Please fill all fields and provide a rating");
          return;
        }
        
        setIsSubmitting(true);
        setError(null);
        
        try {
          const response = await axios.post(
            "http://127.0.0.1:5000/api/reviews",
            {
              media_id: media.id,
              media_type: mediaType,
              media_title: media.title,
              title,
              content,
              rating
            },
            {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );
          
          if (onReviewSubmitted) {
            onReviewSubmitted(response.data);
          }
          
          handleClose();
        } catch (err) {
          console.error("Error submitting review:", err);
          setError(err.response?.data?.error || "Failed to submit review");
        } finally {
          setIsSubmitting(false);
        }
      };

    const handleClose = () => {
        setTitle("");
        setContent("");
        setRating(0);
        setError(null);
        onClose();
    };

    const formatPreview = (text) => {
        let formattedText = text;

        // Bold
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Underline
        formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');

        // Bullet points
        formattedText = formattedText.replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>');
        if (formattedText.includes('<li>')) {
            formattedText = '<ul>' + formattedText + '</ul>';
            formattedText = formattedText.replace(/<\/ul><ul>/g, '');
        }

        return formattedText;
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { p: 2 } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h5" component="div">
                    Write a Review
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {media?.title || ''}
                </Typography>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    label="Review Title"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    margin="normal"
                    variant="outlined"
                />

                <Box sx={{ my: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Your Rating
                    </Typography>
                    <Rating
                        value={rating}
                        onChange={(_, newValue) => setRating(newValue)}
                        size="large"
                        precision={1}
                    />
                </Box>

                {/* Formatting toolbar */}
                <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
                    <Tooltip title="Bold">
                        <IconButton onClick={() => applyFormatting('bold')}>
                            <FaBold />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Italic">
                        <IconButton onClick={() => applyFormatting('italic')}>
                            <FaItalic />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Underline">
                        <IconButton onClick={() => applyFormatting('underline')}>
                            <FaUnderline />
                        </IconButton>
                    </Tooltip>
                    <Divider orientation="vertical" flexItem />
                    <Tooltip title="Bullet List">
                        <IconButton onClick={() => applyFormatting('bullet')}>
                            <FaListUl />
                        </IconButton>
                    </Tooltip>
                </Box>

                <TextField
                    label="Your Review"
                    multiline
                    rows={8}
                    fullWidth
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    placeholder="Share your thoughts about this title..."
                    inputRef={textFieldRef}
                />

                {content && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Preview
                        </Typography>
                        <Box
                            sx={{
                                p: 2,
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                minHeight: '100px',
                                bgcolor: '#f9f9f9'
                            }}
                            dangerouslySetInnerHTML={{ __html: formatPreview(content) }}
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isSubmitting || !title.trim() || !content.trim() || rating === 0}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : "Submit Review"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReviewModal;