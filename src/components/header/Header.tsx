import { DarkIcon } from "../../assets/DarkIcon";
import { LightIcon } from "../../assets/LightIcon";
import { useTheme } from "../../contexts/ThemeContext";
import "./header.css"

export const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header id="Header">
      <button className='buttonHeader' onClick={toggleTheme} aria-label={theme === "light" ? 'Switch to dark mode' : 'Switch to light mode'}>
        {theme === "light" ? <LightIcon /> : <DarkIcon />}
      </button>
    </header>
  )
}