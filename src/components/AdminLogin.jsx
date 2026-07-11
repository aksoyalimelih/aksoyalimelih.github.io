import React, { useState } from 'react';

const AdminLogin = ({ onLogin, onCancel, addToast }) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      addToast('Şifre girilmesi zorunludur.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
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
          <p className="login-subtitle">Portföy bilgilerini düzenlemek için oturum açın</p>
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
        
        <p className="password-tip font-mono">Varsayılan şifre: admin123</p>
      </div>
    </div>
  );
};

export default AdminLogin;
