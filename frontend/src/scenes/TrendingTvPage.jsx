import React, { useState, useEffect } from 'react';
import TvInfoModal from '../components/TvInfoModal';
import { fetchData } from "../api/tv"; 

const TrendingTvPage = () => {
  const [results, setResults] = useState([]);
  const [selectedShowName, setSelectedShowName] = useState(null); 
  const [selectedShowInfo, setSelectedShowInfo] = useState(null); 
  const [sortOrder, setSortOrder] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTv = async () => {
    let allResults = [];
    let currentPage = 1;
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      },
    };

    while (true) {
      const response = await fetch(`https://api.themoviedb.org/3/trending/tv/day?language=en-US&page=${currentPage}`, options);
      const json = await response.json();
      
      // Concatenate the results to the existing results
      allResults = allResults.concat(json.results);

      if (!json.page || json.page >= 30) {
        break;
      }
      
      currentPage++;
    }
    allResults.sort((a, b) => b.popularity - a.popularity);
    setResults(allResults); 
  };

  useEffect(() => {
    getTv(); 
  }, []);

  const handleClick = (show, info) => {
    setSelectedShowName(show);
    setSelectedShowInfo(info) 
    setIsModalOpen(true); 
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedShowName(null); // Clear selected show
    setSelectedShowInfo(null)
  };

  const handleSort = (sortBy) => {
    setSortOrder(sortBy);
    
    let sortedResults = [...results];

    if (sortBy === 'name') {
      // Sort by name
      sortedResults.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'release_date') {
      // Sort by release date (newest to oldest)
      sortedResults.sort((a, b) => new Date(b.first_air_date) - new Date(a.first_air_date));
    }
    else if (sortBy === 'reset') {
    sortedResults.sort((a, b) => b.popularity - a.popularity);
    }

    setResults(sortedResults); // Update the results state with the sorted array
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: '10px',
      flexDirection: 'column'
    }}>
      <h1>Trending TV Shows</h1>
      <div style={{ marginBottom: '20px' }}>
        <button style={{marginRight: '50px'}} onClick={() => handleSort('name')}>Sort by Name</button>
        <button style={{marginRight: '50px'}} onClick={() => handleSort('release_date')}>Sort by Release Date</button>
        <button style={{marginRight: '50px'}} onClick={() => handleSort('reset')}>Reset</button>
      </div>
      <div 
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }} 
      >
        {results.map((item, index) => (
          item.poster_path ? (
            <div key={index} style={{ margin: '10px', textAlign: 'center' }} 
            onClick={() => handleClick(item.name, item.overview)}>
              <img
                src={`https://image.tmdb.org/t/p/original/${item.poster_path}`}
                alt={item.name}
                style={{ width: '200px', height: '300px', borderRadius: '10px' }}
              />
              <p>{item.name}</p>
            </div>
          ) : null // Skip if no poster image available
        ))}
      </div>
        <TvInfoModal
        open={isModalOpen} 
        onClose={closeModal} 
        result={selectedShowName} 
        info={selectedShowInfo} 
        />
    </div>
  );
};

export default TrendingTvPage;
