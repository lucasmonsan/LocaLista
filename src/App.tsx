import styled from 'styled-components';
import AuthTest from './components/AuthTest';

function App() {
  return (
    <Container>
      <AuthTest />
    </Container>
  );
}

export default App;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  border: solid 1px red;
`;