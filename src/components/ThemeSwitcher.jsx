import React, { useState, useEffect } from 'react';

const themes = [
  {
    id: 'cyber-cyan',
    name: 'Cyber Cyan',
    primary: '#00f2fe',
    primaryRgb: '0, 242, 254',
    secondary: '#9d4edd',
    secondaryRgb: '157, 78, 221',
    accent: '#ff007f'
  },
  {
    id: 'neon-synth',
    name: 'Neon Synth',
    primary: '#ff007f',
    primaryRgb: '255, 0, 127',
    secondary: '#7f00ff',
    secondaryRgb: '127, 0, 255',
    accent: '#00f2fe'
  },
  {
    id: 'matrix-green',
    name: 'Matrix Green',
    primary: '#39ff14',
    primaryRgb: '57, 255, 20',
    secondary: '#008f11',
    secondaryRgb: '0, 143, 17',
    accent: '#ffffff'
  },
  {
    id: 'solar-hack',
    name: 'Solar Hack',
    primary: '#ff6b08',
    primaryRgb: '255, 107, 8',
    secondary: '#ff003c',
    secondaryRgb: '255, 0, 60',
    accent: '#00f2fe'
  }
];

const ThemeSwitcher = ({ currentThemeId, setCurrentThemeId }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load and apply initial theme
    const savedTheme = localStorage.getItem('themeId') || 'cyber-cyan';
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId) => {
    const theme = themes.find(t => t.id === themeId) || themes[0];
    const root = document.documentElement;
    
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-rgb', theme.primaryRgb);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--secondary-rgb', theme.secondaryRgb);
    root.style.setProperty('--accent', theme.accent);
    
    // Update active particle color dynamically if the canvas listener exists
    window.dispatchEvent(new CustomEvent('themeChange', { detail: theme }));
    
    setCurrentThemeId(themeId);
    localStorage.setItem('themeId', themeId);
  };

  return (
    <div className={`theme-switcher ${isOpen ? 'open' : ''}`}>
      <button 
        className="theme-switcher-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Renk Teması Seç"
      >
        🎨
      </button>
      <div className="theme-switcher-menu glass-card">
        <h4 className="theme-menu-title font-mono text-xs mb-3 text-gradient">Siber Arayüz Teması</h4>
        <div className="theme-buttons-grid">
          {themes.map(t => (
            <button
              key={t.id}
              className={`theme-btn ${currentThemeId === t.id ? 'active' : ''}`}
              onClick={() => applyTheme(t.id)}
              style={{
                background: `linear-gradient(135deg, ${t.primary} 0%, ${t.secondary} 100%)`
              }}
              title={t.name}
            >
              <span className="theme-btn-check">{currentThemeId === t.id ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
export { themes };
