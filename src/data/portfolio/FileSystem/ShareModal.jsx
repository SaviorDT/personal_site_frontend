import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalContainer from '@/Components/ModalContainer/ModalContainer';
import urlShortenerService from '../UrlShortener/urlShortenerService';
import { createShareCode, getShareFileUrl } from './fileService';
import './ShareModal.css';

// 期限選項：value 同時餵給兩個 API——換算成秒數給 share_code 的 expires_in，
// 原字串直接給 reurl 的 expires_in（reurl 只接受這組固定列舉值）。
const SHARE_DURATIONS = [
    { value: '1h', seconds: 60 * 60, labelKey: 'fileSystem.share.duration.1h', fallback: '1 小時' },
    { value: '12h', seconds: 12 * 60 * 60, labelKey: 'fileSystem.share.duration.12h', fallback: '12 小時' },
    { value: '1d', seconds: 24 * 60 * 60, labelKey: 'fileSystem.share.duration.1d', fallback: '1 天' },
    { value: '7d', seconds: 7 * 24 * 60 * 60, labelKey: 'fileSystem.share.duration.7d', fallback: '7 天' },
    { value: '30d', seconds: 30 * 24 * 60 * 60, labelKey: 'fileSystem.share.duration.30d', fallback: '30 天' },
    { value: '365d', seconds: 365 * 24 * 60 * 60, labelKey: 'fileSystem.share.duration.365d', fallback: '365 天' },
];
const DEFAULT_DURATION = '7d';

// 組出這個站慣用的短網址格式（跟 UrlShortener.jsx 的 handleCopy 一致）：
// frontend 網域根路徑 + key，實際跳轉由 catch-all 路由的 UrlRedirect 頁面處理。
const buildShortUrl = (key) => {
    const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
    return `${baseUrl}/${key}`;
};

// 分享單一檔案的 Modal：詢問期限與是否縮短網址，送出後顯示可複製的連結。
// entry 為 { type: 'file', name }；path 為所在資料夾的路徑陣列。
// 目前只處理檔案分享，資料夾分享邏輯留待之後。
const ShareModal = ({ entry, path, isAuthenticated, onClose }) => {
    const { t } = useTranslation();
    const [duration, setDuration] = useState(DEFAULT_DURATION);
    const [shorten, setShorten] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null); // { url, note? }
    const [copyMessage, setCopyMessage] = useState('');

    const onSubmit = async () => {
        setLoading(true);
        setError('');
        setResult(null);
        setCopyMessage('');
        try {
            const durationOpt = SHARE_DURATIONS.find((d) => d.value === duration) || SHARE_DURATIONS[3];
            const share = await createShareCode(path, entry.name, durationOpt.seconds);
            const backendUrl = getShareFileUrl(share.code);

            if (!shorten) {
                setResult({ url: backendUrl });
                return;
            }

            try {
                const reurl = await urlShortenerService.create({ target_url: backendUrl, expires_in: duration });
                setResult({ url: buildShortUrl(reurl.key) });
            } catch (reurlError) {
                // Q3 決議：縮短失敗時靜默 fallback，改顯示已經拿到的後端連結，並附上一行提示
                setResult({ url: backendUrl, note: t('fileSystem.share.shortenFailedFallback', '縮短網址失敗，已改用原始連結') });
            }
        } catch (e) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
        }
    };

    const onCopy = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result.url);
            setCopyMessage(t('fileSystem.share.copySuccess', '已複製到剪貼簿！'));
        } catch (e) {
            setCopyMessage(t('fileSystem.share.copyFailed', '複製失敗，請手動複製'));
        }
    };

    return (
        <ModalContainer
            isOpen={true}
            onClose={onClose}
            size="medium"
            className="fs-share-modal"
            closeOnOverlayClick={!loading}
            showCloseButton={true}
        >
            <div className="modal-header">
                <h3 className="modal-title">{t('fileSystem.share.title', '分享檔案')}</h3>
            </div>

            <div className="modal-content fs-share-content">
                <div className="fs-share-filename" title={entry.name}>{entry.name}</div>

                <label className="fs-share-field">
                    <span>{t('fileSystem.share.expiresLabel', '期限')}</span>
                    <select
                        className="fs-input"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        disabled={loading}
                    >
                        {SHARE_DURATIONS.map((d) => (
                            <option key={d.value} value={d.value}>{t(d.labelKey, d.fallback)}</option>
                        ))}
                    </select>
                </label>

                <label className={`fs-share-checkbox${!isAuthenticated ? ' disabled' : ''}`}>
                    <input
                        type="checkbox"
                        checked={shorten}
                        onChange={(e) => setShorten(e.target.checked)}
                        disabled={loading || !isAuthenticated}
                    />
                    <span>{t('fileSystem.share.shortenLabel', '縮短網址')}</span>
                </label>
                {!isAuthenticated && (
                    <div className="fs-share-hint">{t('fileSystem.share.loginRequired', '登入後才能縮短網址')}</div>
                )}

                {error && <div className="fs-error">{error}</div>}

                <div className="fs-share-actions">
                    <button className="fs-btn primary" onClick={onSubmit} disabled={loading}>
                        {loading ? t('fileSystem.share.generating', '產生中…') : t('fileSystem.share.generate', '產生連結')}
                    </button>
                </div>

                {result && (
                    <div className="fs-share-result">
                        {result.note && <div className="fs-share-note">{result.note}</div>}
                        <div className="fs-share-link-row">
                            <input
                                className="fs-input fs-share-link-input"
                                type="text"
                                readOnly
                                value={result.url}
                                onFocus={(e) => e.target.select()}
                            />
                            <button className="fs-btn" onClick={onCopy}>{t('fileSystem.share.copy', '複製')}</button>
                        </div>
                        {copyMessage && <div className="fs-share-copy-message">{copyMessage}</div>}
                    </div>
                )}
            </div>
        </ModalContainer>
    );
};

export default ShareModal;
