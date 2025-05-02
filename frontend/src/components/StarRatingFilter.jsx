import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { FaStar } from "react-icons/fa";

const StarRatingFilter = ({ movieLog, setFilteredMovieLog, resetFilter }) => {
    const [ratingRange, setRatingRange] = useState([0, 5]); // Default range: 0 to 5
    const [hoverRating, setHoverRating] = useState(0); // Track hover state
    const [dragging, setDragging] = useState(false); // Track dragging state

    const handleStarClick = (star) => {
        setRatingRange([star, star]); // Set both start and end of the range to the same value
        filterMovies([star, star]); // Filter movies with the exact rating
    };

    const handleDragStart = (star) => {
        setDragging(true);
        setRatingRange([star, star]);
    };

    const handleDragMove = (star) => {
        if (dragging) {
            const [start, end] = ratingRange;
            const newRange = [Math.min(start, star), Math.max(end, star)];
            setRatingRange(newRange);
        }
    };

    const handleDragEnd = () => {
        setDragging(false);
        filterMovies(ratingRange);
    };

    const filterMovies = (range) => {
        const filtered = movieLog.filter(
            (entry) => entry.rating >= range[0] && range[1] >= entry.rating
        );
        setFilteredMovieLog(filtered);
    };

    const renderStar = (star) => {
        const isHovered = hoverRating === star;
        const isSelected = star >= ratingRange[0] && star <= ratingRange[1];

        return (
            <FaStar
                key={star}
                size={30}
                color={isHovered || isSelected ? "#ffc107" : "#e4e5e9"} // Highlight hovered or selected stars
                style={{
                    cursor: "pointer",
                    transition: "color 0.2s ease-in-out, transform 0.2s ease-in-out",
                    transform: isHovered ? "scale(1.2)" : "scale(1)", // Slight enlargement on hover
                }}
                onMouseEnter={() => setHoverRating(star)} // Set hover when entering a star
                onMouseLeave={() => setHoverRating(0)} // Reset hover when leaving a star
                onMouseDown={() => handleDragStart(star)} // Start dragging
                onMouseMove={() => dragging && handleDragMove(star)} // Update range while dragging
                onMouseUp={handleDragEnd} // End dragging
                onClick={() => handleStarClick(star)} // Update rating on click
            />
        );
    };

    // Reset filter when the parent component triggers resetFilter
    React.useEffect(() => {
        if (resetFilter) {
            setRatingRange([0, 5]);
            setFilteredMovieLog(movieLog);
        }
    }, [resetFilter, movieLog, setFilteredMovieLog]);

    return (
        <Box sx={{ textAlign: "center" }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                    cursor: "pointer",
                }}
            >
                {[1, 2, 3, 4, 5].map((star) => renderStar(star))}
            </Box>
        </Box>
    );
};

export default StarRatingFilter;
