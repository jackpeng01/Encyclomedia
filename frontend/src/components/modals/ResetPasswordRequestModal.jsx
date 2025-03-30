import {
  Box,
  Button,
  Dialog,
  DialogContent,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPasswordRequest } from "../../api/ResetPass";
// import { resetPassword } from "../api/ResetPass"; // API function

const ResetPasswordRequestModal = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // ✅ Password validation regex: At least 12 characters, one uppercase, one lowercase, one number

  const handleResetPasswordRequest = async (email) => {
    await resetPasswordRequest(email);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          style: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(5px)",
            borderRadius: "10px",
          },
        },
      }}
    >
      <DialogContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ textAlign: "center", padding: "10px" }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: `"Libre Caslon Text", "Roboto", "Arial", sans-serif`,
              mb: 2,
            }}
          >
            Reset Your Password
          </Typography>

          {success ? (
            <Typography sx={{ mb: 2 }}>
              Instructions have been sent to the email provided.
            </Typography>
          ) : (
            <>
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                variant="text"
                color="secondary"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => {
                  setSuccess(true);
                  handleResetPasswordRequest(email);
                }}
              >
                send request
              </Button>
            </>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordRequestModal;
