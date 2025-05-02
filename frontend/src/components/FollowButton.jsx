import { useState } from "react";
import axios from "axios";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const FollowButton = ({
  userData,
  viewerData,
  setForceRefresh,
  initialIsFollowing,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [anchorEl, setAnchorEl] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [hasReported, setHasReported] = useState(false);

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

  const handleBlock = async () => {
    try {
      const updatedBlockedSet = new Set(viewerData.blocked || []);
      updatedBlockedSet.add(userData.username);
      const updatedBlocked = Array.from(updatedBlockedSet);

      const updatedViewerFollowing = new Set(viewerData.following || []);
      updatedViewerFollowing.delete(userData.username);

      const updatedViewerFollowers = new Set(viewerData.followers || []);
      updatedViewerFollowers.delete(userData.username);

      const updatedUserFollowing = new Set(userData.following || []);
      updatedUserFollowing.delete(viewerData.username);

      const updatedUserFollowers = new Set(userData.followers || []);
      updatedUserFollowers.delete(viewerData.username);

      await Promise.all([
        axios.patch(
          `http://127.0.0.1:5000/api/users/${viewerData.username}`,
          {
            blocked: Array.from(updatedBlocked),
            following: Array.from(updatedViewerFollowing),
            followers: Array.from(updatedViewerFollowers),
          },
          { withCredentials: true }
        ),
        axios.patch(
          `http://127.0.0.1:5000/api/users/${userData.username}`,
          {
            following: Array.from(updatedUserFollowing),
            followers: Array.from(updatedUserFollowers),
          },
          { withCredentials: true }
        ),
      ]);

      console.log(
        "Blocked user and removed mutual follows:",
        userData.username
      );
      setForceRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Error blocking user:", error);
    } finally {
      handleMenuClose();
    }
  };

  const handleReport = () => {
    if (hasReported) {
      setReportSubmitted(true);
      handleMenuClose();
      return;
    }
    setReportDialogOpen(true);
    handleMenuClose();
  };

  const handleSubmitReport = () => {
    console.log("Report submitted:", reportText);
    setReportText("");
    setReportDialogOpen(false);
    setReportSubmitted(true);
    setTimeout(() => {
      setHasReported(true);
    }, 3100);
  };

  const handleSnackbarClose = () => {
    setReportSubmitted(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexDirection: "column",
      }}
    >
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
          <MenuItem onClick={handleReport} disabled={hasReported}>
            Report
          </MenuItem>
        </Menu>
      </Box>

      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            style: {
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(5px)",
              borderRadius: "10px",
            },
          },
        }}
      >
        <DialogContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ textAlign: "center", padding: "10px" }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
                mb: 2,
              }}
            >
              Report User
            </Typography>

            <TextField
              label="Describe the issue"
              multiline
              minRows={3}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              fullWidth
              margin="normal"
              autoFocus
            />

            <Button
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleSubmitReport}
              disabled={reportText.trim() === ""}
            >
              Submit Report
            </Button>
            <Button
              variant="text"
              color="secondary"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => setReportDialogOpen(false)}
            >
              Cancel
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={reportSubmitted}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={hasReported ? "warning" : "success"}
          onClose={handleSnackbarClose}
          sx={{ width: "100%" }}
        >
          {hasReported
            ? "You have already reported this user. Please wait."
            : "Report submitted successfully."}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FollowButton;
