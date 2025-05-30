// src/App.tsx
import styled from 'styled-components';

function App() {
  return (
    <Container>
      <h1>LocaLista - Mapa de Reviews de Aluguéis</h1>
      <p>Bem-vindo ao projeto!</p>
    </Container>
  );
}

export default App;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;