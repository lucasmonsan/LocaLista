import { createContext, useContext, type ReactNode, useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import type { Coordinates, NominatimResult } from '../types';
import { getOrCreate } from '../services/neighborhoodService';
import { getReviewsByNeighborhood } from '../services/reviewService';

const translateType = (addresstype: string, language: 'pt' | 'en'): string => {
  const typeMap: { [key: string]: { pt: string; en: string } } = {
    municipality: { pt: 'Município', en: 'Municipality' },
    city: { pt: 'Cidade', en: 'City' },
    suburb: { pt: 'Bairro', en: 'Suburb' },
    city_district: { pt: 'Distrito', en: 'District' },
    town: { pt: 'Cidade', en: 'Town' },
    village: { pt: 'Vila', en: 'Village' },
    state: { pt: 'Estado', en: 'State' },
    province: { pt: 'Província', en: 'Province' },
    county: { pt: 'Condado', en: 'County' },
    country: { pt: 'País', en: 'Country' },
    administrative: { pt: 'Administrativo', en: 'Administrative' },
    residential: { pt: 'Residencial', en: 'Residential' },
    hamlet: { pt: 'Povoado', en: 'Hamlet' },
    street: { pt: 'Rua', en: 'Street' },
    road: { pt: 'Rua', en: 'Road' },
    amenity: { pt: 'Local', en: 'Place' },
    neighborhood: { pt: 'Bairro', en: 'Neighborhood' },
    isolated_dwelling: { pt: "Moradia isolada", en: "Isolated Dwelling" },
    farm: { pt: "Fazenda", en: "Farm" },
    region: { pt: "Região", en: "Region" }
  }
  return typeMap[addresstype]?.[language] || addresstype
}

type ZoomLevelKey = 'country' | 'state' | 'city' | 'suburb' | 'street';

const zoomLevels: Record<ZoomLevelKey | 'default', number> = {
  country: 5,
  state: 7,
  city: 10,
  suburb: 14,
  street: 17,
  default: 12
};

interface SearchContextProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  searchPlaces: (query: string) => Promise<void>;
  isLoading: boolean;
  results: NominatimResult[];
  showResults: boolean;
  selectResult: (value: string, lat: string, lon: string) => void;
  selectedCoords: Coordinates | null;
  setSelectedCoords: (coords: Coordinates | null) => void;
}

const SearchContext = createContext<SearchContextProps | null>(null);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useLanguage();
  const [searchInput, setSearchInput] = useState<string>('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const skipNextSearchRef = useRef(false);
  const [selectedCoords, setSelectedCoords] = useState<Coordinates | null>(null);

  // Atualiza visibilidade dos resultados
  useEffect(() => {
    if (results.length > 0) {
      setShowResults(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      setShowResults(false);
      timeoutRef.current = window.setTimeout(() => {
        setResults([]);
      }, 300);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [results]);

  //Debounce da pesquisa
  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      if (skipNextSearchRef.current) {
        skipNextSearchRef.current = false; // Reseta após pular
        return;
      }
      if (searchInput.trim().length > 0) {
        searchPlaces(searchInput);
      }
    }, 800);

    return () => clearTimeout(debounceSearch);
  }, [searchInput]);

  // Traduz os itens quando o idioma é alterado no botão do Header
  useEffect(() => {
    if (results.length > 0) {
      const translatedResults = results.map((item) => ({
        ...item,
        type: translateType(item.addresstype || '', language),
      }));
      setResults(translatedResults);
    }
  }, [language]);

  // Lida com a seleção de um item da lista de resultados
  const selectResult = async (value: string, lat: string, lon: string, type?: ZoomLevelKey) => {
    try {
      console.log("Coordenadas selecionadas:", lat, lon);

      // 1. Encontra o item selecionado nos resultados
      const selectedItem = results.find(item =>
        item.lat === lat && item.lon === lon
      );

      if (!selectedItem) return;

      // 2. Persiste no Appwrite (apenas aqui!)
      const neighborhood = await getOrCreate(selectedItem);
      console.log("Bairro processado:", neighborhood);

      // 3. Atualiza UI (mantendo sua lógica original)
      const zoom = zoomLevels[type || 'default'];
      skipNextSearchRef.current = true;
      setSearchInput(value);
      setSelectedCoords({
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        zoom
      });
      setShowResults(false);

    } catch (error) {
      console.error("Erro ao selecionar resultado:", error);
    }
  };

  // Faz a busca
  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=15&accept-language=${language}`
      );
      const data: NominatimResult[] = await response.json();

      console.log(data)

      // 👇 Refina resultados com tipos traduzidos
      const refinedResults = data.map((item) => ({
        ...item,
        type: translateType(item.addresstype || '', language),
      }));

      setResults(refinedResults);
    } catch (error) {
      console.error("Erro na busca:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SearchContext.Provider value={{ searchInput, setSearchInput, searchPlaces, isLoading, results, showResults, selectResult, selectedCoords, setSelectedCoords }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch deve ser usado dentro de um SearchProvider');

  return context;
};
