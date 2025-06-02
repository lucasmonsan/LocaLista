import type { Language } from "../../contexts/LanguageContext";
import type { Theme } from "../../contexts/ThemeContext";

export const changeTheme = (theme: string, setTheme: (theme: Theme) => void) => {
  theme === "dark" ? setTheme("light") : setTheme("dark")
}

export const changeLanguage = (language: string, setLanguage: (lang: Language) => void) => {
  setLanguage(language === 'pt' ? 'en' : 'pt');
};