import { useMap } from "react-leaflet";
import { useSearch } from "../../contexts/SearchContext";
import { useEffect } from "react";

export const MapController = () => {
  const map = useMap();
  const { selectedCoords } = useSearch();

  useEffect(() => {
    if (selectedCoords && map) {
      map.flyTo(
        [selectedCoords.lat, selectedCoords.lon],
        selectedCoords.zoom || 15
      );
    }
  }, [selectedCoords, map]);
  return null;
};