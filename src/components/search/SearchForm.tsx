import './index.css';
import { LoadingIcon } from "../../assets/LoadingIcon";
import { SearchIcon } from "../../assets/SearchIcon";
import { useSearch } from '../../contexts/SearchContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CleanInputIcon } from '../../assets/CleanInputIcon';

export const SearchForm = () => {
  const { language } = useLanguage();

  const {
    searchInput,
    setSearchInput,
    isLoading,
    searchPlaces
  } = useSearch();

  const placeholderText = language === 'pt'
    ? 'Pesquise por cidades, países, ruas...'
    : 'Search for cities, countries, streets...';

  return (
    <form id='SearchForm' role='search' onSubmit={(e) => {
      e.preventDefault();
      searchPlaces(searchInput);
    }}>
      <input
        type="text"
        id='SearchInput'
        placeholder={placeholderText}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        aria-label={language === 'pt' ? 'Campo de busca' : 'Search input'}
      />
      <button id='SearchButton' type='submit' disabled={isLoading} onClick={() => {
        if (searchInput !== "" && !isLoading) {
          setSearchInput('');
        }
      }}>
        {!isLoading && searchInput !== "" ? <CleanInputIcon /> : isLoading ? <LoadingIcon /> : <SearchIcon />}
      </button>
    </form>
  )
}