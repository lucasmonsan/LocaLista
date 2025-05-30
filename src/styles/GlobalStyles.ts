import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --color-text: #333;
    --color-bg: #f5f5f5;
  }

  body {
    font-family: 'Manrope', sans-serif;
    color: var(--color-text);
    background-color: var(--color-bg);
  }

  li {
    list-style: none;
  }

  img {
    height: 100%;
  }

  input {
    user-select: none;
  }
`;