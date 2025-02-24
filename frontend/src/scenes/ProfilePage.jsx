import { Box, Button, Typography } from "@mui/material";
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
  const [isHovered, setIsHovered] = useState(false);

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // ✅ Ensures full viewport height
        // width: "100vw", // ✅ Forces it to take full width
        overflowX: "hidden", // ✅ Prevents unwanted horizontal scrolling
      }}
    >
      <Navbar userData={userData} />

      {/* ✅ Profile Section */}
      <Box sx={{ textAlign: "center", mt: 10 }}>
        {/* ✅ Clickable Profile Picture */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            cursor: "pointer",
          }}
          onClick={() => fileInputRef.current.click()}
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
            //   filter: "invert(1)",
            }}
          />
          {isHovered && (
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

        {/* ✅ Username */}
        <Typography
          variant="h4"
          sx={{
            // fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 400,
            mt: 2,
          }}
        >
          {userData.username}
        </Typography>

        {/* ✅ Profile Stats */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 5,
            mt: 2,
            fontSize: "1.2rem",
          }}
        >
          <Typography sx={{ fontWeight: 300 }}>
            <strong>0</strong> <br /> Reviews
          </Typography>
          <Typography sx={{ fontWeight: 300 }}>
            <strong>0</strong> <br /> Lists
          </Typography>
          <Typography sx={{ fontWeight: 300 }}>
            <strong>99</strong> <br /> Media
          </Typography>
          <Typography sx={{ fontWeight: 300 }}>
            <strong>9B</strong> <br /> Followers
          </Typography>
          <Typography sx={{ fontWeight: 300 }}>
            <strong>18B</strong> <br /> Following
          </Typography>
        </Box>

        {/* ✅ Bio Section */}
        <Typography
          sx={{
            maxWidth: "600px",
            margin: "auto",
            mt: 2,
            color: "gray",
            fontSize: "1rem",
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
          pharetra consectetur dolor at molestie.
        </Typography>
      </Box>

      {/* ✅ Favorite Media Section */}
      <Box sx={{ maxWidth: "900px", margin: "auto", mt: 5 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
            fontWeight: 400,
            mb: 2,
          }}
        >
          Favorite Media:
        </Typography>

        {/* ✅ Media Grid */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            "The Great Gatsby",
            "Cars 2",
            "Diary of a Wimpy Kid: Rodrick Rules",
            "The Brothers Karamazov",
            "Boruto",
            "Introduction to Algorithms by Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, and Clifford Stein.",
          ].map((media, index) => (
            <Box
              key={index}
              sx={{
                width: "160px",
                height: "200px",
                backgroundColor: "lightgray",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderRadius: "5px",
                fontSize: "1rem",
                fontWeight: "400",
                padding: "10px",
              }}
            >
              {media}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ✅ Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default ProfilePage;
