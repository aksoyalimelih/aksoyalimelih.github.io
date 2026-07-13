import React from 'react';
import { translations, translateText } from '../utils/i18n';
import { useScrollReveal } from '../utils/useScrollReveal';

const Experience = ({ experience, lang }) => {
  const t = lang === 'tr' ? translations.tr : translations.en;
  
  const [headerRef, isHeaderVisible] = useScrollReveal();

  return (
    <section id="experience" className="experience-section">
      <div className="container">
        <div ref={headerRef} className={`section-header reveal-block ${isHeaderVisible ? 'revealed' : ''}`}>
          <h2 className="section-title font-orbitron text-gradient glitch-hover" data-text={t.expTitle}>{t.expTitle}</h2>
          <p className="section-subtitle">{t.expSubtitle}</p>
        </div>

        <div className="timeline">
          {experience && experience.map((exp, index) => (
            <TimelineItem key={exp.id || index} exp={exp} lang={lang} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TimelineItem = ({ exp, lang, index }) => {
  // Her bir timeline öğesi için bağımsız scroll reveal hook'u
  // Tek sayılar soldan, çift sayılar sağdan animasyonla gelebilir
  const [itemRef, isVisible] = useScrollReveal({ threshold: 0.1 });
  const revealClass = index % 2 === 0 ? 'reveal-left' : 'reveal-right';

  return (
    <div 
      ref={itemRef} 
      className={`timeline-item ${revealClass} ${isVisible ? 'revealed' : ''}`}
    >
      <div className="timeline-dot"></div>
      <div className="timeline-date font-mono">{exp.years}</div>
      <div className="timeline-content glass-card">
        <div className="timeline-header">
          <h3 className="role-title">{translateText(exp.role, lang)}</h3>
          <h4 className="company-name text-gradient-purple">{exp.company}</h4>
        </div>
        <p className="exp-description">{translateText(exp.description, lang)}</p>
      </div>
    </div>
  );
};

export default Experience;
