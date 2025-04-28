import { useState } from "react";
import axios from "axios";
import { Button, IconButton, Menu, MenuItem, Box } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const FollowButton = ({
  userData,
  viewerData,
  setForceRefresh,
  initialIsFollowing,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleFollowClick = async () => {
    try {
      const updatedFollowingSet = new Set(viewerData.following);
      const updatedFollowersSet = new Set(userData.followers);

      if (!isFollowing) {
        updatedFollowingSet.add(userData.username);
        updatedFollowersSet.add(viewerData.username);
      } else {
        updatedFollowingSet.delete(userData.username);
        updatedFollowersSet.delete(viewerData.username);
      }

      const updatedFollowing = Array.from(updatedFollowingSet);
      const updatedFollowers = Array.from(updatedFollowersSet);

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

      setIsFollowing((prev) => !prev);
      setForceRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBlock = () => {
    console.log("Block user", userData.username);
    handleMenuClose();
  };

  const handleReport = () => {
    console.log("Report user", userData.username);
    handleMenuClose();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Button
        onClick={handleFollowClick}
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
      <IconButton onClick={handleMenuOpen}>
        <MoreHorizIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleBlock}>Block</MenuItem>
        <MenuItem onClick={handleReport}>Report</MenuItem>
      </Menu>
    </Box>
  );
};

export default FollowButton;
