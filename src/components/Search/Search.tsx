import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Search.module.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const Search: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchContainer}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('search_placeholder') || "Search for a location..."}
        className={styles.searchInput}
      />
      <button type="submit" className={styles.searchButton}>
        {t('search_button')}
      </button>
    </form>
  );
};