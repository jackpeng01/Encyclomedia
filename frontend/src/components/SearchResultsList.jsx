import { SearchResult } from "./SearchResult";
import "./SearchResultsList.css";

export const SearchResultsList = ({ results }) => {
  return (
    <div className="results-list">
      {results.map((result, id) => {
        return <SearchResult result={result.name} key={id} info={result.overview} poster={result.poster_path}/>;
      })}
    </div>
  );
};