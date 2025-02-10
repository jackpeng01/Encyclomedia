import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CssBaseline, Container } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { themeSettings } from "./theme";
import HomePage from "./scenes/HomePage";
import DataPage from "./scenes/DataPage";
import NotFound from "./scenes/NotFound";
import axios from "axios";

function App() {
  // Redux state for theme mode (if used in your app)
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  // Authentication state (if used later)
  const isAuth = Boolean(useSelector((state) => state.token));

  // State management for data
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/data", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      });
      console.log("✅ Fetched Data:", response.data);
      setData(response.data); // Ensure it's an array
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    }
  };

  const addItem = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/data", {
        item: newItem,
        withCredentials: true,
      });
      console.log("✅ POST response:", response);
      fetchData();
      setNewItem("");
    } catch (error) {
      console.error("❌ Error adding item:", error);
    }
  };

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />

            {/* Data Management Page */}
            <Route
              path="/data"
              element={
                <DataPage
                  data={data}
                  newItem={newItem}
                  setNewItem={setNewItem}
                  addItem={addItem}
                />
              }
            />

            {/* 404 Not Found Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
