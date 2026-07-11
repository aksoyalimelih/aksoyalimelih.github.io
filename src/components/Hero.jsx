import React, { useState, useEffect } from 'react';
import profileImg from '../assets/profile.png';
import sfx from '../utils/sfx';
import { translations } from '../utils/i18n';

const Hero = ({ about, setActiveSection, lang }) => {
  const titles = lang === 'tr' ? [
    "Jr. Full-Stack Developer",
    "Jr. Data Scientist",
    "Jr. Data Analyst",
    "Yapay Zekâ Entegratörü",
    "YBS Mezunu & Bilişim Uzmanı"
  ] : [
    "Jr. Full-Stack Developer",
    "Jr. Data Scientist",
    "Jr. Data Analyst",
    "AI Integrator",
    "MIS Graduate & IT Specialist"
  ];

  const [titleIndex, setTitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [showBubble, setShowBubble] = useState(false);

  const handleAvatarClick = () => {
    sfx.playClick();
    setShowBubble(true);
  };

  useEffect(() => {
    if (showBubble) {
      const timer = setTimeout(() => {
        setShowBubble(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showBubble]);

  useEffect(() => {
    let timer;
    const currentTitle = titles[titleIndex];

    if (isDeleting) {
      // Deleting text
      timer = setTimeout(() => {
        setDisplayText(currentTitle.substring(0, displayText.length - 1));
        setTypingSpeed(50);
      }, typingSpeed);
    } else {
      // Typing text
      timer = setTimeout(() => {
        setDisplayText(currentTitle.substring(0, displayText.length + 1));
        setTypingSpeed(150);
      }, typingSpeed);
    }

    if (!isDeleting && displayText === currentTitle) {
      // Pause at full text
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setTitleIndex((prevIndex) => (prevIndex + 1) % titles.length);
      setTypingSpeed(500); // Wait before starting next title
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, titleIndex]);

  const handleCtaClick = (id) => {
    sfx.playClick();
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hero" className="hero-section">
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>
      
      <div className="container hero-container">
        <div className="hero-content floating-anim">
          <div className="hero-profile-header">
            <div className="avatar-hud-wrapper">
              {showBubble && (
                <div className="avatar-speech-bubble font-mono">
                  {lang === 'tr' 
                    ? "Yapay zekâ bile bu tipi kurtaramadı... En fazla bu kadar vesikalık çıkarabildi! 🤖😅" 
                    : "Even AI couldn't save this face... This passport photo is the best it could do! 🤖😅"}
                </div>
              )}
              <div className="avatar-hud-ring ring-1"></div>
              <div className="avatar-hud-ring ring-2"></div>
              <div className="avatar-hud-ring ring-3"></div>
              <div 
                className="avatar-container glass-card cursor-pointer"
                onClick={handleAvatarClick}
                onMouseEnter={() => sfx.playTick()}
                title={lang === 'tr' ? "Tıkla!" : "Click!"}
              >
                <img src={profileImg} alt="Ali Melih Aksoy" className="hero-avatar-image" />
                <div className="avatar-scanner"></div>
              </div>
            </div>

            <div className="hero-profile-info">
              <div className="hero-badge font-mono">
                <span className="badge-pulse"></span>
                {lang === 'tr' ? translations.tr.readyToDevelop : translations.en.readyToDevelop}
              </div>
              
              <h1 className="hero-name">
                {about?.name || 'ALİ MELİH AKSOY'}
              </h1>
              
              <h2 className="hero-title">
                <span className="text-gradient font-orbitron">{displayText}</span>
                <span className="cursor-blink">|</span>
              </h2>
            </div>
          </div>
          
          <p className="hero-description">
            {lang === 'tr' ? translations.tr.heroDesc : translations.en.heroDesc}
          </p>
          
          <div className="hero-actions">
            <button 
              onClick={() => handleCtaClick('projects')} 
              onMouseEnter={() => sfx.playTick()}
              className="btn btn-primary"
            >
              {lang === 'tr' ? translations.tr.viewProjects : translations.en.viewProjects}
            </button>
            <button 
              onClick={() => handleCtaClick('contact')} 
              onMouseEnter={() => sfx.playTick()}
              className="btn btn-secondary"
            >
              {lang === 'tr' ? translations.tr.getInTouch : translations.en.getInTouch}
            </button>
          </div>
        </div>

        {/* Tech graphic background box with only python console */}
        <div className="hero-visual">
          <div className="tech-box glass-card">
            <div className="tech-box-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span className="tech-box-title font-mono">ali_melih_aksoy.py</span>
            </div>
            <div className="tech-box-content font-mono">
              <p className="line"><span className="keyword">import</span> tensorflow <span className="keyword">as</span> tf</p>
              <p className="line"><span className="keyword">import</span> react, php, nodejs</p>
              <p className="line"><span className="comment"># Developer capabilities</span></p>
              <p className="line">developer = Developer(</p>
              <p className="line indent">name=<span className="string">"Ali Melih Aksoy"</span>,</p>
              <p className="line indent">stack=[<span className="string">"React"</span>, <span className="string">"PHP"</span>, <span className="string">"Python"</span>],</p>
              <p className="line indent">focus=<span className="string">"AI Integrations & Full-Stack"</span></p>
              <p className="line">)</p>
              <p className="line">developer.build_neural_network()</p>
              <p className="line"><span className="output">&gt;&gt;&gt; Model accuracy: 93%</span></p>
              <p className="line"><span className="output">&gt;&gt;&gt; Status: Ready for deploy.</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
