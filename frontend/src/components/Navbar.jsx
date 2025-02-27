import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../state/authSlice";
import { getUserByToken } from "../api/users";
import React, { useEffect, useState } from "react";

const Navbar = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUserData = await getUserByToken(token);
      setUserData(fetchedUserData);
      console.log("userdata: ", userData);
    };
    loadUserData();
  }, [token]);
  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "rgb(255, 255, 255)", // ✅ Light gray for better contrast
        boxShadow: "none",
        width: "100vw",
        left: 0,
        right: 0,
      }}
      style={{
        zIndex: 1000, // ✅ Keeps navbar on top
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", width: "100%", px: 10 }}>
        {/* ✅ Left Section - Logo */}
        <Box
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => (window.location.href = "/home")}
        >
          <Typography
            variant="h7"
            sx={{
              fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
              fontWeight: 100,
              ml: 1,
              color: "black", // ✅ Ensures black text
            }}
          >
            <span style={{ fontSize: "1.3em" }}>E</span>NCYCLOMEDI
            <span style={{ fontSize: "1.3em" }}>A</span>
          </Typography>
        </Box>

        {/* ✅ Right Section - Buttons */}
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          {" "}
          {/* ✅ Centers items vertically */}
          {/* ✅ Profile Picture */}
          <Button
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              color: "black", // ✅ Ensures black text
              "&:hover": { color: "black" }, // ✅ Keeps text black on hover
              display: "flex",
              alignItems: "center", // ✅ Ensures image and text are aligned
              gap: 1.5, // ✅ Adds spacing between the image and text
              padding: "6px 10px", // ✅ Adds padding for better clickability
            }}
            onClick={()=>window.location.href = `/${userData.username}`}
          >
            {/* ✅ Profile Picture Inside Button */}
            <img
              src={userData.profilePicture}
              alt="Profile"
              width="40"
              height="40"
              style={{
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            {userData.username}
          </Button>
          <Button
            sx={{
              textTransform: "none",
              //   mt: 2,
              fontSize: "1rem",
              color: "black", // ✅ Ensures black text
              "&:hover": { color: "black" }, // ✅ Ensures hover text remains black
            }}
            onClick={() => {
              dispatch(setToken(null)); // ✅ Logout action
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
