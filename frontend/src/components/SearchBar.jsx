import { useState } from "react";
import axios from "axios";

export const SearchBar = ({ setResults }) => {
  const [input, setInput] = useState("");

  const options = {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_TMDB_API_KEY}`,
    },
  };

  const fetchData = async (value) => {
    let results = [];
    let currentPage = 1;
    while (true) {
      // console.log("API URL:", process.env.REACT_APP_API_URL);
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${currentPage}&sort_by=popularity.desc`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_TMDB_API_KEY}`,
          },
        }
      );
      const json = response.data;
      console.log(json);
      const res = json.results.filter((item) => {
        return (
          item.name.toLowerCase().includes(value.toLowerCase()) &&
          !results.some((e) => e.name === item.name)
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
    <div
      style={{
        display: "flex",
        justifyContent: "center", // Centers horizontally
        alignItems: "center", // Centers vertically
        paddingTop: "50px",
      }}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search for TV"
        style={{
          width: "300px",
          height: "50px",
          border: "3px solid black",
          fontWeight: "bold",
          fontSize: 20,
          textAlign: "center",
        }}
      />
    </div>
  );
};
