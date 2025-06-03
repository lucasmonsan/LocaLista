import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'
import { SearchProvider } from './contexts/SearchContext.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <SearchProvider>
          <App />
        </SearchProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
