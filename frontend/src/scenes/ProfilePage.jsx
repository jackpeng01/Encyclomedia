import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUserByToken, getUserByUsername } from "../api/users";
import Navbar from "../components/Navbar";
import ProfilePicture from "../components/modals/ProfilePicture";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate(); 
  const [userData, setUserData] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const [viewerData, setViewerData] = useState([]);

  useEffect(() => {
    const loadViewerData = async () => {
      const fetchedViewerData = await getUserByToken(token);
      setViewerData(fetchedViewerData);
    };
    loadViewerData();
  }, [token]);

  useEffect(() => {
    const fetchProfile = async () => {
      const fetchedProfile = await getUserByUsername(username);
      setUserData(fetchedProfile);
    };
    fetchProfile();
  }, [username]);

  if (!userData) return <p>Loading...</p>;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Navbar userData={userData} />

      {/* ✅ Profile Header Section (Flex Layout) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5, // Adds spacing between profile info & stats
          mt: 10,
          px: 4,
          flexWrap: "wrap", // Ensures responsiveness on smaller screens
        }}
      >
        {/* ✅ Left Section: Profile Picture & Username */}
        <Box sx={{ textAlign: "center" }}>
          <ProfilePicture
            userData={userData}
            viewerData={[]}
            token={token}
          />
          <Typography variant="h4" sx={{ fontWeight: 400 }}>
            {userData.username}
          </Typography>
          <Box sx={{ textAlign: "left", mt: 0 }}>
            {userData.username === viewerData.username && (
              <Button
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  color: "black",
                  display: "block", // Ensures button is left-aligned with username
                  textAlign: "left",
                  "&:hover": { color: "black" },
                  padding: 0, // Removes extra spacing
                }}
              onClick={()=>navigate("/settings")}>
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>

        {/* ✅ Right Section: Profile Statistics & Bio (Same Box) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            // backgroundColor: "rgba(0, 0, 0, 0.05)", // Light gray background
            borderRadius: "10px",
            maxWidth: "600px",
            minWidth: "400px",
          }}
        >
          {/* ✅ Stats (Horizontally Stacked) */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 5,
              fontSize: "1.2rem",
              textAlign: "center",
              mb: 5, // Adds spacing before the bio
            }}
          >
            {[
              { label: "Reviews", value: 0 },
              { label: "Lists", value: 0 },
              { label: "Media", value: 99 },
              { label: "Followers", value: "9B" },
              { label: "Following", value: "18B" },
            ].map((stat, index) => (
              <Box key={index} sx={{ textAlign: "center" }}>
                <Typography sx={{ fontWeight: 500, fontSize: "1.5rem" }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontWeight: 300, fontSize: "1rem" }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* ✅ Bio (Now Inside the Same Box) */}
          <Typography
            sx={{
              color: "gray",
              fontSize: "1rem",
              textAlign: "center",
              maxWidth: "500px",
            }}
          >
            {userData.bio}
          </Typography>
        </Box>
      </Box>

      {/* ✅ Favorite Media Section */}
      <Box sx={{ maxWidth: "900px", margin: "auto", mt: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 400, mb: 2 }}>
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
    </Box>
  );
};

export default ProfilePage;
