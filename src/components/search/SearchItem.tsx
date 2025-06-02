import './index.css';

interface SearchItemProps {
  item: {
    display_name: string;
    lat: string; // Garanta que isso existe
    lon: string; // Garanta que isso existe
    type?: string;
  };
  onSelect: (value: string, lat: string, lon: string) => void; // Atualize o tipo
}

export const SearchItem = ({ item, onSelect }: SearchItemProps) => {
  const parts = item.display_name.split(',').map(part => part.trim());
  const mainName = parts[0];
  const country = parts[parts.length - 1];
  const additionalInfo = parts.slice(1, -1).join(', ');

  return (
    <li className='SearchItem' onClick={() => onSelect(item.display_name, item.lat, item.lon)}>
      <div className="item-main-info">
        <span className="item-name">
          {mainName}
        </span>
        {item.type && (
          <span className="item-type">
            {item.type} <span className="country-separator">•</span> {country}
          </span>
        )}
      </div>
      {additionalInfo && <div className="item-additional-info">{additionalInfo}</div>}
    </li>
  );
};