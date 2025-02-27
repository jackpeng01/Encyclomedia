import { useState, useEffect } from "react";

export const SearchBar = ({ setResults }) => {
  const [input, setInput] = useState("");

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `${process.env.TMDB_API_KEY}`
    }
  };

  const fetchData = async (value) => {
    let results = [];
    let currentPage = 1;
    while (true) {
        const response = await fetch(`https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${currentPage}&sort_by=popularity.desc`, options)
        const json = await response.json();
        console.log(json);
        const res = json.results.filter((item) => {
          return (
            item.name.toLowerCase().includes(value.toLowerCase()) && (!results.some(e => e.name === item.name))
          );
        });
        results = results.concat(res);

        if (currentPage >= 30) {
        break;
        }

        currentPage++;
    }
    setResults(results);
  };

  const handleChange = (value) => {
    setInput(value);
    fetchData(value);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center', // Centers horizontally
      alignItems: 'center', // Centers vertically
      paddingTop: '50px',
    }}>
        <input
            type="text"
    value={input}
    onChange={(e) => handleChange(e.target.value)}
            placeholder="Search for TV"
    style={{ 
      width: '300px', height: '50px',
      border: '3px solid black',
      fontWeight: 'bold',
      fontSize: 20,
      textAlign: 'center', }} 
        />
    </div>
);
};