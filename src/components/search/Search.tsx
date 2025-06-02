import './index.css';
import { SearchForm } from './SearchForm';
import { SearchResult } from './SearchResult';

export const Search = () => {
  return (
    <div id="SearchContainer">
      <SearchResult />
      <SearchForm />
    </div>
  );
};