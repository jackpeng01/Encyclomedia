import { Container, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DataPage from "./scenes/DataPage";
import ListsPage from "./scenes/ListsPage";
import LocalListsPage from "./scenes/LocalListsPage";
import LandingPage from "./scenes/LandingPage";
import NotFound from "./scenes/NotFound";
import { themeSettings } from "./theme";
import HomePage from "./scenes/HomePage";
import PosterTest from "./scenes/PosterTest";
import axios from "axios";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./scenes/ProfilePage";
import ResetPassPage from "./scenes/ResetPassPage";
import AccountSettingsPage from "./scenes/AccountSettingsPage";
import MovieDetails from "./scenes/MovieDetails";
import SearchResults from "./scenes/SearchResults";
import BookSearch from "./scenes/BookSearch";
import BookDetails from "./scenes/BookDetails";
import MovieLog from "./scenes/MovieLog";
import WatchLater from "./scenes/WatchLater";
import TvSearchPage from "./scenes/TvSearchPage";
import Discover from "./scenes/Discover";
import UserSearch from "./scenes/UserSearch";
import TVDetails from "./scenes/TVDetails";
import PlotSearchResults from "./scenes/PlotSearchResults";

import TrendingTvPage from "./scenes/TrendingTvPage";
import TVSearch from "./scenes/TVSearch";
import WatchLaterTV from "./scenes/WatchLaterTV";
import TVLog from "./scenes/TVLog";
import Trending from "./scenes/Trending";

function App() {
  // Redux state for theme mode (if used in your app)
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  // Authentication state (if used later)
  const isAuth = Boolean(useSelector((state) => state.token));
  const isDarkMode = useSelector((state)=>state.user.isDarkMode);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ backgroundColor: "#fff", filter: isDarkMode ? "invert(1)" : "invert(0)" }}>
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
                path="/:username"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              {/* account settings page */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AccountSettingsPage />
                  </ProtectedRoute>
                }
              />
              {/* reset password page */}
              <Route
                path="/user/reset-password/:token?"
                element={<ResetPassPage />}
              />
              {/* Data Management Page */}
              <Route path="/data" element={<DataPage />} />

              {/* List Management Page */}
              <Route path="/mylists" element={<ListsPage />} />

              {/* Local List Management Page */}
              <Route path="/local-lists" element={<LocalListsPage />} />

              {/* 404 Not Found Page */}
              <Route path="*" element={<NotFound />} />

              {/* TV Page */}
            <Route path="/tv" element={<TvSearchPage />} />

            {/* TV Page */}
            <Route path="/trendingtv" element={<TrendingTvPage />} />

            {/* Poster Test */}
            <Route path="/poster" element={<PosterTest />} />

            <Route path="/search" element={<SearchResults />} />

            <Route path="/movie/:id" element={<MovieDetails />} />

            <Route path="/:username/movie-log" element={<MovieLog />} />
            <Route path="/:username/watch-later" element={<WatchLater />} />

            <Route path="/booksearch" element={<BookSearch />} />

            <Route path="/book/:id" element={<BookDetails />} />

            <Route path="/discover" element={<Discover />} />

            <Route path="/discover/users" element={<UserSearch />} />

            <Route path="/plot-search" element={<PlotSearchResults />} />

            <Route path="/tvsearch" element={<TVSearch />} />
            <Route path="/tv/:id" element={<TVDetails />} />
            <Route path="/:username/watch-later-tv" element={<WatchLaterTV />} />
            <Route path="/:username/tv-log" element={<TVLog />} />
            <Route path="/trending" element={<Trending />} />



            </Routes>
          </Container>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
