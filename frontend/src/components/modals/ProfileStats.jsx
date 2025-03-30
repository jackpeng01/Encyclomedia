import React, { useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
} from "@mui/material";

const ProfileStats = ({ userData, isDarkMode }) => {
  // State for dialog open/close and which list to display
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);

  // Open dialog and set the type ("followers" or "following")
  const handleOpen = (type) => {
    setDialogType(type);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDialogType(null);
  };

  // Define the stats with flags for clickable fields
  const stats = [
    { label: "Reviews", value: 0 },
    { label: "Lists", value: 0 },
    { label: "Media", value: 99 },
    {
      label: userData.followers.length === 1 ? "Follower" : "Followers",
      value: userData.followers.length,
      clickable: true,
      type: "followers",
    },
    {
      label: "Following",
      value: userData.following.length,
      clickable: true,
      type: "following",
    },
  ];

  // Select which data to show based on the dialog type
  const dialogData =
    dialogType === "followers"
      ? userData.followers
      : dialogType === "following"
      ? userData.following
      : [];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 5,
          fontSize: "1.2rem",
          textAlign: "center",
          mb: 5,
        }}
      >
        {stats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              textAlign: "center",
              cursor: stat.clickable ? "pointer" : "default",
            }}
            onClick={() => stat.clickable && handleOpen(stat.type)}
          >
            <Typography sx={{ fontWeight: 500, fontSize: "1.5rem" }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontWeight: 300, fontSize: "1rem" }}>
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Dialog for displaying the followers or following list */}
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              filter: isDarkMode ? "invert(1)" : "invert(0)",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(5px)",
              borderRadius: "10px",
            },
          },
        }}
      >
        <DialogTitle>
          {dialogType === "followers" ? "Followers" : "Following"}
        </DialogTitle>
        <DialogContent>
          <List>
            {dialogData.length > 0 ? (
              dialogData.map((user, idx) => {
                // Determine the username (assuming user object has username, name, or is a string)
                const username = user.username || user.name || user;
                return (
                  <ListItem key={idx}>
                    <Typography
                      variant="body1"
                      sx={{ cursor: "pointer" }}
                      onClick={() => (window.location.href = `/${username}`)}
                    >
                      {username}
                    </Typography>
                  </ListItem>
                );
              })
            ) : (
              <Typography
                variant="body1"
              >
                No users found.
              </Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileStats;
