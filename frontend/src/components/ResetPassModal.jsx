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
// import { resetPassword } from "../api/ResetPass"; // API function

const ResetPasswordModal = ({ open, onClose, token }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // ✅ Password validation regex: At least 12 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;

  const validateFields = () => {
    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must be at least 12 characters, contain one uppercase, one lowercase, and one number."
      );
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    setError("");
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateFields()) return;

    try {
    //   await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate("/login"); // Redirect to login page
      }, 2000);
    } catch (err) {
      console.error("❌ Error resetting password:", err);
      setError("Failed to reset password. Try again.");
    }
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
            <Typography color="green" sx={{ mb: 2 }}>
              ✅ Password reset successful! Redirecting to login...
            </Typography>
          ) : (
            <>
              <TextField
                label="New Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={!!error}
              />
              <TextField
                label="Confirm New Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!error}
                helperText={error}
              />
              <Button
                variant="contained"
                color="white"
                fullWidth
                sx={{ mt: 2 }}
                // onClick={handleResetPassword}
              >
                Reset Password
              </Button>
              <Button
                variant="text"
                color="secondary"
                fullWidth
                sx={{ mt: 1 }}
                onClick={()=>{navigate("/")}}
              >
                never mind, I actually remember my password
              </Button>
            </>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal;
