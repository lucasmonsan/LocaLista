import './index.css'
import { changeTheme, changeLanguage } from './header'
import { LightIcon } from '../../assets/LightIcon'
import { DarkIcon } from '../../assets/DarkIcon'
import { useLanguage } from '../../contexts/LanguageContext'
import { BrazilIcon } from '../../assets/BrazilIcon'
import { UnitedStatesIcon } from '../../assets/UnitedStatesIcon'
import { useTheme } from '../../contexts/ThemeContext'
import { uploadMockData } from '../mockAppwrite'

export const Header = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <header id="HeaderContainer" role="banner">
      <button
        className='headerButton'
        onClick={() => changeLanguage(language, setLanguage)}
        aria-label={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
      >
        {language === 'pt' ? (<BrazilIcon />) : (<UnitedStatesIcon />)}
      </button>

      <button
        className='headerButton'
        onClick={() => changeTheme(theme, setTheme)}
        aria-label={theme === "light" ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === "light" ? <LightIcon /> : <DarkIcon />}
      </button>

      <button
        onClick={() => uploadMockData}
        className="headerButton"
      >
        UP
      </button>
    </header>
  )
}