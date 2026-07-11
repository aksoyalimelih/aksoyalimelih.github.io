import React, { useState } from 'react';
import { translations } from '../utils/i18n';

const Contact = ({ about, addToast, lang }) => {
  const t = lang === 'tr' ? translations.tr : translations.en;

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
    
    // Automatically detect static hosting environment (like github.io)
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
          : true
      );

      if (isSuccess) {
        addToast(
          isStaticDeploy && data.message && (data.message.includes('Activation') || data.message.includes('needs Activation'))
            ? (lang === 'tr' ? 'İlk gönderim için e-postanıza bir aktivasyon bağlantısı gönderildi! Lütfen gelen kutunuzu kontrol edin.' : 'Activation email sent! Please check your inbox.')
            : (lang === 'tr' ? 'Mesajınız başarıyla iletildi!' : 'Your message has been sent!'), 
          'success'
        );
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        addToast(data.message || (lang === 'tr' ? 'Mesaj gönderilemedi.' : 'Failed to send message.'), 'error');
      }
    } catch (error) {
      console.error(error);
      addToast(lang === 'tr' ? 'Mesaj iletilirken bağlantı hatası oluştu.' : 'Connection error occurred while sending message.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title font-orbitron text-gradient glitch-hover" data-text={t.contactTitle}>{t.contactTitle}</h2>
          <p className="section-subtitle">{t.contactSubtitle}</p>
        </div>

        <div className="contact-grid">
          {/* Contact Information */}
          <div className="contact-info-cards">
            {about?.email && (
              <a href={`mailto:${about.email}`} className="contact-info-card glass-card">
                <div className="contact-card-icon font-orbitron">@</div>
                <div className="contact-card-details">
                  <span className="contact-card-title">{lang === 'tr' ? 'E-posta' : 'Email'}</span>
                  <span className="contact-card-value">{about.email}</span>
                </div>
              </a>
            )}

            {about?.linkedin && (
              <a 
                href={`https://${about.linkedin}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-info-card glass-card"
              >
                <div className="contact-card-icon font-orbitron">in</div>
                <div className="contact-card-details">
                  <span className="contact-card-title">LinkedIn</span>
                  <span className="contact-card-value">
                    {about.linkedin.replace('linkedin.com/in/', '/in/').replace(/\/$/, '')}
                  </span>
                </div>
              </a>
            )}

            {about?.github && (
              <a 
                href={`https://${about.github}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-info-card glass-card"
              >
                <div className="contact-card-icon font-orbitron">git</div>
                <div className="contact-card-details">
                  <span className="contact-card-title">GitHub</span>
                  <span className="contact-card-value">
                    {'@' + about.github.replace('github.com/', '').replace(/\/$/, '')}
                  </span>
                </div>
              </a>
            )}
          </div>

          {/* Contact Form */}
          <div className="contact-form-container glass-card">
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

export default Contact;
