import React from 'react';
import { translations, translateText } from '../utils/i18n';

const About = ({ about, skills, certificates, education, lang }) => {
  const t = lang === 'tr' ? translations.tr : translations.en;

  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title font-orbitron text-gradient glitch-hover" data-text={t.about}>{t.about}</h2>
          <p className="section-subtitle">{t.aboutSubtitle}</p>
        </div>

        <div className="about-grid">
          {/* Main Info */}
          <div className="about-bio glass-card">
            <h3 className="card-title font-orbitron">{t.summaryTitle}</h3>
            <p className="bio-text">{translateText(about?.summary, lang)}</p>

            <div className="education-box">
              <h4 className="subcard-title font-orbitron text-gradient-purple">
                {lang === 'tr' ? 'Eğitim' : 'Education'}
              </h4>
              {education && (
                <div className="education-detail">
                  <p className="school-name">{translateText(education.school, lang)}</p>
                  <p className="school-dept">{translateText(education.department, lang)}</p>
                  <div className="school-meta">
                    <span className="school-years">{education.years}</span>
                    <span className="school-gpa">
                      {lang === 'tr' ? 'Ortalama' : 'GPA'}: {education.gpa}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="personal-info-grid">
              <div className="info-item">
                <span className="info-label">{lang === 'tr' ? 'E-Posta:' : 'Email:'}</span>
                <span className="info-val">{about?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{lang === 'tr' ? 'Konum:' : 'Location:'}</span>
                <span className="info-val">{lang === 'tr' ? 'Gaziantep, Türkiye' : 'Gaziantep, Turkey'}</span>
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="about-skills glass-card">
            <h3 className="card-title font-orbitron">{t.skillsTitle}</h3>
            
            <div className="skills-categories">
              {skills?.languages && (
                <div className="skill-cat">
                  <h4 className="skill-cat-title font-mono text-gradient">{t.skillsLanguages}</h4>
                  <div className="skill-tags">
                    {skills.languages.map((langVal, idx) => (
                      <span key={idx} className="tech-badge">{langVal}</span>
                    ))}
                  </div>
                </div>
              )}

              {skills?.frameworks && (
                <div className="skill-cat">
                  <h4 className="skill-cat-title font-mono text-gradient">{t.skillsFrameworks}</h4>
                  <div className="skill-tags">
                    {skills.frameworks.map((framework, idx) => (
                      <span key={idx} className="tech-badge">{translateText(framework, lang)}</span>
                    ))}
                  </div>
                </div>
              )}

              {skills?.databases && (
                <div className="skill-cat">
                  <h4 className="skill-cat-title font-mono text-gradient">{t.skillsDatabases}</h4>
                  <div className="skill-tags">
                    {skills.databases.map((db, idx) => (
                      <span key={idx} className="tech-badge">{translateText(db, lang)}</span>
                    ))}
                  </div>
                </div>
              )}

              {skills?.tools && (
                <div className="skill-cat">
                  <h4 className="skill-cat-title font-mono text-gradient">{t.skillsTools}</h4>
                  <div className="skill-tags">
                    {skills.tools.map((tool, idx) => (
                      <span key={idx} className="tech-badge">{translateText(tool, lang)}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
