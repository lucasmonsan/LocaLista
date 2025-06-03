import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';

// Definindo os idiomas suportados
export type SupportedLanguage = 'pt-BR' | 'en-US';

// Interface para o valor do contexto (simplificada)
interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

// Criando o Context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Hook customizado para facilitar o uso do contexto
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
};

// Props para o Provider
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, defaultLanguage = 'pt-BR' }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const storedLanguage = localStorage.getItem('appLanguage') as SupportedLanguage | null;
    if (storedLanguage && (storedLanguage === 'pt-BR' || storedLanguage === 'en-US')) {
      return storedLanguage;
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'pt') {
        return 'pt-BR';
      }
      if (browserLang === 'en') {
        return 'en-US';
      }
    }
    return defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
  };

  // Fornecendo apenas 'language' e 'setLanguage'
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};