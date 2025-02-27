import React, { useState, useRef } from "react";
import { Dialog, DialogContent, Button, Typography } from "@mui/material";
import axios from "axios";

const ProfilePicture = ({ userData, viewerData, token }) => {
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(userData.profilePicture);

  const isOwner = userData.username === viewerData.username;
  const defaultProfilePicture = "https://res.cloudinary.com/dby0q8y9z/image/upload/v1739815199/default-profile_crftml.png";

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/users/${userData.username}/upload-profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setProfilePicture(response.data.profilePicture);
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("❌ Error uploading profile picture:", error);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      await axios.patch(
        `http://127.0.0.1:5000/api/users/${userData.username}`,
        {
          profilePicture: defaultProfilePicture,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setProfilePicture(defaultProfilePicture);
      alert("Profile picture removed successfully!");
    } catch (error) {
      console.error("❌ Error removing profile picture:", error);
    }
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          display: "inline-block",
          cursor: "pointer",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          overflow: "hidden",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={profilePicture || defaultProfilePicture}
          alt="Profile"
          width="150"
          height="150"
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            transition: "opacity 0.3s ease-in-out",
            filter: isHovered ? "brightness(70%)" : "none",
          }}
          onClick={() => !isOwner && setIsModalOpen(true)}
        />
        {isOwner && isHovered && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "50%",
            }}
          >
            <Button
              sx={{
                textTransform: "none",
                fontSize: "1rem",
                backgroundColor: "#333333", // Dark grey background
                padding: "3px 3px", // Adjust padding if needed
                "&:hover": {
                  backgroundColor: "#444444", // Slightly lighter grey on hover
                },
              }}
              variant="contained"
              onClick={() => fileInputRef.current.click()}
            >
              Edit
            </Button>
            <Typography
              variant="h7"
              sx={{
                // fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
                fontWeight: 100,
                // ml: 1,
                color: "white", // ✅ Ensures black text
              }}
            >
              or
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleRemoveProfilePicture}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        slotProps={{
          paper: {
            style: {
              backgroundColor: "transparent",
              boxShadow: "none",
              borderRadius: "50%",
            },
          },
        }}
      >
        <DialogContent
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 0,
            borderRadius: "50%",
          }}
        >
          <img
            src={profilePicture || defaultProfilePicture}
            alt="Enlarged Profile"
            style={{ width: "75%", height: "auto", borderRadius: "50%" }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePicture;
