import './index.css';
import { SearchItem } from './SearchItem';
import { useSearch } from '../../contexts/SearchContext';

export const SearchResult = () => {
  const {
    results,
    showResults,
    selectResult,
  } = useSearch();

  return (
    <div id='SearchResultContainer' className={showResults ? "show" : ""}>
      {results.length > 0 && <div className='top-gradient' />}
      <ul id='SearchResults' role='search'>
        {results.map((item, index) => (
          <SearchItem
            key={`${item.display_name}-${index}`}
            item={item}
            onSelect={(value, lat, lon) => selectResult(value, lat, lon)} // Adicione lat/lon
          />
        ))}
      </ul>
      {results.length > 0 && <div className='bottom-gradient' />}
    </div>
  );
};
