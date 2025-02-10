import React from "react";
import { Link } from "react-router-dom";
import { Button, Typography, Box, Container } from "@mui/material";

const HomePage = () => {
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",  // ✅ Centers content vertically
        alignItems: "center",       // ✅ Centers content horizontally
        height: "100vh",            // ✅ Takes full viewport height
        textAlign: "center",
      }}
    >
      {/* ✅ Title */}
      <img src="/encyclomediaglobe.png" alt="Logo" width="450" height="400" />
      <Typography
        variant="h3"
        sx={{
          fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
          fontWeight: 100,
        }}
      >
        <span style={{ fontSize: "1.3em" }}>E</span>NCYCLOMEDI
        <span style={{ fontSize: "1.3em" }}>A</span>
      </Typography>

      {/* ✅ Button (Fixes ALL CAPS) */}
      <Button
        variant="contained"
        color="customGrey"
        component={Link}
        to="/data"
        sx={{
          textTransform: "none",  // ✅ Prevents uppercase text
          mt: 2,                  // ✅ Adds margin on top
          fontSize: "1rem",       // ✅ Adjust button text size
        }}
      >
        Go to Data Page
      </Button>
    </Container>
  );
};

export default HomePage;