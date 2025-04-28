import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { FaHeart } from 'react-icons/fa';

const FavoriteButton = ({ id, mediaType, userLikes = [], toggleLike }) => {
  // Initialize the local isLiked state based on userLikes
  const [isLiked, setIsLiked] = useState(
    Array.isArray(userLikes) &&
    userLikes.some(item => item.id === id && item.mediaType === mediaType)
  );

  // Sync the isLiked state with changes in userLikes prop
  useEffect(() => {
    if (Array.isArray(userLikes)) {
      setIsLiked(
        userLikes.some(item => item.id === id && item.mediaType === mediaType)
      );
    }
  }, [userLikes, id, mediaType]);

  // Function to toggle the like status
  const handleToggleLike = () => {
    // Call the toggleLike function from the parent to update the userLikes state
    setIsLiked(!isLiked)
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
