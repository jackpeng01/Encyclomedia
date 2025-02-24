import React, { useState } from 'react';
import TvInfoModal from './TvInfoModal';

export const SearchResult = ({ result, info, poster}) => {
  const [showTvInfo, setShowTvInfo] = useState(false);

  const handleClick = () => {
    setShowTvInfo(true); // Show the dialog when the result is clicked
  };

  const handleClose = () => {
    setShowTvInfo(false); // Close the dialog
  };

    return (
      <div
        className="search-result"
        onClick={handleClick}
        style={{
            padding: '10px',
          }}
      >
        <img src={`https://image.tmdb.org/t/p/original/${poster}`} alt={result} style={{ width: '160px', height: '240px', objectFit: 'cover',}} />
        <TvInfoModal open={showTvInfo} onClose={handleClose} result={result} info={info} />
      </div>
    );
  };