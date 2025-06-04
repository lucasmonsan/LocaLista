import { useState } from 'react';
import L from 'leaflet';
import styles from './App.module.css';
import { Header } from './components/Header';
import { Map } from './components/Map';
import { Search } from './components/Search';
import { searchLocation, type ProcessedNominatimResult } from './services/nominatimService';
import { Results } from './components/Results';
import { Reviews } from './components/Reviews';

interface AppReview {
  id: string | number;
  // outras propriedades do review
}

function App() {
  const [searchCoordinates, setSearchCoordinates] = useState<L.LatLngTuple | null>(null);
  const [searchResults, setSearchResults] = useState<ProcessedNominatimResult[] | null>(null);

  const [reviews, setReviews] = useState<AppReview[]>(
    Array.from({ length: 15 }, (_, i) => ({ id: `review-${i}` })) // 5 reviews de exemplo
  );

  const handleSearch = async (query: string) => {
    const results = await searchLocation(query);
    if (results && results.length > 0) {
      if (results.length === 1) {
        setSearchCoordinates(results[0].coordinates);
        setSearchResults(null);
      } else {
        setSearchResults(results);
        setSearchCoordinates(null);
      }
    } else {
      console.warn("Location not found for query:", query);
      setSearchResults(null);
      setSearchCoordinates(null);
    }
  };

  const handleResultSelection = (coordinates: L.LatLngTuple) => {
    setSearchCoordinates(coordinates);
    setSearchResults(null);
  };

  return (
    <div className={styles.appContainer}>
      <Header />
      <Search onSearch={handleSearch} />

      {/* Use o componente Results */}
      {searchResults && searchResults.length > 0 && (
        <Results
          results={searchResults}
          onResultSelect={handleResultSelection}
        />
      )}

      {!searchResults && reviews.length > 0 && (
        <Reviews reviews={reviews} />
      )}

      <div className={styles.mapWrapper}>
        <Map searchCoordinates={searchCoordinates} />
      </div>
    </div>
  );
}

export default App;