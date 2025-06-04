import { useState, useEffect } from 'react';
import L from 'leaflet';

export interface GeolocationState {
  coordinates: L.LatLngTuple | null;
  error: GeolocationPositionError | Error | null;
  permissionGranted: boolean | null;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    permissionGranted: null,
  });

  const handleSuccess = (position: GeolocationPosition) => {
    setLocation({
      coordinates: [position.coords.latitude, position.coords.longitude],
      error: null,
      permissionGranted: true,
    });
  };

  const handleError = (error: GeolocationPositionError) => {
    console.error('useGeolocation handleError - Erro Completo:', error); // Log o objeto de erro inteiro
    console.error('useGeolocation handleError - Código do Erro:', error.code, 'Mensagem do Erro:', error.message); // Log específico
    setLocation({
      coordinates: null,
      error, // Salva o objeto de erro completo no estado
      permissionGranted: false,
    });
  };

  // Função para forçar nova busca da localização
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocation({
        coordinates: null,
        error: new Error('Geolocation is not supported by your browser.'),
        permissionGranted: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 0,
    });
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        coordinates: null,
        error: new Error('Geolocation is not supported by your browser.'),
        permissionGranted: false,
      });
      return;
    }

    // Verifica permissão inicial
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        if (status.state === 'granted') {
          setLocation((prev) => ({ ...prev, permissionGranted: true }));
          requestLocation();
        } else if (status.state === 'prompt') {
          setLocation((prev) => ({ ...prev, permissionGranted: null }));
        } else if (status.state === 'denied') {
          setLocation({
            coordinates: null,
            error: new Error('Geolocation permission denied.'),
            permissionGranted: false,
          });
        }

        // Observa mudança na permissão
        status.onchange = () => {
          if (status.state === 'granted') {
            setLocation((prev) => ({ ...prev, permissionGranted: true }));
            requestLocation();
          } else if (status.state === 'denied') {
            setLocation({
              coordinates: null,
              error: new Error('Geolocation permission denied.'),
              permissionGranted: false,
            });
          }
        };
      });
    } else {
      // Fallback caso permissions API não exista
      requestLocation();
    }
  }, []);

  return { location, requestLocation };
};
