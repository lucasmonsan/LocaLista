import { useState } from 'react';
import { databases, DATABASE_ID, COLLECTIONS } from '../services/appwrite';
import { Query } from 'appwrite';

const mockCities = [
  { name: 'Divinópolis', lat: -20.1396, lon: -44.8902 },
  { name: 'Belo Horizonte', lat: -19.9208, lon: -43.9378 },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
  { name: 'Salvador', lat: -12.9777, lon: -38.5016 },
];

const mockNeighborhoods = [
  // Divinópolis
  { name: 'Centro', cityName: 'Divinópolis' },
  { name: 'Jardim Belvedere', cityName: 'Divinópolis' },
  { name: 'Esplanada', cityName: 'Divinópolis' },
  { name: 'Santa Clara', cityName: 'Divinópolis' },
  { name: 'Jardim Copacabana', cityName: 'Divinópolis' },
  { name: 'Danilo Passos', cityName: 'Divinópolis' },
  { name: 'Vila Romana', cityName: 'Divinópolis' },
  { name: 'Interlagos', cityName: 'Divinópolis' },
  { name: 'Nossa Senhora das Graças', cityName: 'Divinópolis' },
  { name: 'Alvorada', cityName: 'Divinópolis' },
  // Belo Horizonte
  { name: 'Savassi', cityName: 'Belo Horizonte' },
  { name: 'Lourdes', cityName: 'Belo Horizonte' },
  { name: 'Funcionários', cityName: 'Belo Horizonte' },
  { name: 'Santo Antônio', cityName: 'Belo Horizonte' },
  { name: 'Sion', cityName: 'Belo Horizonte' },
  { name: 'Mangabeiras', cityName: 'Belo Horizonte' },
  { name: 'Belvedere', cityName: 'Belo Horizonte' },
  { name: 'Pampulha', cityName: 'Belo Horizonte' },
  { name: 'Cidade Jardim', cityName: 'Belo Horizonte' },
  { name: 'Buritis', cityName: 'Belo Horizonte' },
  // São Paulo
  { name: 'Jardins', cityName: 'São Paulo' },
  { name: 'Pinheiros', cityName: 'São Paulo' },
  { name: 'Vila Madalena', cityName: 'São Paulo' },
  { name: 'Moema', cityName: 'São Paulo' },
  { name: 'Itaim Bibi', cityName: 'São Paulo' },
  { name: 'Brooklin', cityName: 'São Paulo' },
  { name: 'Vila Olímpia', cityName: 'São Paulo' },
  { name: 'Morumbi', cityName: 'São Paulo' },
  { name: 'Higienópolis', cityName: 'São Paulo' },
  { name: 'Consolação', cityName: 'São Paulo' },
  // Rio de Janeiro
  { name: 'Copacabana', cityName: 'Rio de Janeiro' },
  { name: 'Ipanema', cityName: 'Rio de Janeiro' },
  { name: 'Leblon', cityName: 'Rio de Janeiro' },
  { name: 'Botafogo', cityName: 'Rio de Janeiro' },
  { name: 'Flamengo', cityName: 'Rio de Janeiro' },
  { name: 'Laranjeiras', cityName: 'Rio de Janeiro' },
  { name: 'Gávea', cityName: 'Rio de Janeiro' },
  { name: 'Jardim Botânico', cityName: 'Rio de Janeiro' },
  { name: 'Lapa', cityName: 'Rio de Janeiro' },
  { name: 'Santa Teresa', cityName: 'Rio de Janeiro' },
  // Salvador
  { name: 'Barra', cityName: 'Salvador' },
  { name: 'Ondina', cityName: 'Salvador' },
  { name: 'Rio Vermelho', cityName: 'Salvador' },
  { name: 'Pituba', cityName: 'Salvador' },
  { name: 'Graça', cityName: 'Salvador' },
  { name: 'Caminho das Árvores', cityName: 'Salvador' },
  { name: 'Itaigara', cityName: 'Salvador' },
  { name: 'Stiep', cityName: 'Salvador' },
  { name: 'Costa Azul', cityName: 'Salvador' },
  { name: 'Armação', cityName: 'Salvador' },
];

const mockReviews = [
  // Divinópolis
  {
    cityName: 'Divinópolis',
    neighborhoodName: 'Centro',
    street: 'Rua São Paulo',
    number: 150,
    rating: 4,
    commentary: 'Ótimo apartamento, mas barulho à noite por ser no centro.',
    userId: 'user_001',
  },
  {
    cityName: 'Divinópolis',
    neighborhoodName: 'Jardim Belvedere',
    street: 'Rua das Acácias',
    number: 45,
    rating: 5,
    commentary: 'Casa espaçosa e tranquila, perto do Parque da Ilha.',
    userId: 'user_002',
  },
  {
    cityName: 'Divinópolis',
    neighborhoodName: 'Esplanada',
    street: 'Avenida Paraná',
    number: 1200,
    rating: 3,
    commentary: 'Localização boa, mas o imóvel precisa de reformas.',
    userId: 'user_003',
  },
  {
    cityName: 'Divinópolis',
    neighborhoodName: 'Santa Clara',
    street: 'Rua Padre Guaritá',
    number: 300,
    rating: 2,
    commentary: 'Problemas com infiltração. Não recomendo.',
    userId: 'user_004',
  },
  {
    cityName: 'Divinópolis',
    neighborhoodName: 'Jardim Copacabana',
    street: 'Rua Rio de Janeiro',
    number: 85,
    rating: 4,
    commentary: 'Bom custo-benefício. Vizinhos tranquilos.',
    userId: 'user_005',
  },
  {
    cityName: 'Divinópolis',
    neighborhoodName: 'Danilo Passos',
    street: 'Rua das Flores',
    number: 22,
    rating: 1,
    commentary: 'Muito antigo e com mau cheiro.',
    userId: 'user_006',
  },
  {
    cityName: 'Divinópolis',
    neighborhoodName: 'Vila Romana', // Corrigido de 'Vila Nova' para 'Vila Romana'
    street: 'Rua Itália',
    number: 77,
    rating: 5,
    commentary: 'Casa nova, bem decorada e com ótima iluminação.',
    userId: 'user_007',
  },
  {
    cityName: 'Divinópolis',
    neighborhoodName: 'Interlagos',
    street: 'Rua das Gaivotas',
    number: 33,
    rating: 3,
    commentary: 'Área um pouco afastada, mas o preço compensa.',
    userId: 'user_008',
  },
  {
    cityName: 'Divinópolis',
    neighborhoodName: 'Nossa Senhora das Graças',
    street: 'Rua Padre Eustá',
    number: 120,
    rating: 4,
    commentary: 'Próximo ao hospital e mercados.',
    userId: 'user_009',
  },
  {
    cityName: 'Divinópolis',
    neighborhoodName: 'Alvorada',
    street: 'Rua dos Coqueiros',
    number: 10,
    rating: 5,
    commentary: 'Quintal enorme e vizinhança pacata. Perfeito para famílias!',
    userId: 'user_010',
  },
  // Belo Horizonte
  {
    cityName: 'Belo Horizonte',
    neighborhoodName: 'Savassi',
    street: 'Rua Pernambuco',
    number: 800,
    rating: 4,
    commentary: 'Apartamento moderno, mas estacionamento é difícil.',
    userId: 'user_011',
  },
  {
    cityName: 'Belo Horizonte',
    neighborhoodName: 'Lourdes',
    street: 'Rua da Bahia',
    number: 120,
    rating: 5,
    commentary: 'Localização premium, tudo perto!',
    userId: 'user_012',
  },
  {
    cityName: 'Belo Horizonte',
    neighborhoodName: 'Funcionários',
    street: 'Avenida Afonso Pena',
    number: 2000,
    rating: 3,
    commentary: 'Imóvel antigo, precisa de manutenção.',
    userId: 'user_013',
  },
  {
    cityName: 'Belo Horizonte',
    neighborhoodName: 'Santo Antônio',
    street: 'Rua Leopoldina',
    number: 50,
    rating: 4,
    commentary: 'Bairro charmoso, casa confortável.',
    userId: 'user_014',
  },
  {
    cityName: 'Belo Horizonte',
    neighborhoodName: 'Sion',
    street: 'Rua Grão Mogol',
    number: 300,
    rating: 5,
    commentary: 'Apartamento de alto padrão, excelente!',
    userId: 'user_015',
  },
  {
    cityName: 'Belo Horizonte',
    neighborhoodName: 'Mangabeiras',
    street: 'Rua Professor Morais',
    number: 100,
    rating: 4,
    commentary: 'Vista incrível, mas acesso difícil.',
    userId: 'user_016',
  },
  {
    cityName: 'Belo Horizonte',
    neighborhoodName: 'Belvedere',
    street: 'Rua Vereador Euler',
    number: 25,
    rating: 5,
    commentary: 'Casa de luxo, muito bem localizada.',
    userId: 'user_017',
  },
  {
    cityName: 'Belo Horizonte',
    neighborhoodName: 'Pampulha',
    street: 'Avenida Otacílio Negrão',
    number: 500,
    rating: 3,
    commentary: 'Próximo à lagoa, mas imóvel antigo.',
    userId: 'user_018',
  },
  {
    cityName: 'Belo Horizonte',
    neighborhoodName: 'Cidade Jardim',
    street: 'Rua da Paisagem',
    number: 80,
    rating: 4,
    commentary: 'Bairro tranquilo, ideal para famílias.',
    userId: 'user_019',
  },
  {
    cityName: 'Belo Horizonte',
    neighborhoodName: 'Buritis',
    street: 'Rua Tereza Mota',
    number: 150,
    rating: 2,
    commentary: 'Problemas com barulho dos vizinhos.',
    userId: 'user_020',
  },
  // São Paulo
  {
    cityName: 'São Paulo',
    neighborhoodName: 'Jardins',
    street: 'Alameda Lorena',
    number: 900,
    rating: 5,
    commentary: 'Apartamento sofisticado, localização impecável.',
    userId: 'user_021',
  },
  {
    cityName: 'São Paulo',
    neighborhoodName: 'Pinheiros',
    street: 'Rua dos Pinheiros',
    number: 300,
    rating: 4,
    commentary: 'Bairro vibrante, mas trânsito intenso.',
    userId: 'user_022',
  },
  {
    cityName: 'São Paulo',
    neighborhoodName: 'Vila Madalena',
    street: 'Rua Harmonia',
    number: 200,
    rating: 4,
    commentary: 'Casa charmosa, perto de bares e restaurantes.',
    userId: 'user_023',
  },
  {
    cityName: 'São Paulo',
    neighborhoodName: 'Moema',
    street: 'Avenida Ibirapuera',
    number: 2500,
    rating: 3,
    commentary: 'Local bom, mas imóvel pequeno para o preço.',
    userId: 'user_024',
  },
  {
    cityName: 'São Paulo',
    neighborhoodName: 'Itaim Bibi',
    street: 'Rua João Cachoeira',
    number: 600,
    rating: 5,
    commentary: 'Escritório bem localizado, perfeito para negócios.',
    userId: 'user_025',
  },
  {
    cityName: 'São Paulo',
    neighborhoodName: 'Brooklin',
    street: 'Rua Nova York',
    number: 400,
    rating: 4,
    commentary: 'Bairro tranquilo, bom para morar.',
    userId: 'user_026',
  },
  {
    cityName: 'São Paulo',
    neighborhoodName: 'Vila Olímpia',
    street: 'Rua Funchal',
    number: 300,
    rating: 3,
    commentary: 'Muito movimento, mas localização estratégica.',
    userId: 'user_027',
  },
  {
    cityName: 'São Paulo',
    neighborhoodName: 'Morumbi',
    street: 'Avenida Giovanni Gronchi',
    number: 1000,
    rating: 4,
    commentary: 'Casa ampla, ideal para famílias grandes.',
    userId: 'user_028',
  },
  {
    cityName: 'São Paulo',
    neighborhoodName: 'Higienópolis',
    street: 'Rua Maranhão',
    number: 500,
    rating: 5,
    commentary: 'Prédio clássico, muito bem conservado.',
    userId: 'user_029',
  },
  {
    cityName: 'São Paulo',
    neighborhoodName: 'Consolação',
    street: 'Rua Augusta',
    number: 1500,
    rating: 2,
    commentary: 'Muito barulho à noite, não recomendo.',
    userId: 'user_030',
  },
  // Rio de Janeiro
  {
    cityName: 'Rio de Janeiro',
    neighborhoodName: 'Copacabana',
    street: 'Avenida Atlântica',
    number: 2000,
    rating: 4,
    commentary: 'Vista para o mar, mas apartamento antigo.',
    userId: 'user_031',
  },
  {
    cityName: 'Rio de Janeiro',
    neighborhoodName: 'Ipanema',
    street: 'Rua Visconde de Pirajá',
    number: 300,
    rating: 5,
    commentary: 'Localização perfeita, tudo a pé!',
    userId: 'user_032',
  },
  {
    cityName: 'Rio de Janeiro',
    neighborhoodName: 'Leblon',
    street: 'Avenida Ataulfo de Paiva',
    number: 500,
    rating: 5,
    commentary: 'Apartamento de alto padrão, excelente.',
    userId: 'user_033',
  },
  {
    cityName: 'Rio de Janeiro',
    neighborhoodName: 'Botafogo',
    street: 'Rua Voluntários da Pátria',
    number: 400,
    rating: 3,
    commentary: 'Bairro bom, mas imóvel precisa de reformas.',
    userId: 'user_034',
  },
  {
    cityName: 'Rio de Janeiro',
    neighborhoodName: 'Flamengo',
    street: 'Praia do Flamengo',
    number: 100,
    rating: 4,
    commentary: 'Vista bonita, mas estacionamento é um problema.',
    userId: 'user_035',
  },
  {
    cityName: 'Rio de Janeiro',
    neighborhoodName: 'Laranjeiras',
    street: 'Rua das Laranjeiras',
    number: 200,
    rating: 4,
    commentary: 'Bairro tranquilo, casa confortável.',
    userId: 'user_036',
  },
  {
    cityName: 'Rio de Janeiro',
    neighborhoodName: 'Gávea',
    street: 'Rua Marquês de São Vicente',
    number: 50,
    rating: 5,
    commentary: 'Casa ampla, perto da PUC.',
    userId: 'user_037',
  },
  {
    cityName: 'Rio de Janeiro',
    neighborhoodName: 'Jardim Botânico',
    street: 'Rua Jardim Botânico',
    number: 600,
    rating: 4,
    commentary: 'Bairro verde, mas acesso limitado.',
    userId: 'user_038',
  },
  {
    cityName: 'Rio de Janeiro',
    neighborhoodName: 'Lapa',
    street: 'Rua do Lavradio',
    number: 80,
    rating: 3,
    commentary: 'Vida noturna vibrante, mas barulhento.',
    userId: 'user_039',
  },
  {
    cityName: 'Rio de Janeiro',
    neighborhoodName: 'Santa Teresa',
    street: 'Rua Almirante Alexandrino',
    number: 120,
    rating: 4,
    commentary: 'Charme histórico, mas acesso difícil.',
    userId: 'user_040',
  },
  // Salvador
  {
    cityName: 'Salvador',
    neighborhoodName: 'Barra',
    street: 'Avenida Oceânica',
    number: 1000,
    rating: 4,
    commentary: 'Vista para o mar, mas lotado nos fins de semana.',
    userId: 'user_041',
  },
  {
    cityName: 'Salvador',
    neighborhoodName: 'Ondina',
    street: 'Avenida Milton Santos',
    number: 200,
    rating: 5,
    commentary: 'Apartamento confortável, perto da praia.',
    userId: 'user_042',
  },
  {
    cityName: 'Salvador',
    neighborhoodName: 'Rio Vermelho',
    street: 'Rua da Paciência',
    number: 300,
    rating: 4,
    commentary: 'Bairro boêmio, ótimo para jovens.',
    userId: 'user_043',
  },
  {
    cityName: 'Salvador',
    neighborhoodName: 'Pituba',
    street: 'Avenida Manoel Dias',
    number: 500,
    rating: 3,
    commentary: 'Localização boa, mas imóvel antigo.',
    userId: 'user_044',
  },
  {
    cityName: 'Salvador',
    neighborhoodName: 'Graça',
    street: 'Rua da Graça',
    number: 100,
    rating: 5,
    commentary: 'Bairro charmoso, casa excelente.',
    userId: 'user_045',
  },
  {
    cityName: 'Salvador',
    neighborhoodName: 'Caminho das Árvores',
    street: 'Avenida Tancredo Neves',
    number: 800,
    rating: 4,
    commentary: 'Próximo a shoppings, muito prático.',
    userId: 'user_046',
  },
  {
    cityName: 'Salvador',
    neighborhoodName: 'Itaigara',
    street: 'Rua Anísio Teixeira',
    number: 50,
    rating: 5,
    commentary: 'Apartamento novo, bem localizado.',
    userId: 'user_047',
  },
  {
    cityName: 'Salvador',
    neighborhoodName: 'Stiep',
    street: 'Rua Arthur de Azevedo',
    number: 200,
    rating: 3,
    commentary: 'Bairro comercial, mas imóvel simples.',
    userId: 'user_048',
  },
  {
    cityName: 'Salvador',
    neighborhoodName: 'Costa Azul',
    street: 'Rua Professor Sabino Silva',
    number: 300,
    rating: 4,
    commentary: 'Perto da praia, bom custo-benefício.',
    userId: 'user_049',
  },
  {
    cityName: 'Salvador',
    neighborhoodName: 'Armação',
    street: 'Rua João Mendes',
    number: 400,
    rating: 2,
    commentary: 'Problemas com manutenção do prédio.',
    userId: 'user_050',
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PopulateMock = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const populateMockData = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      // Verifica se todos os dados já existem
      const citiesCount = (await databases.listDocuments(DATABASE_ID, COLLECTIONS.CITIES)).total;
      const neighborhoodsCount = (await databases.listDocuments(DATABASE_ID, COLLECTIONS.NEIGHBORHOODS)).total;
      const reviewsCount = (await databases.listDocuments(DATABASE_ID, COLLECTIONS.REVIEWS)).total;

      if (
        citiesCount >= mockCities.length &&
        neighborhoodsCount >= mockNeighborhoods.length &&
        reviewsCount >= mockReviews.length
      ) {
        setStatus('Todos os dados já estão no banco! Nenhuma ação necessária.');
        setLoading(false);
        return;
      }

      // Passo 1: Criar cidades
      const cityIds: { [key: string]: string } = {};
      for (const city of mockCities) {
        await delay(100); // Atraso para evitar picos
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.CITIES,
          [Query.equal('name', city.name)]
        );
        if (existing.total > 0) {
          cityIds[city.name] = existing.documents[0].$id;
          setStatus((prev) => (prev ? prev + `\nCidade ${city.name} já existe.` : `Cidade ${city.name} já existe.`));
          continue;
        }
        const response = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.CITIES,
          'unique()',
          {
            name: city.name,
            lat: city.lat,
            lon: city.lon,
          }
        );
        cityIds[city.name] = response.$id;
        setStatus((prev) => (prev ? prev + `\nCidade ${city.name} criada.` : `Cidade ${city.name} criada.`));
      }

      // Passo 2: Criar bairros
      const neighborhoodIds: { [key: string]: string } = {};
      for (const neighborhood of mockNeighborhoods) {
        await delay(100); // Atraso para evitar picos
        const cityId = cityIds[neighborhood.cityName];
        if (!cityId) {
          throw new Error(`Cidade ${neighborhood.cityName} não encontrada.`);
        }
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.NEIGHBORHOODS,
          [Query.equal('name', neighborhood.name), Query.equal('cityId', cityId)]
        );
        if (existing.total > 0) {
          neighborhoodIds[`${neighborhood.cityName}_${neighborhood.name}`] = existing.documents[0].$id;
          setStatus((prev) =>
            prev ? prev + `\nBairro ${neighborhood.name} (${neighborhood.cityName}) já existe.` : `Bairro ${neighborhood.name} (${neighborhood.cityName}) já existe.`
          );
          continue;
        }
        const response = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.NEIGHBORHOODS,
          'unique()',
          {
            name: neighborhood.name,
            cityId: cityId,
          }
        );
        neighborhoodIds[`${neighborhood.cityName}_${neighborhood.name}`] = response.$id;
        setStatus((prev) =>
          prev ? prev + `\nBairro ${neighborhood.name} (${neighborhood.cityName}) criado.` : `Bairro ${neighborhood.name} (${neighborhood.cityName}) criado.`
        );
      }

      // Passo 3: Criar reviews
      for (const review of mockReviews) {
        await delay(100); // Atraso para evitar picos
        const cityId = cityIds[review.cityName];
        const neighborhoodId = neighborhoodIds[`${review.cityName}_${review.neighborhoodName}`];
        if (!cityId || !neighborhoodId) {
          throw new Error(`Cidade ${review.cityName} ou bairro ${review.neighborhoodName} não encontrado.`);
        }
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.REVIEWS,
          [
            Query.equal('cityId', cityId),
            Query.equal('neighborhoodId', neighborhoodId),
            Query.equal('street', review.street),
            Query.equal('number', review.number),
          ]
        );
        if (existing.total > 0) {
          setStatus((prev) =>
            prev ? prev + `\nReview em ${review.street}, ${review.number} (${review.cityName}) já existe.` : `Review em ${review.street}, ${review.number} (${review.cityName}) já existe.`
          );
          continue;
        }
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.REVIEWS,
          'unique()',
          {
            cityId: cityId,
            neighborhoodId: neighborhoodId,
            street: review.street,
            number: review.number,
            rating: review.rating,
            commentary: review.commentary,
            userId: review.userId,
          }
        );
        setStatus((prev) =>
          prev ? prev + `\nReview em ${review.street}, ${review.number} (${review.cityName}) criada.` : `Review em ${review.street}, ${review.number} (${review.cityName}) criada.`
        );
      }

      setStatus((prev) => (prev ? prev + '\nTodos os dados foram populados com sucesso!' : 'Todos os dados foram populados com sucesso!'));
    } catch (err: any) {
      setError('Erro ao popular dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Popular Dados de Mock</h1>
      <button onClick={populateMockData} disabled={loading}>
        {loading ? 'Populando...' : 'Popular Todos os Dados do Mock'}
      </button>
      {status && <pre style={{ color: 'green' }}>{status}</pre>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default PopulateMock;