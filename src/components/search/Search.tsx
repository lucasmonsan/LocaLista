import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import "./search.css";

// Supondo que você tenha estes ícones. Ajuste os caminhos se necessário.
import { SearchIcon } from "../../assets/SearchIcon";
import { LoadingIcon } from "../../assets/LoadingIcon"; // Seu ícone de loading
import { ClearIcon } from "../../assets/ClearIcon";   // Seu ícone para limpar

import { useLanguage } from "../../contexts/LanguageContext";
import { useSearch, type RefinedSearchResult } from "../../contexts/SearchContext";

export const Search = () => {
  const { language } = useLanguage();

  const {
    searchTerm,
    setSearchTerm,
    refinedResults,
    isLoading,
    inputHasFocus,
    setInputHasFocus,
    clearSearch,
    currentSearchQuery
  } = useSearch();

  const [currentContent, setCurrentContent] = useState<ReactNode>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearOrActionButtonClick = () => {
    if (isLoading) {
      return;
    }
    if (searchTerm.length > 0 || inputHasFocus) {
      clearSearch();
      const inputElement = document.getElementById('InputSearch') as HTMLInputElement | null;
      inputElement?.focus();
    }
  };

  // Lógica ATUALIZADA para determinar o conteúdo do container de resultados
  let resultsContainerContent: React.ReactNode = null;

  if (inputHasFocus) { // Só mostra algo se o input estiver focado
    if (isLoading) {
      resultsContainerContent = <p>Buscando...</p>; // Mensagem de carregamento
    } else if (currentSearchQuery && refinedResults.length > 0) {
      // Se uma busca foi feita (currentSearchQuery existe) E temos resultados
      resultsContainerContent = (
        // Mantemos a lista de resultados como antes
        <ul>
          {refinedResults.map((result) => (
            <li key={result.id} onClick={() => console.log("Selecionado:", result)}>
              {result.displayName} ({result.type}) <br />
              <small>{result.addressCountry}{result.addressState ? `, ${result.addressState}` : ''}</small>
            </li>
          ))}
        </ul>
      );
    } else if (currentSearchQuery && refinedResults.length === 0) {
      resultsContainerContent = <strong>Nenhum resultado encontrado para "{currentSearchQuery}". Tente outros termos.</strong>;
    } else {
      resultsContainerContent = <strong>Preciso de pelo menos 3 caracteres para te ajudar...</strong>;
    }
  }

  // Determinar qual ícone mostrar no botão (lógica anterior mantida)
  let buttonIcon;
  let buttonAction = handleClearOrActionButtonClick;
  let buttonAriaLabel = "Limpar busca";

  if (isLoading) {
    buttonIcon = <LoadingIcon />;
    buttonAction = () => { };
    buttonAriaLabel = "Buscando";
  } else if (inputHasFocus || searchTerm.length > 0) {
    buttonIcon = <ClearIcon />;
    buttonAriaLabel = "Limpar texto da busca";
  } else {
    buttonIcon = <SearchIcon />;
    buttonAriaLabel = "Iniciar busca";
  }

  const placeholderText = language === 'pt-BR' ? "Digite o local..." : "Type a location...";

  // Efeito para animar a transição entre conteúdos
  useEffect(() => {
    if (!resultsContainerRef.current) return;

    const container = resultsContainerRef.current;

    // Se não há conteúdo novo, apenas limpe
    if (!resultsContainerContent) {
      setCurrentContent(null);
      return;
    }

    // Se há conteúdo novo e é diferente do atual
    if (resultsContainerContent !== currentContent) {
      // Adiciona fade-out ao conteúdo atual (se existir)
      if (container.children.length > 0) {
        const firstChild = container.children[0];
        firstChild.classList.add('fade-out');

        // Aguarda a animação terminar antes de atualizar
        setTimeout(() => {
          setCurrentContent(resultsContainerContent);
        }, 250); // Match com --fast no CSS (0.25s)
      } else {
        // Primeira renderização
        setCurrentContent(resultsContainerContent);
      }
    }
  }, [resultsContainerContent]);


  return (
    <footer id="Footer">
      <div id="ResultsContainer" className={inputHasFocus ? 'visible' : ''} ref={resultsContainerRef} >
        {currentContent}
      </div>

      <form id="FormSearch" action="" onSubmit={(e) => e.preventDefault()}>
        <input id="InputSearch" type="text" value={searchTerm} onChange={handleInputChange}
          onFocus={() => setInputHasFocus(true)} onBlur={() => setInputHasFocus(false)}
          placeholder={placeholderText}
        />
        <button id="ButtonSearch" type="button" onClick={buttonAction} aria-label={buttonAriaLabel} >
          {buttonIcon}
        </button>
      </form>
    </footer>
  );
};