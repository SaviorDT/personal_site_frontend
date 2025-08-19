import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SocialIcons from '@/Components/SocialIcons/SocialIcons';
import ModalContainer from '@/Components/ModalContainer/ModalContainer';
import authService from '@/services/authService';
import './AuthModal.css';
import { ROUTES } from '@/router/index';
import apiConfig from '@/config/api';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  // 重置狀態當 modal 打開/關閉或模式切換時
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setLoading(false);
      setToast({ show: false, message: '', type: 'success' });
    }
  }, [isOpen, initialMode]);

  // 當模式切換時清除錯誤
  useEffect(() => {
    setError('');
  }, [mode]);

  // Toast 自動隱藏
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // 清除錯誤訊息當用戶開始輸入
    if (error) {
      setError('');
    }
  };

  const showSuccessToast = (message) => {
    setToast({
      show: true,
      message,
      type: 'success'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;

      if (mode === 'login') {
        result = await authService.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await authService.register({
          nickname: formData.name, // 修正：使用 nickname 而不是 name
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
      }

      if (result.success) {
        // 登入/註冊成功，關閉 modal
        onClose();
        // 顯示成功提示
        showSuccessToast(result.message || t('auth.success.default'));
        // 清空表單
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          name: ''
        });
        // 注意：不需要手動更新用戶狀態，AuthService 會觸發事件自動更新 AuthContext
      } else {
        // 顯示錯誤訊息，不關閉 modal
        setError(result.error || t('auth.error.default'));
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(t('auth.error.network'));
    } finally {
      setLoading(false);
    }
  };

  const socialProviders = [
    { name: 'google', icon: SocialIcons.google, color: '#4285f4' },
    // { name: 'facebook', icon: SocialIcons.facebook, color: '#1877f2' },
    { name: 'github', icon: SocialIcons.github, color: '#333' },
    // { name: 'line', icon: SocialIcons.line, color: '#00c300' }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Toast 通知 */}
      {toast.show && (
        <div className={`auth-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      <ModalContainer
        isOpen={isOpen}
        onClose={onClose}
        size="medium"
        className="auth-modal"
        closeOnOverlayClick={true}
        showCloseButton={true}
      >
        <div className="auth-header">
          <h2 className="auth-title">
            {mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login' ? t('auth.login.subtitle') : t('auth.register.subtitle')}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error-message">
              ❌ {error}
            </div>
          )}

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

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              position: 'relative'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="auth-spinner"></span>
                {mode === 'login' ? t('auth.login.submitting') : t('auth.register.submitting')}
              </span>
            ) : (
              mode === 'login' ? t('auth.login.submit') : t('auth.register.submit')
            )}
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
                const loginApiEndpoint =
                  provider.name === 'github' ? apiConfig.ENDPOINTS.AUTH.GITHUB_OAUTH
                    : apiConfig.ENDPOINTS.AUTH.GOOGLE_OAUTH;

                if (provider.name === 'github' || provider.name === 'google') {
                  // 帶上 redirect_uri 讓後端完成後導回本專案的回呼頁，該頁負責寫入 localStorage
                  const redirectUri = `${window.location.origin}${ROUTES.OAUTH_CALLBACK}`;
                  const oauthUrl = `${apiConfig.API_BASE_URL}${loginApiEndpoint}?redirect=${encodeURIComponent(redirectUri)}`;
                  const w = 600;
                  const h = 700;
                  const left = Math.max(0, window.screen.width / 2 - w / 2);
                  const top = Math.max(0, window.screen.height / 2 - h / 2);
                  const popup = window.open(
                    oauthUrl,
                    '_blank',
                    `noopener,width=${w},height=${h},left=${left},top=${top}`
                  );
                } else {
                  setError(t('auth.error.social_not_implemented'));
                  console.log(`${provider.name} auth not implemented`);
                }
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
      </ModalContainer>
    </>
  );
};

export default AuthModal;
