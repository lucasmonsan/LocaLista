import { BrazilIcon } from "../../assets/BrazilIcon"; // Ajuste os caminhos se necessário
import { DarkIcon } from "../../assets/DarkIcon";
import { LightIcon } from "../../assets/LightIcon";
import { UnitedStatesIcon } from "../../assets/UnitedStatesIcon";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import "./header.css";

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  // Removido isSearchFocused da desestruturação de useLanguage
  const { language, setLanguage } = useLanguage();

  const handleLanguageToggle = () => {
    const newLanguage = language === 'pt-BR' ? 'en-US' : 'pt-BR';
    setLanguage(newLanguage);
  };

  const languageButtonAriaLabel = language === 'pt-BR'
    ? 'Switch to English (US)'
    : 'Mudar para Português (Brasil)';

  const themeButtonAriaLabel = theme === "light"
    ? 'Mudar para modo escuro'
    : 'Mudar para modo claro';

  return (
    <header id="Header">
      <button
        className='buttonHeader opacity_scale_rotation'
        onClick={toggleTheme}
        aria-label={themeButtonAriaLabel}
      >
        {theme === "light" ? <LightIcon /> : <DarkIcon />}
      </button>

      <button
        className='buttonHeader opacity_scale_rotation'
        onClick={handleLanguageToggle}
        // Removida a propriedade 'disabled'
        aria-label={languageButtonAriaLabel}
      >
        {language === "pt-BR" ? <BrazilIcon /> : <UnitedStatesIcon />}
      </button>
    </header>
  );
}