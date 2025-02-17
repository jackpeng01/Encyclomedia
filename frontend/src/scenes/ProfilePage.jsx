import { Button } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUserByUsername } from "../api/users";
import Navbar from "../components/Navbar";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false); // ✅ State for hover effect

  useEffect(() => {
    const fetchProfile = async () => {
      const fetchedProfile = await getUserByUsername(username);
      setUserData(fetchedProfile);
    };

    fetchProfile();
  }, [username]);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/users/${username}/upload-profile-picture`,
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
      setUserData((prev) => ({
        ...prev,
        profilePicture: response.data.profilePicture,
      }));

      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("❌ Error uploading profile picture:", error);
    }
  };

  if (!userData) return <p>Loading...</p>;

  return (
    <div>
      <Navbar userData={userData} />
      <Button
        variant="contained"
        color="customGrey"
        onClick={() => navigate("/home")}
        sx={{
          opacity: 0.5,
          padding: "12px 24px",
          textTransform: "none",
          fontSize: "1rem",
          transition: "transform 0.2s ease-in-out, opacity 0.2s ease-in-out",
          "&:hover": { opacity: 0.9, transform: "scale(1.2)" },
        }}
      >
        Home
      </Button>

      {/* ✅ Clickable Profile Picture with Hover Effect */}
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
        <img
          src={userData.profilePicture}
          alt="Profile"
          width="150"
          height="150"
          style={{
            borderRadius: "50%", // ✅ Circular shape
            objectFit: "cover", // ✅ Ensures it fills the circle
            transition: "opacity 0.3s ease-in-out",
            filter: isHovered ? "brightness(70%)" : "none", // ✅ Dim image slightly on hover
          }}
        />

        {/* ✅ Edit Text Overlay (Only Appears on Hover) */}
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
              textAlign: "center",
            }}
          >
            Edit
          </div>
        )}
      </div>
      <h1>{userData.username}'s Profile</h1>

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

export default ProfilePage;
