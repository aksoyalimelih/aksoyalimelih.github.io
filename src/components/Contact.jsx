import React, { useState } from 'react';
import { translations } from '../utils/i18n';
import { useScrollReveal } from '../utils/useScrollReveal';

const Contact = ({ about, addToast, lang }) => {
  const t = lang === 'tr' ? translations.tr : translations.en;

  const [headerRef, isHeaderVisible] = useScrollReveal();
  const [formRef, isFormVisible] = useScrollReveal();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast(lang === 'tr' ? 'Lütfen zorunlu alanları doldurun.' : 'Please fill in required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    const isStaticDeploy = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const submitUrl = isStaticDeploy 
      ? 'https://formsubmit.co/ajax/aksoyalimelih@gmail.com' 
      : '/api/contact';
      
    const payload = isStaticDeploy 
      ? {
          _template: 'table',
          _subject: `Portföy İletişim Mesajı: ${formData.subject || 'Konu Belirtilmedi'}`,
          "Gönderen": formData.name,
          "E-posta": formData.email,
          "Konu": formData.subject || 'Belirtilmedi',
          "Mesaj": formData.message
        }
      : formData;

    try {
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      const isSuccess = response.ok && (
        isStaticDeploy 
          ? (data.success === 'true' || data.success === true)
          : response.status === 200
      );

      if (!isSuccess) {
        throw new Error(lang === 'tr' ? 'E-posta servisi yanıt vermedi.' : 'Email service did not respond.');
      }

      addToast(
        lang === 'tr' 
          ? 'Mesajınız başarıyla iletildi!' 
          : 'Your message has been sent successfully!', 
        'success'
      );
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      addToast(
        lang === 'tr' 
          ? 'Mesaj gönderilirken hata oluştu. Lütfen tekrar deneyin.' 
          : 'Error sending message. Please try again.', 
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div ref={headerRef} className={`section-header reveal-block ${isHeaderVisible ? 'revealed' : ''}`}>
          <h2 className="section-title font-orbitron text-gradient glitch-hover" data-text={t.contactTitle}>{t.contactTitle}</h2>
          <p className="section-subtitle">{t.contactSubtitle}</p>
        </div>

        <div className="contact-grid">
          {/* Contact Details / Info Cards */}
          <div className="contact-info">
            {about?.email && (
              <ContactInfoCard 
                href={`mailto:${about.email}`}
                label={lang === 'tr' ? 'E-Posta' : 'Email'}
                value={about.email}
                icon="✉"
                index={0}
              />
            )}

            {about?.linkedin && (
              <ContactInfoCard 
                href={`https://${about.linkedin}`}
                label="LinkedIn"
                value={about.linkedin.replace('linkedin.com/in/', '/in/').replace(/\/$/, '')}
                icon="in"
                index={1}
              />
            )}

            {about?.github && (
              <ContactInfoCard 
                href={`https://${about.github}`}
                label="GitHub"
                value={'@' + about.github.replace('github.com/', '').replace(/\/$/, '')}
                icon="git"
                index={2}
              />
            )}
          </div>

          {/* Contact Form */}
          <div 
            ref={formRef} 
            className={`contact-form-container glass-card reveal-right ${isFormVisible ? 'revealed' : ''}`}
          >
            <h3 className="card-title font-orbitron mb-4">{t.sendMsg}</h3>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="contact-name">{t.nameLabel}</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t.namePlaceholder}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">{t.emailLabel}</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.emailPlaceholder}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">{t.subjectLabel}</label>
                <input
                  type="text"
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t.subjectPlaceholder}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">{t.messageLabel}</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t.messagePlaceholder}
                  className="form-control"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full mt-2" 
                disabled={isSubmitting}
              >
                {isSubmitting ? t.sendingBtn : t.sendBtn}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactInfoCard = ({ href, label, value, icon, index }) => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });
  return (
    <a 
      ref={ref}
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`contact-info-card glass-card reveal-left ${isVisible ? 'revealed' : ''}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="contact-card-icon font-orbitron">{icon}</div>
      <div className="contact-card-details">
        <span className="contact-card-title">{label}</span>
        <span className="contact-card-value">{value}</span>
      </div>
    </a>
  );
};

export default Contact;
