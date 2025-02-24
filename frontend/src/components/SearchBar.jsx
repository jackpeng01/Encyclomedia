import { useState } from "react";

export const SearchBar = ({ setResults }) => {
  const [input, setInput] = useState("");

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZTQ4YjM4YWM2YjI5MjJlYjZiNGUyZTMxYTk2NDU0NyIsIm5iZiI6MTczOTIxMTA5NS40MDEsInN1YiI6IjY3YWE0MTU3NGU4NDkwNjAzMDFkNzZlZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.mXTdXuAGoTOUvx-DCZd8fmakCDD6S6bHsA0hcKEn87o`
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
    <div>
      <h1 style={{
           position: 'absolute',
           left: '50%',
           top: '5%',
           transform: 'translate(-50%, -50%)',
    }}>
        <input
            type="text"
    value={input}
    onChange={(e) => handleChange(e.target.value)}
            placeholder="Search for TV"
    style={{ width: '300px', height: '50px',
      border: '3px solid black',
      fontWeight: 'bold',
      fontSize: 20,
      textAlign: 'center', }} 
        />
        </h1>
    </div>
);
};