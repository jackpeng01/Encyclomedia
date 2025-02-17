import { Container, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DataPage from "./scenes/DataPage";
import LandingPage from "./scenes/LandingPage";
import NotFound from "./scenes/NotFound";
import { themeSettings } from "./theme";
import HomePage from "./scenes/HomePage";
import PosterTest from "./scenes/PosterTest";
import axios from "axios";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./scenes/ProfilePage";
import MovieDetails from "./scenes/MovieDetails";

function App() {
  // Redux state for theme mode (if used in your app)
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  // Authentication state (if used later)
  const isAuth = Boolean(useSelector((state) => state.token));

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Home Page */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            {/* ✅ Dynamic Profile Route */}
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            {/* Data Management Page */}
            <Route path="/data" element={<DataPage />} />

            {/* 404 Not Found Page */}
            <Route path="*" element={<NotFound />} />

            {/* Poster Test */}
            <Route path="/poster" element={<PosterTest />} />

            <Route path="/movie/:id" element={<MovieDetails />} />

          </Routes>
        </Container>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
