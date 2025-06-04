import React from 'react';
import L from 'leaflet';
import type { ProcessedNominatimResult } from '../../services/nominatimService';
import styles from './Results.module.css';

interface ResultsProps {
  results: ProcessedNominatimResult[];
  onResultSelect: (coordinates: L.LatLngTuple) => void;
}

export const Results: React.FC<ResultsProps> = ({ results, onResultSelect }) => {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className={styles.ResultsContainer}>
      <div className='gradient top'></div>
      <ul className={styles.ResultsList}>
        {results.map((result) => (
          <li
            key={result.id}
            onClick={() => onResultSelect(result.coordinates)}
            className={styles.ResultItem}
            tabIndex={0} // Para acessibilidade (foco com teclado)
            onKeyDown={(e) => { // Para acessibilidade (seleção com Enter/Space)
              if (e.key === 'Enter' || e.key === ' ') {
                onResultSelect(result.coordinates);
              }
            }}
          >
            {result.displayName}
          </li>
        ))}
      </ul>
      <div className='gradient bottom'></div>
    </div>
  );
};