import { Button, Typography } from "@mui/material";
import React from "react";

import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div>
      <Typography variant="h3">404 - Page Not Found</Typography>
      <Button
        variant="contained"
        color="customGrey"
        component={Link}
        to={"/"}
        sx={{
          opacity: 0.5,
          padding: "12px 24px", // ✅ Increases button padding
          textTransform: "none",
          fontSize: "1rem",
          position: "relative",
          zIndex: 10, // Ensures it's always above other elements
          transition: "transform 0.2s ease-in-out, opacity 0.2s ease-in-out",
          pointerEvents: "auto", // Ensures it remains clickable
          "&:hover": {
            opacity: 0.9, // ✅ Increase visibility when hovered
            transform: "scale(1.2)",
          },
        }}
      >
        {"home"}
      </Button>
    </div>
  );
};

export default NotFound;
