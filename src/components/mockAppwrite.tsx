import { ID } from 'appwrite';
import { DATABASE_ID, databases, REVIEWS_ID } from '../services/appwrite';

interface Review {
  city: string;
  neighborhood: string;
  street: string;
  number: number;
  rating: number;
  commentary: string;
  userId: string;
}

const mockReviews: Review[] = [
  {
    "city": "Divinópolis",
    "neighborhood": "Centro",
    "street": "Rua São Paulo",
    "number": 150,
    "rating": 4,
    "commentary": "Ótimo apartamento, mas barulho à noite por ser no centro.",
    "userId": ""
  },
  {
    "city": "Divinópolis",
    "neighborhood": "Jardim Belvedere",
    "street": "Rua das Acácias",
    "number": 45,
    "rating": 5,
    "commentary": "Casa espaçosa e tranquila, perto do Parque da Ilha.",
    "userId": ""
  },
  {
    "city": "Divinópolis",
    "neighborhood": "Esplanada",
    "street": "Avenida Paraná",
    "number": 1200,
    "rating": 3,
    "commentary": "Localização boa, mas o imóvel precisa de reformas.",
    "userId": ""
  },
  {
    "city": "Divinópolis",
    "neighborhood": "Santa Clara",
    "street": "Rua Padre Guaritá",
    "number": 300,
    "rating": 2,
    "commentary": "Problemas com infiltração. Não recomendo.",
    "userId": ""
  },
  {
    "city": "Divinópolis",
    "neighborhood": "Jardim Copacabana",
    "street": "Rua Rio de Janeiro",
    "number": 85,
    "rating": 4,
    "commentary": "Bom custo-benefício. Vizinhos tranquilos.",
    "userId": ""
  },
  {
    "city": "Divinópolis",
    "neighborhood": "Danilo Passos",
    "street": "Rua das Flores",
    "number": 22,
    "rating": 1,
    "commentary": "Muito antigo e com mau cheiro. Fuja!",
    "userId": ""
  },
  {
    "city": "Divinópolis",
    "neighborhood": "Vila Romana",
    "street": "Rua Itália",
    "number": 77,
    "rating": 5,
    "commentary": "Casa nova, bem decorada e com ótima iluminação.",
    "userId": ""
  },
  {
    "city": "Divinópolis",
    "neighborhood": "Interlagos",
    "street": "Rua das Gaivotas",
    "number": 33,
    "rating": 3,
    "commentary": "Área um pouco afastada, mas o preço compensa.",
    "userId": ""
  },
  {
    "city": "Divinópolis",
    "neighborhood": "Nossa Senhora das Graças",
    "street": "Rua Padre Eustáquio",
    "number": 500,
    "rating": 4,
    "commentary": "Próximo ao hospital e mercados. Excelente para idosos.",
    "userId": ""
  },
  {
    "city": "Divinópolis",
    "neighborhood": "Alvorada",
    "street": "Rua dos Coqueiros",
    "number": 10,
    "rating": 5,
    "commentary": "Quintal enorme e vizinhança pacata. Perfeito para famílias!",
    "userId": ""
  },
  {
    "city": "Belo Horizonte",
    "neighborhood": "Savassi",
    "street": "Rua Pernambuco",
    "number": 1200,
    "rating": 5,
    "commentary": "Apartamento moderno com ótima localização, próximo a bares e restaurantes.",
    "userId": ""
  },
  {
    "city": "Belo Horizonte",
    "neighborhood": "Pampulha",
    "street": "Avenida Antônio Abrahão Caram",
    "number": 1001,
    "rating": 4,
    "commentary": "Vista para a lagoa, mas trânsito intenso em horários de pico.",
    "userId": ""
  },
  {
    "city": "Belo Horizonte",
    "neighborhood": "Santa Tereza",
    "street": "Rua Aarão Reis",
    "number": 55,
    "rating": 3,
    "commentary": "Casa charmosa, porém com escadarias íngremes. Ideal para jovens.",
    "userId": ""
  },
  {
    "city": "Belo Horizonte",
    "neighborhood": "Lourdes",
    "street": "Rua da Bahia",
    "number": 2000,
    "rating": 2,
    "commentary": "Prédio antigo com elevador barulhento. Não atendeu expectativas.",
    "userId": ""
  },
  {
    "city": "Belo Horizonte",
    "neighborhood": "Funcionários",
    "street": "Rua dos Inconfidentes",
    "number": 350,
    "rating": 5,
    "commentary": "Excelente infraestrutura e segurança. 24h por dia.",
    "userId": ""
  },
  {
    "city": "Belo Horizonte",
    "neighborhood": "Sion",
    "street": "Rua dos Otoni",
    "number": 800,
    "rating": 4,
    "commentary": "Bairro tranquilo e arborizado. Supermercados próximos.",
    "userId": ""
  },
  {
    "city": "Belo Horizonte",
    "neighborhood": "Cidade Nova",
    "street": "Rua Itabira",
    "number": 75,
    "rating": 1,
    "commentary": "Problemas com infiltração e goteiras. Evitar!",
    "userId": ""
  },
  {
    "city": "Belo Horizonte",
    "neighborhood": "Barro Preto",
    "street": "Rua Timbiras",
    "number": 1500,
    "rating": 3,
    "commentary": "Próximo ao metrô, mas barulho de tráfego constante.",
    "userId": ""
  },
  {
    "city": "Belo Horizonte",
    "neighborhood": "Mangabeiras",
    "street": "Rua Professor Morais",
    "number": 200,
    "rating": 5,
    "commentary": "Casa de luxo com vista espetacular para a cidade. Vale o investimento!",
    "userId": ""
  },
  {
    "city": "Belo Horizonte",
    "neighborhood": "Horto",
    "street": "Rua Desembargador Paulo Mota",
    "number": 30,
    "rating": 4,
    "commentary": "Área verde e tranquila, mas com poucas opções de comércio próximo.",
    "userId": ""
  },
  {
    "city": "São Paulo",
    "neighborhood": "Pinheiros",
    "street": "Rua Teodoro Sampaio",
    "number": 2000,
    "rating": 5,
    "commentary": "Excelente localização, cheio de bares e cultura. Apartamento renovado!",
    "userId": ""
  },
  {
    "city": "São Paulo",
    "neighborhood": "Moema",
    "street": "Avenida Ibirapuera",
    "number": 1000,
    "rating": 4,
    "commentary": "Bairro tranquilo e arborizado, perto do parque. Prédio antigo mas bem conservado.",
    "userId": ""
  },
  {
    "city": "São Paulo",
    "neighborhood": "Liberdade",
    "street": "Rua Galvão Bueno",
    "number": 500,
    "rating": 3,
    "commentary": "Cultura incrível, mas muito barulho à noite. Ideal para quem gosta de agito.",
    "userId": ""
  },
  {
    "city": "São Paulo",
    "neighborhood": "Jardins",
    "street": "Alameda Santos",
    "number": 1500,
    "rating": 5,
    "commentary": "Imóvel de luxo com tudo que você precisa na porta. Vale cada centavo!",
    "userId": ""
  },
  {
    "city": "São Paulo",
    "neighborhood": "Vila Madalena",
    "street": "Rua Aspicuelta",
    "number": 300,
    "rating": 4,
    "commentary": "Bairro artístico e cheio de vida. Ótimo para jovens e artistas.",
    "userId": ""
  },
  {
    "city": "São Paulo",
    "neighborhood": "Itaim Bibi",
    "street": "Rua Joaquim Floriano",
    "number": 100,
    "rating": 2,
    "commentary": "Caro para o que oferece. Problemas com infiltração no banheiro.",
    "userId": ""
  },
  {
    "city": "São Paulo",
    "neighborhood": "Perdizes",
    "street": "Rua Bartira",
    "number": 700,
    "rating": 4,
    "commentary": "Bom custo-benefício. Próximo a universidades e mercados.",
    "userId": ""
  },
  {
    "city": "São Paulo",
    "neighborhood": "Morumbi",
    "street": "Avenida Giovanni Gronchi",
    "number": 2000,
    "rating": 5,
    "commentary": "Casa espaçosa em condomínio fechado. Segurança 24h.",
    "userId": ""
  },
  {
    "city": "São Paulo",
    "neighborhood": "Bela Vista",
    "street": "Rua 13 de Maio",
    "number": 800,
    "rating": 3,
    "commentary": "Próximo ao centro, mas o prédio precisa de reformas.",
    "userId": ""
  },
  {
    "city": "São Paulo",
    "neighborhood": "Santana",
    "street": "Rua Voluntários da Pátria",
    "number": 2500,
    "rating": 4,
    "commentary": "Bairro familiar com ótimo transporte público. Supermercados próximos.",
    "userId": ""
  },
  {
    "city": "Rio de Janeiro",
    "neighborhood": "Copacabana",
    "street": "Avenida Atlântica",
    "number": 1500,
    "rating": 4,
    "commentary": "Vista incrível para o mar, mas barulho de turistas à noite. Prédio com piscina rooftop!",
    "userId": ""
  },
  {
    "city": "Rio de Janeiro",
    "neighborhood": "Ipanema",
    "street": "Rua Vinícius de Moraes",
    "number": 120,
    "rating": 5,
    "commentary": "Localização perfeita! A 2 quadras da praia e do metrô. Apartamento reformado.",
    "userId": ""
  },
  {
    "city": "Rio de Janeiro",
    "neighborhood": "Santa Teresa",
    "street": "Rua Almirante Alexandrino",
    "number": 800,
    "rating": 3,
    "commentary": "Bairro charmoso, mas muitas ladeiras. Casa antiga com problemas no telhado.",
    "userId": ""
  },
  {
    "city": "Rio de Janeiro",
    "neighborhood": "Botafogo",
    "street": "Rua Voluntários da Pátria",
    "number": 350,
    "rating": 4,
    "commentary": "Ótimo custo-benefício. Próximo ao metrô e shopping. Kitnet pequena porém funcional.",
    "userId": ""
  },
  {
    "city": "Rio de Janeiro",
    "neighborhood": "Leblon",
    "street": "Avenida Ataulfo de Paiva",
    "number": 900,
    "rating": 5,
    "commentary": "Imóvel de alto padrão com segurança 24h. Vizinhos silenciosos e área verde.",
    "userId": ""
  },
  {
    "city": "Rio de Janeiro",
    "neighborhood": "Lapa",
    "street": "Rua Mem de Sá",
    "number": 50,
    "rating": 2,
    "commentary": "Muito barulho de bares até de madrugada. Não recomendo para quem trabalha cedo.",
    "userId": ""
  },
  {
    "city": "Rio de Janeiro",
    "neighborhood": "Barra da Tijuca",
    "street": "Avenida das Américas",
    "number": 5000,
    "rating": 4,
    "commentary": "Apartamento novo com ótima infraestrutura, mas trânsito intenso em horários de pico.",
    "userId": ""
  },
  {
    "city": "Rio de Janeiro",
    "neighborhood": "Flamengo",
    "street": "Rua Dois de Dezembro",
    "number": 200,
    "rating": 3,
    "commentary": "Prédio antigo sem elevador. Localização boa, mas precisa de reformas.",
    "userId": ""
  },
  {
    "city": "Rio de Janeiro",
    "neighborhood": "Urca",
    "street": "Rua General Glicério",
    "number": 10,
    "rating": 5,
    "commentary": "Bairro tranquilo e seguro. Vista para o Pão de Açúcar. Impecável!",
    "userId": ""
  },
  {
    "city": "Rio de Janeiro",
    "neighborhood": "Tijuca",
    "street": "Rua Conde de Bonfim",
    "number": 1000,
    "rating": 4,
    "commentary": "Área residencial com comércio forte. Ótimo para famílias. Próximo ao metrô.",
    "userId": ""
  },
  {
    "city": "Salvador",
    "neighborhood": "Barra",
    "street": "Avenida Oceânica",
    "number": 100,
    "rating": 5,
    "commentary": "Vista espetacular para o mar! Apartamento moderno a 5min da praia. Segurança 24h.",
    "userId": ""
  },
  {
    "city": "Salvador",
    "neighborhood": "Pelourinho",
    "street": "Rua das Laranjeiras",
    "number": 15,
    "rating": 3,
    "commentary": "Cultura incrível, mas barulho de turistas até tarde. Casa colonial charmosa porém úmida.",
    "userId": ""
  },
  {
    "city": "Salvador",
    "neighborhood": "Rio Vermelho",
    "street": "Rua da Paciência",
    "number": 30,
    "rating": 4,
    "commentary": "Melhor lugar para quem gosta de vida noturna! Kitnet pequena mas bem localizada.",
    "userId": ""
  },
  {
    "city": "Salvador",
    "neighborhood": "Pituba",
    "street": "Avenida Manoel Dias da Silva",
    "number": 500,
    "rating": 4,
    "commentary": "Bairro completo com tudo perto. Prédio com piscina e academia. Trânsito intenso.",
    "userId": ""
  },
  {
    "city": "Salvador",
    "neighborhood": "Ondina",
    "street": "Rua Marques de Leão",
    "number": 80,
    "rating": 2,
    "commentary": "Problemas com infiltração. Preço alto para o estado do imóvel.",
    "userId": ""
  },
  {
    "city": "Salvador",
    "neighborhood": "Stella Maris",
    "street": "Avenida Praia de Stella Maris",
    "number": 1200,
    "rating": 5,
    "commentary": "Condomínio de luxo com acesso privativo à praia. Perfeito para famílias!",
    "userId": ""
  },
  {
    "city": "Salvador",
    "neighborhood": "Brotas",
    "street": "Rua Professor Augusto Viana",
    "number": 45,
    "rating": 3,
    "commentary": "Bom custo-benefício. Próximo a hospitais, mas falta estacionamento.",
    "userId": ""
  },
  {
    "city": "Salvador",
    "neighborhood": "Itaigara",
    "street": "Rua Patrocínio",
    "number": 200,
    "rating": 4,
    "commentary": "Bairro tranquilo e arborizado. Supermercados e escolas na porta.",
    "userId": ""
  },
  {
    "city": "Salvador",
    "neighborhood": "Caminho das Árvores",
    "street": "Rua Professor Sabino Silva",
    "number": 150,
    "rating": 5,
    "commentary": "Apartamento novo com ótimo acabamento. 10min do shopping e aeroporto.",
    "userId": ""
  },
  {
    "city": "Salvador",
    "neighborhood": "Imbuí",
    "street": "Avenida Jorge Amado",
    "number": 1800,
    "rating": 3,
    "commentary": "Área comercial movimentada. Bom para quem trabalha na região, mas barulhento.",
    "userId": ""
  }
]

export const uploadMockData = async () => {
  try {
    let successCount = 0;

    for (const review of mockReviews) {
      await databases.createDocument(
        DATABASE_ID,
        REVIEWS_ID,
        ID.unique(),
        {
          ...review,
          rating: review.rating * 2, // Converte 0-5 → 0-10
          userId: ""
        }
      );

      successCount++;
      console.log(`✅ Review #${successCount} (${review.neighborhood}) enviada!`);

      await new Promise(resolve => setTimeout(resolve, 1500)); // Delay seguro
    }

    console.log(`🎉 ${successCount}/${mockReviews.length} reviews enviadas com sucesso!`);
  } catch (error) {
    console.error("❌ Erro ao enviar reviews:", error);
  }
};