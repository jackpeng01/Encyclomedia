import { Container, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DataPage from "./scenes/DataPage";
import LandingPage from "./scenes/LandingPage";
import NotFound from "./scenes/NotFound";
import { themeSettings } from "./theme";

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
            {/* Home Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Data Management Page */}
            <Route path="/data" element={<DataPage />} />

            {/* 404 Not Found Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
