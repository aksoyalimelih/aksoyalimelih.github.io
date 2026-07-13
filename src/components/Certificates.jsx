import React from 'react';
import { translations, translateText } from '../utils/i18n';
import { useScrollReveal } from '../utils/useScrollReveal';

const Certificates = ({ certificates, lang }) => {
  const t = lang === 'tr' ? translations.tr : translations.en;
  const [ref, isVisible] = useScrollReveal();

  return (
    <section id="certificates" className="certificates-section">
      <div className="container" ref={ref}>
        <div className={`section-header reveal-block ${isVisible ? 'revealed' : ''}`}>
          <h2 className="section-title font-orbitron text-gradient glitch-hover" data-text={t.certificates}>
            {t.certificates}
          </h2>
          <p className="section-subtitle">
            {lang === 'tr' ? 'Tamamlanan Eğitimler & Yetkinlik Belgeleri' : 'Completed Trainings & Competency Certificates'}
          </p>
        </div>

        <div className="certificates-grid">
          {certificates && certificates.map((cert, idx) => (
            <CertCard key={cert.id} cert={cert} lang={lang} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

const CertCard = ({ cert, lang, idx }) => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`cert-card glass-card reveal-block ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${idx * 80}ms` }}
    >
      <div className="cert-icon">🏆</div>
      <div className="cert-info">
        <h4 className="cert-title">{translateText(cert.title, lang)}</h4>
        <p className="cert-issuer">{translateText(cert.issuer, lang)}</p>
      </div>
      <div className="cert-year font-mono">{cert.year}</div>
    </div>
  );
};

export default Certificates;
