import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import TvInfoModal from "../components/TvInfoModal";

const TrendingTvPage = () => {
  const [results, setResults] = useState([]);
  const [selectedShowName, setSelectedShowName] = useState(null);
  const [selectedShowInfo, setSelectedShowInfo] = useState(null);
  const [sortOrder, setSortOrder] = useState("name");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTv = async () => {
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_TMDB_API_KEY}`,
      },
    };

    // Fetch page 1 first to determine total pages (limit to 15)
    const page1Response = await fetch(
      `https://api.themoviedb.org/3/trending/tv/day?language=en-US&page=1`,
      options
    );
    const page1Json = await page1Response.json();
    const totalPages = Math.min(page1Json.total_pages, 15);

    // Create an array of promises for pages 2 to totalPages (include page 1)
    const promises = [];
    promises.push(Promise.resolve(page1Json));
    for (let page = 2; page <= totalPages; page++) {
      promises.push(
        fetch(
          `https://api.themoviedb.org/3/trending/tv/day?language=en-US&page=${page}`,
          options
        ).then((response) => response.json())
      );
    }

    const pages = await Promise.all(promises);
    const allResults = pages.flatMap((pageData) => pageData.results);

    // Eliminate duplicate entries based on the unique "id"
    const uniqueResults = allResults.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
    );

    // Sort by popularity in descending order
    uniqueResults.sort((a, b) => b.popularity - a.popularity);

    // Limit to the first 50 TV shows
    const limitedResults = uniqueResults.slice(0, 50);
    setResults(limitedResults);
  };

  useEffect(() => {
    getTv();
  }, []);

  const handleClick = (show, info) => {
    setSelectedShowName(show);
    setSelectedShowInfo(info);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedShowName(null);
    setSelectedShowInfo(null);
  };

  const handleSort = (sortBy) => {
    setSortOrder(sortBy);
    let sortedResults = [...results];

    if (sortBy === "name") {
      sortedResults.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "release_date") {
      sortedResults.sort(
        (a, b) => new Date(b.first_air_date) - new Date(a.first_air_date)
      );
    } else if (sortBy === "reset") {
      sortedResults.sort((a, b) => b.popularity - a.popularity);
    }

    setResults(sortedResults);
  };

  // Split results into two rows
  const half = Math.ceil(results.length / 2);
  const row1Items = results.slice(0, half);
  const row2Items = results.slice(half);

  // Helper function to render a seamless carousel row using your snippet.
  const renderCarouselRow = (items) => (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        // Set a fixed height to accommodate the 300px image plus margins and text
        height: "360px",
        my: "20px",
      }}
    >
      {/* Inline CSS for the slide animation */}
      <style>
        {`
          @keyframes slide {
            0% { left: 0; }
            100% { left: -100%; }
          }
          .carousel-track {
            display: flex;
            position: absolute;
            left: 0;
            justify-content: center;
            align-items: center;
            gap: 16px;
            width: 200%;
            height: 100%;
            animation: slide 20s linear infinite;
          }
          .carousel-track:hover {
            animation-play-state: paused;
          }
        `}
      </style>
      <Box className="carousel-track">
        {[...items, ...items].map((item, index) =>
          item.poster_path ? (
            <Box
              key={`${item.id}-${index}`}
              sx={{
                m: "10px",
                textAlign: "center",
                flex: "0 0 auto",
                cursor: "pointer",
              }}
              onClick={() => handleClick(item.name, item.overview)}
            >
              <img
                src={`https://image.tmdb.org/t/p/original/${item.poster_path}`}
                alt={item.name}
                style={{
                  width: "200px",
                  height: "300px",
                  borderRadius: "10px",
                }}
              />
              <Typography>{item.name}</Typography>
            </Box>
          ) : null
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        textAlign: "left",
        pt: "10px",
        flexDirection: "column",
      }}
    >
      <Typography align="left" variant="h2">
        Trending TV Shows
      </Typography>
      <Box sx={{ mb: "20px" }}>
        <Button sx={{ mr: "50px" }} onClick={() => handleSort("name")}>
          Sort by Name
        </Button>
        <Button sx={{ mr: "50px" }} onClick={() => handleSort("release_date")}>
          Sort by Release Date
        </Button>
        <Button sx={{ mr: "50px" }} onClick={() => handleSort("reset")}>
          Reset
        </Button>
      </Box>

      {/* Render both carousel rows with the same seamless sliding effect */}
      {renderCarouselRow(row1Items)}
      {renderCarouselRow(row2Items)}

      <TvInfoModal
        open={isModalOpen}
        onClose={closeModal}
        result={selectedShowName}
        info={selectedShowInfo}
      />
    </Box>
  );
};

export default TrendingTvPage;