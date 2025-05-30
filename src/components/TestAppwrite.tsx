import { useEffect, useState } from 'react';
import { databases, COLLECTIONS, DATABASE_ID } from '../services/appwrite'
import { ID, Query } from 'appwrite';

const TestAppwrite = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para criar uma cidade de teste
  const createTestCity = async () => {
    setLoading(true);
    setError(null);
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CITIES,
        ID.unique(),
        {
          name: 'Divinópolis',
          lat: -20.1396,
          lon: -44.8902,
        }
      );
      alert('Cidade criada com sucesso!');
      fetchCities(); // Atualiza a lista após criar
    } catch (err: any) {
      setError('Erro ao criar cidade: ' + err.message);
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
        [Query.limit(10)] // Limite de 10 cidades para teste
      );
      setCities(response.documents);
    } catch (err: any) {
      setError('Erro ao listar cidades: ' + err.message);
    }
  };

  // Carrega as cidades ao montar o componente
  useEffect(() => {
    fetchCities();
  }, []);

  return (
    <div>
      <h1>Teste de Conexão com Appwrite</h1>
      <button onClick={createTestCity} disabled={loading}>
        {loading ? 'Criando...' : 'Criar Cidade de Teste (Divinópolis)'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
  );
};

export default TestAppwrite;