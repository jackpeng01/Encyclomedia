import { useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";

const FollowButton = ({ userData, viewerData, setForceRefresh, initialIsFollowing }) => {
  // Determine initial follow status based on viewerData.following

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

  const handleClick = async () => {
    try {
      // Use sets to enforce uniqueness
      const updatedFollowingSet = new Set(viewerData.following);
      const updatedFollowersSet = new Set(userData.followers);

      if (!isFollowing) {
        // Follow action: add the user to viewer's following, and viewer to user's followers
        updatedFollowingSet.add(userData.username);
        updatedFollowersSet.add(viewerData.username);
      } else {
        // Unfollow action: remove the user from viewer's following, and viewer from user's followers
        updatedFollowingSet.delete(userData.username);
        updatedFollowersSet.delete(viewerData.username);
      }

      // Convert the sets back to arrays for the API call
      const updatedFollowing = Array.from(updatedFollowingSet);
      const updatedFollowers = Array.from(updatedFollowersSet);

      // Make two PATCH requests: one for updating the viewer and one for updating the user.
      await Promise.all([
        axios.patch(
          `http://127.0.0.1:5000/api/users/${viewerData.username}`,
          { following: updatedFollowing },
          { withCredentials: true }
        ),
        axios.patch(
          `http://127.0.0.1:5000/api/users/${userData.username}`,
          { followers: updatedFollowers },
          { withCredentials: true }
        ),
      ]);

      // Update follow state
      setIsFollowing((prev) => !prev);
      setForceRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  return (
    <Button
      onClick={handleClick}
      sx={{
        backgroundColor: isFollowing ? "white" : "#0095f6",
        color: isFollowing ? "black" : "white",
        border: isFollowing ? "1px solid #dbdbdb" : "none",
        textTransform: "none",
        fontWeight: "bold",
        borderRadius: "99px",
        paddingX: 2.5,
        paddingY: 1,
        width: "100px",
        height: "40px",
        "&:hover": {
          backgroundColor: isFollowing ? "#efefef" : "#007dd1",
        },
        "&:active": {
          backgroundColor: isFollowing ? "#e0e0e0" : "#006bb3",
        },
      }}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}

export default FollowButton;
