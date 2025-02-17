import { useState, useRef } from "react";

const ProfilePicture = ({ userData, fileInputRef, handleFileChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        cursor: "pointer",
      }}
      onClick={() => fileInputRef.current.click()} // ✅ Click file input when image is clicked
      onMouseEnter={() => setIsHovered(true)} // ✅ Show "Edit" on hover
      onMouseLeave={() => setIsHovered(false)} // ✅ Hide "Edit" when not hovering
    >
      {/* ✅ Profile Image */}
      <img
        src={userData.profilePicture}
        alt="Profile"
        width="150"
        height="150"
        style={{
          borderRadius: "50%",
          objectFit: "cover",
          transition: "opacity 0.3s ease-in-out",
          filter: isHovered ? "brightness(70%)" : "none", // ✅ Dim image slightly on hover
        }}
      />

      {/* ✅ Edit Text Overlay */}
      {isHovered && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.6)", // ✅ Dark semi-transparent background
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Edit
        </div>
      )}

      {/* ✅ Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange} // ✅ Uploads image after selection
      />
    </div>
  );
};

export default ProfilePicture;
