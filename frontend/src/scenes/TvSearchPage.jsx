import React from "react";
import { useState, useEffect } from 'react';
import { SearchBar } from "../components/SearchBar";
import { SearchResultsList } from "../components/SearchResultsList";

const TvSearchPage = () => {
  const [results, setResults] = useState([]);

    return (
      <div className="search-bar-container">
      <SearchBar setResults={setResults} />
      {results && results.length > 0 && <SearchResultsList results={results} />}
    </div>

    );
};

export default TvSearchPage;
