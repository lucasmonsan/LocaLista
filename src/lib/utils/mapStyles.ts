// Gera o HTML do ícone SVG
function getPinSvg(color: string, stroke: string): string {
  return `
    <svg viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z" fill="${color}" stroke="${stroke}" stroke-width="1.5"/>
      <circle cx="12" cy="8" r="3.5" fill="white"/>
    </svg>
  `;
}

// Retorna o objeto L.divIcon pronto para uso
export function createPinIcon(L: any, rating: number | null, isTemp = false) {
  let color = '#6b7280'; // Cinza padrão
  let stroke = '#ffffff';

  if (!isTemp && rating !== null) {
    if (rating >= 4.0) color = '#10b981';      // Verde
    else if (rating >= 2.5) color = '#f59e0b'; // Laranja
    else color = '#ef4444';                    // Vermelho
  }

  return L.divIcon({
    className: 'custom-pin-icon',
    html: getPinSvg(color, stroke),
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
}