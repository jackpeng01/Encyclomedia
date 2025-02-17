import { Button, Link } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUserByUsername } from "../api/users";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { username } = useParams(); // ✅ Get username from URL
  const [userData, setUserData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchProfile = async () => {
      const fetchedProfile = await getUserByUsername(username);
      setUserData(fetchedProfile);
    };

    fetchProfile();
  }, [username]);
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]); // ✅ Store selected file
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image to upload.");
      return;
    }

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

      // ✅ Update user profile with new image URL
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
      <Button
        variant="contained"
        color="customGrey"
        onClick={() => {
          navigate("/home");
        }}
        sx={{
          opacity: 0.5,
          padding: "12px 24px",
          textTransform: "none",
          fontSize: "1rem",
          position: "relative",
          zIndex: 10,
          transition: "transform 0.2s ease-in-out, opacity 0.2s ease-in-out",
          pointerEvents: "auto",
          "&:hover": {
            opacity: 0.9,
            transform: "scale(1.2)",
          },
        }}
      >
        {"home"}
      </Button>
      <h1>{userData.username}'s Profile</h1>
      <img
        src={userData.profilePicture}
        alt="Profile"
        width="150"
        height="150"
      />

      <p>Email: {userData.email}</p>

      {/* ✅ Upload Form */}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Profile Picture</button>
    </div>
  );
};

export default ProfilePage;
