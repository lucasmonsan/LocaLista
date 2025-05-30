import { useEffect, useState } from 'react';
import { databases, DATABASE_ID, COLLECTIONS } from '../services/appwrite';
import { Query } from 'appwrite';

const TestCollections = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para criar uma cidade de teste
  const createTestCity = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CITIES,
        'unique()',
        {
          name: 'Belo Horizonte',
          lat: -19.9208,
          lon: -43.9378,
        }
      );
      alert('Cidade criada com sucesso!');
      fetchCities();
      return response.$id; // Retorna o $id da cidade criada
    } catch (err: any) {
      setError('Erro ao criar cidade: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar um bairro de teste
  const createTestNeighborhood = async () => {
    setLoading(true);
    setError(null);
    try {
      // Busca o $ Hed da cidade "Divinópolis"
      const cityResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CITIES,
        [Query.equal('name', 'Divinópolis')]
      );
      if (cityResponse.total === 0) {
        setError('Cidade Divinópolis não encontrada.');
        return;
      }
      const cityId = cityResponse.documents[0].$id;

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NEIGHBORHOODS,
        'unique()',
        {
          name: 'Centro',
          cityId: cityId,
        }
      );
      alert('Bairro criado com sucesso!');
      fetchNeighborhoods();
    } catch (err: any) {
      setError('Erro ao criar bairro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar uma review de teste
  const createTestReview = async () => {
    setLoading(true);
    setError(null);
    try {
      // Busca o $id da cidade "Divinópolis"
      const cityResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CITIES,
        [Query.equal('name', 'Divinópolis')]
      );
      if (cityResponse.total === 0) {
        setError('Cidade Divinópolis não encontrada.');
        return;
      }
      const cityId = cityResponse.documents[0].$id;

      // Busca o $id do bairro "Centro"
      const neighborhoodResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NEIGHBORHOODS,
        [Query.equal('name', 'Centro')]
      );
      if (neighborhoodResponse.total === 0) {
        setError('Bairro Centro não encontrado.');
        return;
      }
      const neighborhoodId = neighborhoodResponse.documents[0].$id;

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.REVIEWS,
        'unique()',
        {
          cityId: cityId,
          neighborhoodId: neighborhoodId,
          street: 'Rua São Paulo',
          number: 150,
          rating: 4,
          commentary: 'Ótimo apartamento, mas barulho à noite por ser no centro.',
          userId: 'user_test_001', // Usuário de teste (autenticação será configurada depois)
        }
      );
      alert('Review criada com sucesso!');
      fetchReviews();
    } catch (err: any) {
      setError('Erro ao criar review: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para listar cidades
  const fetchCities = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CITIES,
        [Query.limit(10)]
      );
      setCities(response.documents);
    } catch (err: any) {
      setError('Erro ao listar cidades: ' + err.message);
    }
  };

  // Função para listar bairros
  const fetchNeighborhoods = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NEIGHBORHOODS,
        [Query.limit(10)]
      );
      setNeighborhoods(response.documents);
    } catch (err: any) {
      setError('Erro ao listar bairros: ' + err.message);
    }
  };

  // Função para listar reviews
  const fetchReviews = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REVIEWS,
        [Query.limit(10)]
      );
      setReviews(response.documents);
    } catch (err: any) {
      setError('Erro ao listar reviews: ' + err.message);
    }
  };

  // Carrega os dados ao montar o componente
  useEffect(() => {
    fetchCities();
    fetchNeighborhoods();
    fetchReviews();
  }, []);

  return (
    <div>
      <h1>Teste de Coleções do Appwrite</h1>
      <div>
        <button onClick={createTestCity} disabled={loading}>
          {loading ? 'Criando...' : 'Criar Cidade (Belo Horizonte)'}
        </button>
        <h2>Cidades</h2>
        {cities.length === 0 ? (
          <p>Nenhuma cidade encontrada.</p>
        ) : (
          <ul>
            {cities.map((city) => (
              <li key={city.$id}>
                {city.name} (Lat: {city.lat}, Lon: {city.lon})
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <button onClick={createTestNeighborhood} disabled={loading}>
          {loading ? 'Criando...' : 'Criar Bairro (Centro)'}
        </button>
        <h2>Bairros</h2>
        {neighborhoods.length === 0 ? (
          <p>Nenhum bairro encontrado.</p>
        ) : (
          <ul>
            {neighborhoods.map((neighborhood) => (
              <li key={neighborhood.$id}>
                {neighborhood.name} (Cidade: {neighborhood.cityId})
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <button onClick={createTestReview} disabled={loading}>
          {loading ? 'Criando...' : 'Criar Review (Rua São Paulo)'}
        </button>
        <h2>Reviews</h2>
        {reviews.length === 0 ? (
          <p>Nenhuma review encontrada.</p>
        ) : (
          <ul>
            {reviews.map((review) => (
              <li key={review.$id}>
                {review.street}, {review.number} - {review.rating} estrelas: {review.commentary}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default TestCollections;