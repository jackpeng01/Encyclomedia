import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../state/authSlice";
import { getUserByToken } from "../api/users";
import React, { useEffect, useState } from "react";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DemoIcon from '@mui/icons-material/Code';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.auth.token);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUserData = await getUserByToken(token);
      setUserData(fetchedUserData);
    };
    loadUserData();
  }, [token]);
  
  const handleListsClick = () => {
    navigate("/lists");
  };
  
  const handleLocalDemoClick = () => {
    navigate("/local-lists");
  };
  
  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "rgb(255, 255, 255, 0)",
        boxShadow: "none",
        width: "100vw",
        left: 0,
        right: 0,
      }}
      style={{
        zIndex: 1000,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", width: "100%", px: 10 }}>
        {/* Left Section - Logo */}
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
              color: "black",
            }}
          >
            <span style={{ fontSize: "1.3em" }}>E</span>NCYCLOMEDI
            <span style={{ fontSize: "1.3em" }}>A</span>
          </Typography>
        </Box>

        {/* Right Section - Buttons */}
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          {/* My Lists Button */}
          <Button
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              color: "black",
              "&:hover": { color: "black" },
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
            onClick={handleListsClick}
            startIcon={<FormatListBulletedIcon />}
          >
            My Lists
          </Button>
          
          {/* Local Demo Button */}
          <Button
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              color: "black",
              "&:hover": { color: "black" },
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
            onClick={handleLocalDemoClick}
            startIcon={<DemoIcon />}
          >
            Local Demo
          </Button>
          
          {/* Profile Picture */}
          <Button
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              color: "black",
              "&:hover": { color: "black" },
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              padding: "6px 10px",
            }}
            onClick={() => (window.location.href = `/${userData.username}`)}
          >
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
              fontSize: "1rem",
              color: "black",
              "&:hover": { color: "black" },
            }}
            onClick={() => {
              dispatch(setToken(null));
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