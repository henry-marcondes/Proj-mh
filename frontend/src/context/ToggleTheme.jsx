import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function ToggleTheme() {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleDarkMode}
      style={{
        padding: '10px 15px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        backgroundColor: 'var(--primary)',
        color: '#fff'
      }}
    >
      {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
    </button>
  );
}

export default ToggleTheme;
