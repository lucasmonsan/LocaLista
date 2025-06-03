import React, { createContext, useState, useEffect, useContext, useCallback, type ReactNode } from 'react';
import { useLanguage, type SupportedLanguage } from './LanguageContext'; // Importar useLanguage e SupportedLanguage

// Interface para os resultados refinados (pode ser movida para um arquivo de tipos global se usada em outros lugares)
export interface RefinedSearchResult {
  id: number;
  lat: string;
  lon: string;
  displayName: string;
  name: string;
  type: string;
  addressState?: string;
  addressCountry: string;
}

// Interface para o valor do SearchContext
interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refinedResults: RefinedSearchResult[];
  isLoading: boolean;
  inputHasFocus: boolean;
  setInputHasFocus: (isFocused: boolean) => void;
  clearSearch: () => void;
  currentSearchQuery: string; // O termo que efetivamente gerou os refinedResults
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch deve ser usado dentro de um SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const { language } = useLanguage(); // Obter o idioma atual do LanguageContext

  const [searchTerm, setSearchTermState] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(""); // Este é o termo que dispara a busca
  const [refinedResults, setRefinedResults] = useState<RefinedSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputHasFocus, setInputHasFocusState] = useState<boolean>(false);

  // Função para definir o termo de busca (usada pelo input)
  const setSearchTerm = (term: string) => {
    setSearchTermState(term);
  };

  // Função para definir o foco (usada pelo input)
  const setInputHasFocus = (isFocused: boolean) => {
    setInputHasFocusState(isFocused);
  };

  // Função para limpar a busca
  const clearSearch = () => {
    setSearchTermState("");
    setDebouncedSearchTerm(""); // Garante que a busca pendente seja cancelada
    setRefinedResults([]);
    // Não resetamos inputHasFocus aqui, pois o input pode continuar focado.
  };

  // Função para buscar dados (movida para dentro do provider)
  const fetchGeocodingResults = useCallback(async (query: string, lang: SupportedLanguage) => {
    if (query.trim() === "") {
      setRefinedResults([]);
      setIsLoading(false);
      return;
    }
    // setIsLoading(true); // setIsLoading será chamado antes de invocar fetchGeocodingResults

    const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
    const params = `?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=15&extratags=1`;

    console.log(`(SearchContext) Buscando por: "${query}" no idioma: "${lang}"`);
    try {
      const response = await fetch(`${NOMINATIM_BASE_URL}${params}`, {
        headers: { 'Accept-Language': lang },
      });
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }
      const rawDataArray = await response.json();
      const processedResults: RefinedSearchResult[] = rawDataArray.map((item: any) => {
        const langCode = lang.split('-')[0];
        const bestName = item.extratags?.['name:' + langCode] || item.name || '';
        return {
          id: item.place_id,
          lat: item.lat,
          lon: item.lon,
          displayName: item.display_name || '',
          name: bestName,
          type: item.type || 'unknown',
          addressState: item.address?.state,
          addressCountry: item.address?.country || '',
        };
      });
      setRefinedResults(processedResults);
    } catch (error) {
      console.error("(SearchContext) Falha ao buscar dados:", error);
      setRefinedResults([]);
    } finally {
      // setIsLoading(false); // setIsLoading será chamado após a invocação de fetchGeocodingResults
    }
  }, []); // useCallback não tem dependências aqui, pois 'lang' é passado como argumento

  // Efeito para debounce e lógica de mínimo 3 caracteres
  useEffect(() => {
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm.length < 3) {
      setDebouncedSearchTerm(""); // Limpa o termo debounced se for menor que 3 chars
      return;
    }
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(trimmedSearchTerm);
    }, 1000); // Debounce de 1 segundo
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Efeito para chamar a API quando debouncedSearchTerm ou language mudarem
  useEffect(() => {
    if (debouncedSearchTerm) { // Já tem >= 3 caracteres
      setIsLoading(true);
      fetchGeocodingResults(debouncedSearchTerm, language)
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setRefinedResults([]); // Limpa resultados se debouncedSearchTerm for vazio
      setIsLoading(false);   // Garante que isLoading seja false
    }
  }, [debouncedSearchTerm, language, fetchGeocodingResults]);

  return (
    <SearchContext.Provider value={{
      searchTerm,
      setSearchTerm,
      refinedResults,
      isLoading,
      inputHasFocus,
      setInputHasFocus,
      clearSearch,
      currentSearchQuery: debouncedSearchTerm // O termo que gerou os resultados atuais
    }}>
      {children}
    </SearchContext.Provider>
  );
};