import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Client, Databases, Query } from 'appwrite';
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';
import { DATABASE_ID, COLLECTIONS } from '../services/appwrite';

// Configuração do Appwrite
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

interface City {
  $id: string;
  name: string;
  lat: number;
  lon: number;
}

interface Neighborhood {
  $id: string;
  name: string;
  cityId: string;
}

interface Review {
  $id: string;
  cityId: string;
  neighborhoodId: string;
  street: string;
  number: number;
  rating: number;
  commentary: string;
  userId: string;
}

interface ReviewWithNeighborhood extends Review {
  neighborhoodName: string;
}

const MapTest = () => {
  const [city, setCity] = useState<City | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<Map<string, string>>(new Map());
  const [reviews, setReviews] = useState<ReviewWithNeighborhood[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithNeighborhood[]>([]);
  const [streetSearchTerm, setStreetSearchTerm] = useState('');
  const [neighborhoodSearchTerm, setNeighborhoodSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados de Divinópolis
  useEffect(() => {
    const fetchCity = async () => {
      try {
        const response = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.CITIES,
          '6839f3bb00129f1158eb'
        );
        setCity({
          $id: response.$id,
          name: response.name,
          lat: response.lat,
          lon: response.lon,
        });
      } catch (err: any) {
        setError('Erro ao buscar cidade: ' + err.message);
      }
    };
    fetchCity();
  }, []);

  // Buscar bairros de Divinópolis
  useEffect(() => {
    if (!city) return;
    const fetchNeighborhoods = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.NEIGHBORHOODS,
          [Query.equal('cityId', city.$id)]
        );
        const neighborhoodMap = new Map<string, string>();
        response.documents.forEach((doc: any) => {
          neighborhoodMap.set(doc.$id, doc.name);
        });
        setNeighborhoods(neighborhoodMap);
      } catch (err: any) {
        setError('Erro ao buscar bairros: ' + err.message);
      }
    };
    fetchNeighborhoods();
  }, [city]);

  // Buscar reviews de Divinópolis
  useEffect(() => {
    if (!city || neighborhoods.size === 0) return;
    const fetchReviews = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.REVIEWS,
          [Query.equal('cityId', city.$id)]
        );
        const mappedReviews: ReviewWithNeighborhood[] = response.documents.map((doc) => ({
          $id: doc.$id,
          cityId: doc.cityId,
          neighborhoodId: doc.neighborhoodId,
          neighborhoodName: neighborhoods.get(doc.neighborhoodId) || 'Desconhecido',
          street: doc.street,
          number: doc.number,
          rating: doc.rating,
          commentary: doc.commentary,
          userId: doc.userId,
        }));
        setReviews(mappedReviews);
        setFilteredReviews(mappedReviews);
      } catch (err: any) {
        setError('Erro ao buscar reviews: ' + err.message);
      }
    };
    fetchReviews();
  }, [city, neighborhoods]);

  // Filtrar reviews com base nos termos de busca
  useEffect(() => {
    if (!streetSearchTerm && !neighborhoodSearchTerm) {
      setFilteredReviews(reviews);
      return;
    }

    const fetchFilteredReviews = async () => {
      try {
        let queries = [Query.equal('cityId', city!.$id)];
        if (streetSearchTerm) {
          queries.push(Query.search('street', streetSearchTerm));
        }

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.REVIEWS,
          queries
        );

        const mappedReviews: ReviewWithNeighborhood[] = response.documents.map((doc) => ({
          $id: doc.$id,
          cityId: doc.cityId,
          neighborhoodId: doc.neighborhoodId,
          neighborhoodName: neighborhoods.get(doc.neighborhoodId) || 'Desconhecido',
          street: doc.street,
          number: doc.number,
          rating: doc.rating,
          commentary: doc.commentary,
          userId: doc.userId,
        }));

        // Filtro adicional no frontend para neighborhoodName
        const filtered = mappedReviews.filter((review) =>
          neighborhoodSearchTerm
            ? review.neighborhoodName.toLowerCase().includes(neighborhoodSearchTerm.toLowerCase())
            : true
        );

        setFilteredReviews(filtered);
      } catch (err: any) {
        setError('Erro ao filtrar reviews: ' + err.message);
      }
    };

    if (city) fetchFilteredReviews();
  }, [streetSearchTerm, neighborhoodSearchTerm, city, reviews, neighborhoods]);

  const handlePinClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setStreetSearchTerm('');
    setNeighborhoodSearchTerm('');
  };

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!city) {
    return <div>Carregando mapa...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mapa de {city.name}</h1>
      <MapContainer
        center={[city.lat, city.lon]}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[city.lat, city.lon]} eventHandlers={{ click: handlePinClick }}>
          <Popup>{city.name}</Popup>
        </Marker>
      </MapContainer>

      {modalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h2>Reviews de {city.name}</h2>
              <CloseButton onClick={handleCloseModal}>×</CloseButton>
            </ModalHeader>
            <SearchInput
              type="text"
              placeholder="Filtrar por rua"
              value={streetSearchTerm}
              onChange={(e) => setStreetSearchTerm(e.target.value)}
            />
            <SearchInput
              type="text"
              placeholder="Filtrar por bairro"
              value={neighborhoodSearchTerm}
              onChange={(e) => setNeighborhoodSearchTerm(e.target.value)}
            />
            <ReviewList>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <ReviewItem key={review.$id}>
                    <p><strong>Bairro:</strong> {review.neighborhoodName}</p>
                    <p><strong>Rua:</strong> {review.street}, {review.number}</p>
                    <p><strong>Rating:</strong> {review.rating}/10</p>
                    <p><strong>Comentário:</strong> {review.commentary}</p>
                    <p><strong>Usuário:</strong> {review.userId}</p>
                  </ReviewItem>
                ))
              ) : (
                <p>Nenhuma review encontrada.</p>
              )}
            </ReviewList>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
};

// Estilização com Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Manrope', sans-serif;
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ReviewItem = styled.div`
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 4px;
`;

export default MapTest;