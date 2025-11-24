import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '@/services/apiClient';
import apiConfig from '@/config/api';
import './UrlRedirect.css';

const UrlRedirect = () => {
    const { t } = useTranslation();
    const { '*': catchAllPath } = useParams();
    const location = useLocation();
    const [status, setStatus] = useState('checking'); // 'checking', 'redirecting', 'notFound'
    const [error, setError] = useState('');

    useEffect(() => {
        const checkAndRedirect = async () => {
            // 獲取完整路徑（移除開頭的斜線）
            const path = catchAllPath || location.pathname.slice(1);

            if (!path) {
                setStatus('notFound');
                return;
            }

            try {
                // 使用原生 fetch API 來檢查短網址，因為它支持 redirect: 'manual'
                // 這樣可以攔截 302 響應而不自動跟隨重定向
                const apiBaseUrl = apiConfig.API_BASE_URL || '';
                const apiUrl = `${apiBaseUrl}${apiConfig.ENDPOINTS.URL_SHORTENER.REDIRECT.replace('{path}', path)}`;

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    redirect: 'manual', // 不自動跟隨重定向
                    credentials: 'include', // 包含 cookies
                    headers: {
                        'Accept': 'application/json',
                    }
                });

                console.log("後端響應狀態:", response.status, response.type);

                // fetch 的 redirect: 'manual' 會將重定向響應的 type 設為 'opaqueredirect'
                // 或者狀態碼為 0
                if (response.type === 'opaqueredirect' || response.status === 0) {
                    // 這是一個重定向響應，但我們無法直接訪問 Location header
                    // 在這種情況下，我們需要讓瀏覽器自然跟隨重定向
                    setStatus('redirecting');
                    window.location.href = apiUrl;
                    return;
                }

                // 如果響應狀態是 302 或 301（某些情況下可能可以訪問）
                if (response.status === 302 || response.status === 301) {
                    const targetUrl = response.headers.get('Location') || response.headers.get('location');

                    if (targetUrl) {
                        setStatus('redirecting');
                        window.location.href = targetUrl;
                    } else {
                        // 有重定向但無法獲取目標，讓瀏覽器處理
                        setStatus('redirecting');
                        window.location.href = apiUrl;
                    }
                    return;
                }

                // 如果是 404 或其他錯誤狀態
                if (response.status === 404 || response.status >= 400) {
                    setStatus('notFound');
                    return;
                }

                // 其他情況（200 等）- 可能不應該發生，但以防萬一
                setStatus('notFound');

            } catch (err) {
                console.error('短網址檢查失敗:', err);

                // 任何錯誤都顯示找不到頁面
                setStatus('notFound');
                setError(t('redirect.error.network'));
            }
        };

        checkAndRedirect();
    }, [catchAllPath, location.pathname, t]);

    if (status === 'checking') {
        return (
            <div className="url-redirect">
                <div className="url-redirect__container">
                    <div className="url-redirect__spinner"></div>
                    <h2 className="url-redirect__title">{t('redirect.checking.title')}</h2>
                    <p className="url-redirect__message">{t('redirect.checking.message')}</p>
                </div>
            </div>
        );
    }

    if (status === 'redirecting') {
        return (
            <div className="url-redirect">
                <div className="url-redirect__container">
                    <div className="url-redirect__icon url-redirect__icon--success">🔗</div>
                    <h2 className="url-redirect__title">{t('redirect.redirecting.title')}</h2>
                    <p className="url-redirect__message">{t('redirect.redirecting.message')}</p>
                </div>
            </div>
        );
    }

    // 404 - 頁面未找到
    return (
        <div className="url-redirect">
            <div className="url-redirect__container url-redirect__container--error">
                <div className="url-redirect__icon url-redirect__icon--error">404</div>
                <h2 className="url-redirect__title">{t('redirect.notFound.title')}</h2>
                <p className="url-redirect__message">
                    {error || t('redirect.notFound.message')}
                </p>
                <div className="url-redirect__actions">
                    <a href="/" className="url-redirect__button">
                        {t('redirect.notFound.backHome')}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default UrlRedirect;
