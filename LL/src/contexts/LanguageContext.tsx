import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('appLanguage') as Language | null;
      return savedLang || (navigator.language.startsWith('pt') ? 'pt' : 'en');
    }
    return 'en'; // Fallback para SSR
  });

  // Detecta o idioma do navegador apenas no client-side
  useEffect(() => {
    // Prioriza o localStorage, se existir
    const savedLang = localStorage.getItem('appLanguage') as Language | null;
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      // Fallback: idioma do navegador
      const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
      setLanguage(browserLang);
      localStorage.setItem('appLanguage', browserLang); // Salva pela primeira vez
    }
  }, []);

  // Mantenha este para persistir futuras mudanças
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};