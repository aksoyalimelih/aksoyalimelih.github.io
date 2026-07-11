import React, { useState, useEffect } from 'react';
import TechBackground from './components/TechBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import ThemeSwitcher, { themes } from './components/ThemeSwitcher';
// InteractiveTerminal removed
import BugShooterGame from './components/BugShooterGame';
import Modal from './components/Modal';
import BootLoader from './components/BootLoader';
import { translateText, translations } from './utils/i18n';

function App() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState(localStorage.getItem('language') || 'tr');
  
  // Navigation & View States
  const [activeSection, setActiveSection] = useState('hero');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  
  // Feedback Toasts
  const [toasts, setToasts] = useState([]);

  // Siber Arayüz & Oyun Durumları
  const [currentThemeId, setCurrentThemeId] = useState('cyber-cyan');
  const [showGame, setShowGame] = useState(false);
  const [isGlitchActive, setIsGlitchActive] = useState(false);
  const [isBooted, setIsBooted] = useState(false);

  // Easter eggs keyboard listeners
  useEffect(() => {
    let keysPressed = [];
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let typedBuffer = '';

    const handleKeys = (e) => {
      // 1. Konami Code (Glitch screen effect)
      keysPressed.push(e.code);
      keysPressed = keysPressed.slice(-10);
      if (JSON.stringify(keysPressed) === JSON.stringify(konamiCode)) {
        setIsGlitchActive(true);
        addToast('SİSTEM_ARIZASI: Konami Kodu Aktif Edildi!', 'error');
        setTimeout(() => setIsGlitchActive(false), 2200);
      }

      // 2. Matrix code rain trigger (Typing "matrix" on screen)
      if (e.key) {
        typedBuffer += e.key.toLowerCase();
        typedBuffer = typedBuffer.slice(-12);
        if (typedBuffer.endsWith('matrix')) {
          addToast('Matrix Kod Yağmuru Aktif Edildi!', 'success');
          window.dispatchEvent(new CustomEvent('matrixRainToggle'));
          typedBuffer = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch portfolio data on mount
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('/api/portfolio');
        if (!response.ok) {
          throw new Error('Veriler yüklenirken bir sorun oluştu.');
        }
        const data = await response.json();
        setPortfolioData(data);
      } catch (err) {
        setError(err.message);
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // Update active section based on scroll position
  useEffect(() => {
    if (isAdminMode) return;

    const sections = ['hero', 'about', 'experience', 'projects', 'certificates', 'contact'];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for navbar

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const height = rect.height;
          if (scrollPosition >= top && scrollPosition < top + height) {
            // Certificates is inside About component, we handle its highlighting
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminMode]);

  // Secret Admin URL path monitor
  useEffect(() => {
    const checkSecretRoute = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      if (path === '/secure-panel-ali-melih' || searchParams.has('secure-admin')) {
        if (token) {
          setIsAdminMode(true);
        } else {
          setShowLogin(true);
        }
        window.history.replaceState({}, document.title, '/');
      }
    };
    
    checkSecretRoute();
    window.addEventListener('popstate', checkSecretRoute);
    return () => window.removeEventListener('popstate', checkSecretRoute);
  }, [token]);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem('adminToken', newToken);
    setShowLogin(false);
    setIsAdminMode(true);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
    setIsAdminMode(false);
    addToast('Oturum kapatıldı.', 'success');
  };

  const handleAdminNavClick = () => {
    if (token) {
      setIsAdminMode(!isAdminMode);
    } else {
      setShowLogin(true);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader font-mono text-gradient">
          LOADING_PORTFOLIO_SYSTEM...
          <span className="cursor-blink">|</span>
        </div>
      </div>
    );
  }

  if (!isBooted) {
    return (
      <BootLoader onComplete={() => {
        sessionStorage.setItem('system_booted', 'true');
        setIsBooted(true);
      }} />
    );
  }

  if (error && !portfolioData) {
    return (
      <div className="loader-container flex-col">
        <h2 className="font-orbitron text-red-500 mb-4">HATA!</h2>
        <p className="mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Yeniden Dene</button>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic Animated Particles Network */}
      <TechBackground />

      {/* Toast Notification popups */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{t.type === 'success' ? '✓' : '⚠'}</span>
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main Page Layout */}
      {isAdminMode && token ? (
        // Admin Mode View
        <div className="admin-root fade-in">
          <header className="admin-nav-bar glass-card container mt-4 py-3 flex justify-between items-center">
            <div className="admin-nav-logo font-orbitron font-heavy text-gradient" onClick={() => setIsAdminMode(false)} style={{ cursor: 'pointer' }}>
              AMA <span className="text-white text-xs">PORTFOLIO ADMIN</span>
            </div>
            <button onClick={() => setIsAdminMode(false)} className="btn btn-secondary py-1 px-4 text-sm">
              Siteden Çıkış (Geri Dön)
            </button>
          </header>
          
          <AdminPanel
            portfolioData={portfolioData}
            token={token}
            onUpdate={setPortfolioData}
            onLogout={handleLogout}
            addToast={addToast}
          />
        </div>
      ) : (
        // Public Portfolio View
        <div className={`portfolio-root fade-in ${isGlitchActive ? 'glitch-screen-active' : ''}`}>
          <Navbar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
            currentThemeId={currentThemeId}
            setCurrentThemeId={setCurrentThemeId}
            lang={lang}
            setLang={setLang}
          />

          <main>
            <Hero about={portfolioData?.about} setActiveSection={setActiveSection} lang={lang} />
            
            <About 
              about={portfolioData?.about} 
              skills={portfolioData?.skills} 
              certificates={portfolioData?.certificates}
              education={portfolioData?.education}
              lang={lang}
            />
            
            <Experience experience={portfolioData?.experience} lang={lang} />
            
            <Projects projects={portfolioData?.projects} lang={lang} />
            
            <Contact about={portfolioData?.about} addToast={addToast} lang={lang} />
          </main>

          <footer className="portfolio-footer glass-card">
            <div className="container footer-content font-mono text-center">
              <p>{lang === 'tr' ? translations.tr.footerText1 : translations.en.footerText1}</p>
              <p className="footer-subtext mt-1 text-xs text-muted">{lang === 'tr' ? translations.tr.footerText2 : translations.en.footerText2}</p>
            </div>
          </footer>
        </div>
      )}

      {/* Admin Login Dialog Overlay */}
      {showLogin && (
        <AdminLogin
          onLogin={handleLoginSuccess}
          onCancel={() => setShowLogin(false)}
          addToast={addToast}
        />
      )}

      {/* Interactive terminal removed */}

      {/* Bug Shooter Modal Game */}
      {showGame && (
        <Modal 
          isOpen={showGame} 
          onClose={() => setShowGame(false)} 
          title="BUG_SHOOTER_IDE_v1.0 [COMPILE_SANDBOX]"
        >
          <BugShooterGame onClose={() => setShowGame(false)} />
        </Modal>
      )}
    </>
  );
}

export default App;
