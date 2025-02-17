import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const token = useSelector((state) => state.auth.token);
  useEffect(() => {
    const verifyToken = async () => {
      try {
        console.log("🔍 Sending Authorization Token:", token);
        // ✅ Send request with credentials (cookies)
        const response = await axios.get(
          "http://127.0.0.1:5000/api/auth/verify-token",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );

        if (response.data.valid) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (error) {
        setIsValid(false);
      }
    };

    verifyToken();
  }, [token]);
  if (isValid === null) {
    return <p>Loading...</p>; // ✅ Show loading state instead of redirecting immediately
  }
  return isValid ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
