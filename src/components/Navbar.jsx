import React, { useState } from 'react';
import ThemeSwitcher from './ThemeSwitcher';
import sfx from '../utils/sfx';
import { translations } from '../utils/i18n';

const Navbar = ({ activeSection, setActiveSection, currentThemeId, setCurrentThemeId, lang, setLang }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { id: 'hero', label: lang === 'tr' ? translations.tr.home : translations.en.home },
    { id: 'about', label: lang === 'tr' ? translations.tr.about : translations.en.about },
    { id: 'experience', label: lang === 'tr' ? translations.tr.experience : translations.en.experience },
    { id: 'projects', label: lang === 'tr' ? translations.tr.projects : translations.en.projects },
    { id: 'certificates', label: lang === 'tr' ? translations.tr.certificates : translations.en.certificates },
    { id: 'contact', label: lang === 'tr' ? translations.tr.contact : translations.en.contact }
  ];

  const handleNavClick = (id) => {
    sfx.playClick();
    setIsOpen(false);
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleLanguage = () => {
    sfx.playClick();
    const nextLang = lang === 'tr' ? 'en' : 'tr';
    setLang(nextLang);
    localStorage.setItem('language', nextLang);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar glass-card">
        <div 
          className="navbar-logo" 
          onClick={() => handleNavClick('hero')}
          onMouseEnter={() => sfx.playTick()}
        >
          <span className="text-gradient font-orbitron font-heavy glitch-hover" data-text="AMA">AMA</span>
          <span className="logo-dot">.</span>
        </div>

        {/* Desktop navigation */}
        <ul className="navbar-links">
          {navLinks.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => handleNavClick(link.id)}
                onMouseEnter={() => sfx.playTick()}
                className={`navbar-link ${activeSection === link.id ? 'active' : ''}`}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <button 
            className="lang-switcher-btn font-mono"
            onClick={toggleLanguage}
            title={lang === 'tr' ? 'Switch to English' : 'Türkçe\'ye Geç'}
          >
            {lang === 'tr' ? 'EN' : 'TR'}
          </button>
          
          <ThemeSwitcher currentThemeId={currentThemeId} setCurrentThemeId={setCurrentThemeId} />
          
          {/* Hamburger button */}
          <button 
            className="navbar-hamburger" 
            onClick={() => { sfx.playClick(); setIsOpen(!isOpen); }} 
            aria-label="Menu"
          >
            <span className={`bar ${isOpen ? 'open' : ''}`}></span>
            <span className={`bar ${isOpen ? 'open' : ''}`}></span>
            <span className={`bar ${isOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu glass-card ${isOpen ? 'open' : ''}`}>
        <ul className="mobile-menu-links">
          {navLinks.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => handleNavClick(link.id)}
                onMouseEnter={() => sfx.playTick()}
                className={`mobile-navbar-link ${activeSection === link.id ? 'active' : ''}`}
              >
                {link.label}
              </button>
            </li>
          ))}
          <li className="mobile-lang-item" style={{ padding: '0.75rem 1.5rem' }}>
            <button 
              className="lang-switcher-btn font-mono w-full"
              onClick={toggleLanguage}
            >
              {lang === 'tr' ? 'ENGLISH (EN)' : 'TÜRKÇE (TR)'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
