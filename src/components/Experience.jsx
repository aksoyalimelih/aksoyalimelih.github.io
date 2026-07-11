import React from 'react';
import { translations, translateText } from '../utils/i18n';

const Experience = ({ experience, lang }) => {
  const t = lang === 'tr' ? translations.tr : translations.en;

  return (
    <section id="experience" className="experience-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title font-orbitron text-gradient glitch-hover" data-text={t.expTitle}>{t.expTitle}</h2>
          <p className="section-subtitle">{t.expSubtitle}</p>
        </div>

        <div className="timeline">
          {experience && experience.map((exp, index) => (
            <div key={exp.id || index} className="timeline-item">
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
