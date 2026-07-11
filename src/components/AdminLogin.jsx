import React, { useState } from 'react';
import bcrypt from 'bcryptjs';

// Statik ortam (GitHub Pages) için bcrypt hash — server yok, client-side doğrulama
// Bu hash'i değiştirmek için: node -e "const b=require('bcryptjs'); console.log(b.hashSync('YENİŞİFRE',10));"
const STATIC_PASSWORD_HASH = '$2b$10$jwFxGkNZnts9GadkLmmCduFAP/IRoL/vntV7xyFr5JkS5T719kwu.';

const AdminLogin = ({ onLogin, onCancel, addToast }) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStaticDeploy = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      addToast('Şifre girilmesi zorunludur.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isStaticDeploy) {
        // GitHub Pages / statik ortam: client-side bcrypt doğrulama
        const isMatch = bcrypt.compareSync(password, STATIC_PASSWORD_HASH);
        if (!isMatch) {
          throw new Error('Şifre hatalı.');
        }
        // Sahte JWT benzeri token oluştur (sadece UI erişimi için)
        const fakeToken = btoa(JSON.stringify({ admin: true, ts: Date.now(), env: 'static' }));
        addToast('Giriş başarılı! (Önizleme modu)', 'success');
        onLogin(fakeToken);
      } else {
        // Localhost: Express API üzerinden doğrula
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Giriş başarısız.');
        }

        addToast('Giriş başarılı!', 'success');
        onLogin(data.token);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-card glass-card">
        <div className="login-header">
          <div className="lock-icon">🔒</div>
          <h2 className="login-title font-orbitron text-gradient">Yönetici Girişi</h2>
          <p className="login-subtitle">
            {isStaticDeploy
              ? 'Portföyü görüntülemek için oturum açın'
              : 'Portföy bilgilerini düzenlemek için oturum açın'}
          </p>
          {isStaticDeploy && (
            <p className="font-mono text-center mt-2" style={{ fontSize: '0.7rem', color: 'var(--accent)', opacity: 0.8 }}>
              ⚠ Statik mod — değişiklikler kaydedilmez
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="admin-password">Yönetici Şifresi</label>
            <input
              type="password"
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-control text-center"
              autoFocus
              required
            />
          </div>

          <div className="login-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary w-full"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Doğrulanıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
