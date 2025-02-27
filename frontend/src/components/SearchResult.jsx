import React, { useState } from 'react';
import TvInfoModal from './TvInfoModal';

export const SearchResult = ({ result, info, poster}) => {
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const handleClick = () => {
    setIsModalOpen(true); // Show the dialog when the result is clicked
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the dialog
  };

    return (
      <div>
      <div
        className="search-result"
        onClick={handleClick}
        style={{
            padding: '10px',
          }}
      >
        <img src={`https://image.tmdb.org/t/p/original/${poster}`} alt={result} style={{ width: '160px', height: '240px', objectFit: 'cover',}} />
        </div>
        <TvInfoModal
        open={isModalOpen} 
        onClose={closeModal} 
        result={result} 
        info={info} 
        />
      </div>
    );
  };