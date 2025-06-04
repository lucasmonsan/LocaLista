import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toggleTheme } = useTheme();

  const changeLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pt' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className={styles.header}>
      <button onClick={toggleTheme} className={styles.button}>
        {t('toggle_theme')}
      </button>
      <button onClick={changeLanguage} className={styles.button}>
        {t('toggle_language')} ({i18n.language.toUpperCase()})
      </button>
    </header>
  );
};