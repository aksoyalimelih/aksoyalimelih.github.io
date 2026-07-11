import React, { useState, useEffect, useRef } from 'react';

const InteractiveTerminal = ({ onOpenGame, onThemeChange, aboutData, skillsData, projectsData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    { text: 'AMA SECURE COMMAND SHELL (v2.0.26)', type: 'system' },
    { text: 'Sistem yükleniyor... Bağlantı güvenli.', type: 'system' },
    { text: "Mevcut komutları görmek için 'help' yazın.", type: 'system' },
    { text: '', type: 'empty' }
  ]);
  
  const historyEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom of terminal
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  // Focus input when terminal is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleCommand = (cmdStr) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const newHistory = [...history, { text: `guest@ali-melih-aksoy:~$ ${trimmed}`, type: 'prompt' }];
    const args = trimmed.split(' ');
    const command = args[0].toLowerCase();
    const commandArg = args[1] ? args[1].toLowerCase() : null;

    switch (command) {
      case 'help':
        newHistory.push(
          { text: 'Mevcut Komutlar:', type: 'system' },
          { text: '  about      - Hakkımda kısa bilgi gösterir.', type: 'info' },
          { text: '  skills     - Sahip olduğum teknik becerileri listeler.', type: 'info' },
          { text: '  projects   - Tamamlanmış temel projeleri listeler.', type: 'info' },
          { text: '  neofetch   - Sistem ve profil özelliklerini grafiksel özetler.', type: 'info' },
          { text: '  game       - Retro Bug Shooter arcade oyununu açar.', type: 'info' },
          { text: '  theme [x]  - Renk temasını değiştirir. (Örn: theme neon-synth)', type: 'info' },
          { text: '               (Temalar: cyber-cyan, neon-synth, matrix-green, solar-hack)', type: 'info' },
          { text: '  matrix     - Arka plandaki dijital matrix yağmurunu tetikler!', type: 'info' },
          { text: '  clear      - Konsolu temizler.', type: 'info' }
        );
        break;
      
      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      case 'about':
        newHistory.push({
          text: aboutData?.summary || 'Full-Stack Developer & Data Science Specialist',
          type: 'output'
        });
        break;

      case 'skills':
        if (skillsData) {
          newHistory.push(
            { text: '=== TEKNİK BECERİLER ===', type: 'system' },
            { text: `Diller:       ${skillsData.languages?.join(', ')}`, type: 'output' },
            { text: `Frameworkler: ${skillsData.frameworks?.join(', ')}`, type: 'output' },
            { text: `Veri Tabanı:  ${skillsData.databases?.join(', ')}`, type: 'output' },
            { text: `Araçlar:      ${skillsData.tools?.join(', ')}`, type: 'output' }
          );
        }
        break;

      case 'projects':
        if (projectsData) {
          newHistory.push({ text: '=== PROJELER ===', type: 'system' });
          projectsData.forEach(p => {
            newHistory.push({ 
              text: `• [${p.category}] ${p.title} - ${p.description} (${p.technologies.slice(0, 3).join(', ')})`, 
              type: 'output' 
            });
          });
        }
        break;

      case 'neofetch':
        newHistory.push({
          text: `
    /\\_/\\      guest@ali-melih-aksoy
   ( o.o )     ---------------------
    > ^ <      OS: Cyberpunk OS v2026.1
               Host: Ali Melih Aksoy Portfolio
               Kernel: React 19.0 / Node 24.5
               Uptime: ${Math.floor(performance.now() / 1000)}s
               Resolution: ${window.innerWidth}x${window.innerHeight}
               Shell: AMA_Secure_Shell
               GPA: 3.19 / 4.00 (YBS Mezunu)
               Status: Ready for deployment
          `,
          type: 'ascii'
        });
        break;

      case 'game':
        newHistory.push({ text: 'Arcade modülü yükleniyor... Gemi hazır.', type: 'success' });
        setTimeout(() => {
          onOpenGame();
        }, 300);
        break;

      case 'theme':
        if (!commandArg) {
          newHistory.push({ text: 'Lütfen bir tema adı belirtin: theme [cyber-cyan | neon-synth | matrix-green | solar-hack]', type: 'error' });
        } else {
          const validThemes = ['cyber-cyan', 'neon-synth', 'matrix-green', 'solar-hack'];
          if (validThemes.includes(commandArg)) {
            onThemeChange(commandArg);
            newHistory.push({ text: `Renk teması başarıyla '${commandArg}' olarak güncellendi.`, type: 'success' });
          } else {
            newHistory.push({ text: `Geçersiz tema. Mevcut temalar: ${validThemes.join(', ')}`, type: 'error' });
          }
        }
        break;

      case 'matrix':
        newHistory.push({ text: 'Matrix Code Rain modülü başlatılıyor...', type: 'success' });
        window.dispatchEvent(new CustomEvent('matrixRainToggle'));
        break;
      
      case 'sudo':
        newHistory.push({ text: 'Giriş Engellendi: Bu işlem için guest kullanıcısının yetkisi yok. Nice try, hacker!', type: 'error' });
        break;

      default:
        newHistory.push({ text: `Komut bulunamadı: '${command}'. Yardım için 'help' yazın.`, type: 'error' });
    }

    newHistory.push({ text: '', type: 'empty' });
    setHistory(newHistory);
    setInputVal('');
  };

  const handleInputSubmit = (e) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    }
  };

  return (
    <div className={`terminal-drawer ${isOpen ? 'open' : ''}`}>
      {/* Header bar */}
      <div className="terminal-header-bar glass-card" onClick={() => setIsOpen(!isOpen)}>
        <div className="status-dots">
          <span className="dot pulse-anim"></span>
          <span className="terminal-bar-title font-mono text-xs">guest@ali-melih-aksoy:~$ (Siber Terminal)</span>
        </div>
        <span className="terminal-toggle-btn">{isOpen ? '▼' : '▲'}</span>
      </div>

      {/* Console area */}
      {isOpen && (
        <div className="terminal-console-body glass-card font-mono" onClick={() => inputRef.current?.focus()}>
          <div className="terminal-scroll-area">
            {history.map((line, idx) => (
              <div 
                key={idx} 
                className={`terminal-line line-${line.type}`}
                style={{ whiteSpace: line.type === 'ascii' ? 'pre' : 'normal' }}
              >
                {line.text}
              </div>
            ))}
            <div ref={historyEndRef} />
          </div>

          <div className="terminal-input-prompt">
            <span className="prompt-label">guest@ali-melih-aksoy:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleInputSubmit}
              className="terminal-raw-input"
              maxLength="50"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveTerminal;
