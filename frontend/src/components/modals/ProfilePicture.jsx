import React, { useState, useRef } from "react";
import { Dialog, DialogContent, Button, Typography } from "@mui/material";
import axios from "axios";

const ProfilePicture = ({ userData, viewerData, token }) => {
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(userData.profilePicture);

  const isOwner = userData.username === viewerData.username;
  const defaultProfilePicture =
    "https://res.cloudinary.com/dby0q8y9z/image/upload/v1739815199/default-profile_crftml.png";

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
      // alert("Profile picture updated successfully!");
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
            // Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setProfilePicture(defaultProfilePicture);
      // alert("Profile picture removed successfully!");
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
            filter: isHovered ? "brightness(100%)" : "none",
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
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "row", // Change to row for horizontal layout
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "50%",
              gap: "5px", // Adds space between elements
            }}
          >
            <Typography
              onClick={() => fileInputRef.current.click()}
              sx={{
                fontWeight: 100,
                textTransform: "none",
                fontSize: "1rem",
                color: "white",
                cursor: "pointer",
                padding: "3px 6px",
                transition: "border 0.2s ease-in-out",
                "&:hover": {
                  padding: "3px 6px",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderRadius: "4px",
                },
              }}
            >
              Edit
            </Typography>

            <Typography
              variant="h7"
              sx={{
                fontWeight: 10,
                color: "white",
              }}
            >
              /
            </Typography>

            <Typography
              onClick={handleRemoveProfilePicture}
              sx={{
                fontWeight: 100,
                textTransform: "none",
                fontSize: "1rem",
                color: "white",
                cursor: "pointer",
                padding: "3px 6px",
                transition: "border 0.2s ease-in-out",
                "&:hover": {
                  padding: "3px 6px",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderRadius: "4px",
                },
              }}
            >
              Delete
            </Typography>
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
            width="510"
            height="510"
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              transition: "opacity 0.3s ease-in-out",
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePicture;
