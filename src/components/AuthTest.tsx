import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Client, Account, ID, Databases } from 'appwrite';
import { DATABASE_ID, COLLECTIONS } from '../services/appwrite';

// Configuração do Appwrite
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);

// Tipos para os formulários
interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

interface LoginForm {
  email: string;
  password: string;
}

interface ReviewForm {
  cityId: string;
  neighborhoodId: string;
  street: string;
  number: number;
  rating: number;
  commentary: string;
}

const AuthTest = () => {
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar sessão ativa ao carregar o componente
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
        setStatus('Sessão restaurada com sucesso!');
      } catch (err: any) {
        // Nenhum usuário logado, normal
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Formulário de Cadastro
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    reset: resetRegister,
  } = useForm<RegisterForm>();

  // Formulário de Login
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    reset: resetLogin,
  } = useForm<LoginForm>();

  // Formulário de Review
  const {
    register: registerReview,
    handleSubmit: handleReviewSubmit,
    reset: resetReview,
  } = useForm<ReviewForm>();

  // Cadastro
  const onRegister: SubmitHandler<RegisterForm> = async (data) => {
    try {
      await account.create(ID.unique(), data.email, data.password, data.name);
      setStatus('Usuário cadastrado com sucesso! Faça login.');
      resetRegister();
    } catch (err: any) {
      setError('Erro ao cadastrar: ' + err.message);
    }
  };

  // Login
  const onLogin: SubmitHandler<LoginForm> = async (data) => {
    try {
      await account.createEmailPasswordSession(data.email, data.password);
      const userData = await account.get();
      setUser(userData);
      setStatus('Login realizado com sucesso!');
      resetLogin();
    } catch (err: any) {
      if (err.message.includes('Creation of a session is prohibited')) {
        try {
          const userData = await account.get();
          setUser(userData);
          setStatus('Você já está logado!');
          resetLogin();
        } catch (innerErr: any) {
          setError('Erro ao verificar sessão: ' + innerErr.message);
        }
      } else {
        setError('Erro ao fazer login: ' + err.message);
      }
    }
  };

  // Criar Review
  const onCreateReview: SubmitHandler<ReviewForm> = async (data) => {
    if (!user) {
      setError('Você precisa estar logado para criar uma review.');
      return;
    }
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.REVIEWS,
        ID.unique(),
        {
          cityId: data.cityId,
          neighborhoodId: data.neighborhoodId,
          street: data.street,
          number: data.number,
          rating: data.rating,
          commentary: data.commentary,
          userId: user.$id,
        }
      );
      setStatus('Review criada com sucesso!');
      resetReview();
    } catch (err: any) {
      setError('Erro ao criar review: ' + err.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setStatus('Logout realizado com sucesso!');
    } catch (err: any) {
      setError('Erro ao fazer logout: ' + err.message);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Teste de Autenticação</h1>

      {!user ? (
        <>
          {/* Cadastro */}
          <h2>Cadastro</h2>
          <form onSubmit={handleRegisterSubmit(onRegister)}>
            <div>
              <label>Nome:</label>
              <input
                type="text"
                {...registerRegister('name', { required: true })}
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                {...registerRegister('email', { required: true })}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label>Senha:</label>
              <input
                type="password"
                {...registerRegister('password', { required: true, minLength: 8 })}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <button type="submit">Cadastrar</button>
          </form>

          {/* Login */}
          <h2>Login</h2>
          <form onSubmit={handleLoginSubmit(onLogin)}>
            <div>
              <label>Email:</label>
              <input
                type="email"
                {...registerLogin('email', { required: true })}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label>Senha:</label>
              <input
                type="password"
                {...registerLogin('password', { required: true })}
                placeholder="Sua senha"
              />
            </div>
            <button type="submit">Entrar</button>
          </form>
        </>
      ) : (
        <>
          {/* Usuário Logado */}
          <h2>Bem-vindo, {user.name}!</h2>
          <button onClick={handleLogout}>Sair</button>

          {/* Criar Review */}
          <h2>Criar Review</h2>
          <form onSubmit={handleReviewSubmit(onCreateReview)}>
            <div>
              <label>ID da Cidade:</label>
              <input
                type="text"
                {...registerReview('cityId', { required: true })}
                placeholder="Ex.: ID de Divinópolis"
              />
            </div>
            <div>
              <label>ID do Bairro:</label>
              <input
                type="text"
                {...registerReview('neighborhoodId', { required: true })}
                placeholder="Ex.: ID de Centro"
              />
            </div>
            <div>
              <label>Rua:</label>
              <input
                type="text"
                {...registerReview('street', { required: true })}
                placeholder="Ex.: Rua São Paulo"
              />
            </div>
            <div>
              <label>Número:</label>
              <input
                type="number"
                {...registerReview('number', { required: true, valueAsNumber: true })}
                placeholder="Ex.: 100"
              />
            </div>
            <div>
              <label>Rating (0-10):</label>
              <select {...registerReview('rating', { required: true, valueAsNumber: true })}>
                {Array.from({ length: 11 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Comentário:</label>
              <textarea
                {...registerReview('commentary', { required: true })}
                placeholder="Sua opinião sobre o imóvel"
              />
            </div>
            <button type="submit">Criar Review</button>
          </form>
        </>
      )}

      {status && <p style={{ color: 'green' }}>{status}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AuthTest;