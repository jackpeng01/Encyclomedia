import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Box } from "@mui/material";
import { motion } from "framer-motion";

const buttonData = [
  { text: "Create Lists", link: "/data" },
  { text: "Search for Entertainment", link: "/data" },
  { text: "Connect with Friends", link: "/data" },
];

const RotatingButtons = () => {
  const [buttons, setButtons] = useState(buttonData);

  useEffect(() => {
    const interval = setInterval(() => {
      setButtons((prevButtons) => {
        return [...prevButtons.slice(1), prevButtons[0]];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 4,
        mt: 2,
        position: "relative", // Ensures layout control
      }}
    >
      {buttons.map((button, index) => (
        <motion.div
          key={button.text}
          layout
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ position: "relative", zIndex: 10, pointerEvents: "auto" }} // Ensures it's always clickable
        >
          <Button
            variant="contained"
            color="customGrey"
            component={Link}
            to={button.link}
            sx={{
              opacity: 0.5,
              padding: "12px 24px", // ✅ Increases button padding
              textTransform: "none",
              fontSize: "1rem",
              position: "relative",
              zIndex: 10, // Ensures it's always above other elements
              transition:
                "transform 0.2s ease-in-out, opacity 0.2s ease-in-out",
              pointerEvents: "auto", // Ensures it remains clickable
              "&:hover": {
                opacity: 0.9, // ✅ Increase visibility when hovered
                transform: "scale(1.2)",
              },
            }}
          >
            {button.text}
          </Button>
        </motion.div>
      ))}
    </Box>
  );
};

export default RotatingButtons;
