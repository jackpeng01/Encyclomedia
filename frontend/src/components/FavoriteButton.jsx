import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { FaHeart } from 'react-icons/fa';

const FavoriteButton = ({ id, mediaType, userLikes, toggleLike }) => {
  // Initialize the local isLiked state based on userLikes
  const [isLiked, setIsLiked] = useState(userLikes[mediaType]?.includes(id));

  // Function to toggle the like status and switch the color
  const handleToggleLike = () => {
    // Toggle the isLiked state locally
    setIsLiked(prev => !prev);

    // Call the toggleLike function from the parent to update the userLikes state
    toggleLike(id, mediaType);
  };

  return (
    <IconButton onClick={handleToggleLike}>
      {/* Switch the heart color based on the isLiked state */}
      <FaHeart color={isLiked ? "#ff0000" : "#ccc"} size={24} />
    </IconButton>
  );
};

export default FavoriteButton;
