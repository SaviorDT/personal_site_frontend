import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SocialIcons from '@/Components/SocialIcons/SocialIcons';
import authService from '@/services/authService';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 這裡之後實現具體的登入/註冊邏輯
    console.log(mode, formData);
  };

  const socialProviders = [
    { name: 'google', icon: SocialIcons.google, color: '#4285f4' },
    { name: 'facebook', icon: SocialIcons.facebook, color: '#1877f2' },
    { name: 'github', icon: SocialIcons.github, color: '#333' },
    { name: 'line', icon: SocialIcons.line, color: '#00c300' }
  ];

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="auth-header">
          <h2 className="auth-title">
            {mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login' ? t('auth.login.subtitle') : t('auth.register.subtitle')}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">{t('auth.fields.nickname')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('auth.placeholders.nickname')}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">{t('auth.fields.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('auth.placeholders.email')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.fields.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t('auth.placeholders.password')}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">{t('auth.fields.confirmPassword')}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder={t('auth.placeholders.confirmPassword')}
                required
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn">
            {mode === 'login' ? t('auth.login.submit') : t('auth.register.submit')}
          </button>
        </form>

        <div className="auth-divider">
          <span>{t('auth.or')}</span>
        </div>

        <div className="social-auth">
          {socialProviders.map((provider) => (
            <button
              key={provider.name}
              className="social-btn"
              style={{ '--provider-color': provider.color }}
              onClick={() => {
                // 這裡之後實現社交登入邏輯
                console.log(`${provider.name} auth`);
              }}
            >
              <span className="social-icon">
                <provider.icon />
              </span>
              <span className="social-text">
                {t(`auth.social.${provider.name}`)}
              </span>
            </button>
          ))}
        </div>

        <div className="auth-switch">
          <p>
            {mode === 'login' 
              ? t('auth.login.switchText') 
              : t('auth.register.switchText')
            }
            <button
              type="button"
              className="switch-btn"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' 
                ? t('auth.login.switchAction') 
                : t('auth.register.switchAction')
              }
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
