import React, { useState, useRef } from "react";
import { Dialog, DialogContent } from "@mui/material";
import axios from "axios";

const ProfilePicture = ({ userData, viewerData, token }) => {
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(userData.profilePicture);

  const isOwner = userData.username === viewerData.username;

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

      // ✅ Update profile picture immediately
      setProfilePicture(response.data.profilePicture);
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("❌ Error uploading profile picture:", error);
    }
  };

  const handleClick = () => {
    if (isOwner) {
      fileInputRef.current.click();
    } else {
      setIsModalOpen(true); // Show enlarged image
    }
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          display: "inline-block",
          cursor: "pointer",
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={userData.profilePicture}
          alt="Profile"
          width="150"
          height="150"
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            transition: "opacity 0.3s ease-in-out",
            filter: isHovered ? "brightness(70%)" : "none",
          }}
        />
        {isOwner && isHovered && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              padding: "5px 10px",
              borderRadius: "5px",
              fontSize: "14px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Edit
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Modal for Enlarged Profile Picture */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        slotProps={{
          paper: {
            style: {
              // filter: "invert(1)",
              // backgroundColor: "#FFF",
              backgroundColor: "transparent", // Removes background
              boxShadow: "none", // Removes shadow
              //   backdropFilter: "blur(5px)",
              //   padding: "0px",
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
            borderRadius: "50%", // Ensures the dialog content is circular
          }}
        >
          <img
            src={userData.profilePicture}
            alt="Enlarged Profile"
            style={{ width: "75%", height: "auto", borderRadius: "50%" }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePicture;
