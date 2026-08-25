import React, { useState, useEffect } from 'react';
import urlShortenerService from './urlShortenerService';
import './UrlShortener.css';

const EXPIRE_OPTIONS = [
    { value: '', label: '默認' },
    { value: '1h', label: '1 小時' },
    { value: '12h', label: '12 小時' },
    { value: '1d', label: '1 天' },
    { value: '7d', label: '7 天' },
    { value: '30d', label: '30 天' },
    { value: '365d', label: '1 年' },
];

const UrlShortener = () => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        key: '',
        target_url: '',
        expires_in: '',
    });

    // Modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUrl, setEditingUrl] = useState(null);
    const [editFormData, setEditFormData] = useState({
        key: '',
        target_url: '',
        expires_in: '7d',
    });

    // 載入所有短網址
    useEffect(() => {
        loadUrls();
    }, []);

    const loadUrls = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await urlShortenerService.list();
            setUrls(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.response?.data?.error || '載入短網址列表失敗');
            setUrls([]);
        } finally {
            setLoading(false);
        }
    };

    // 創建短網址
    const handleCreate = async (e) => {
        e.preventDefault();

        if (!formData.target_url.trim()) {
            setError('目標網址為必填');
            return;
        }

        try {
            setError('');
            setSuccess('');
            await urlShortenerService.create(formData);
            setSuccess('短網址創建成功！');
            setFormData({ key: '', target_url: '', expires_in: '' });
            loadUrls();

            // 3 秒後清除成功訊息
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err?.response?.data?.error || '創建短網址失敗');
        }
    };

    // 打開編輯 Modal
    const handleOpenEdit = (url) => {
        setEditingUrl(url);
        setEditFormData({
            key: url.key || '',
            target_url: url.target_url || '',
            expires_in: url.expires_in || '',
        });
        setShowEditModal(true);
    };

    // 更新短網址
    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editingUrl) return;

        try {
            setError('');
            setSuccess('');
            await urlShortenerService.update(editingUrl.id, editFormData);
            setSuccess('短網址更新成功！');
            setShowEditModal(false);
            setEditingUrl(null);
            loadUrls();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err?.response?.data?.error || '更新短網址失敗');
        }
    };

    // 刪除短網址
    const handleDelete = async (id) => {
        if (!window.confirm('確定要刪除這個短網址嗎？')) {
            return;
        }

        try {
            setError('');
            setSuccess('');
            await urlShortenerService.delete(id);
            setSuccess('短網址刪除成功！');
            loadUrls();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err?.response?.data?.error || '刪除短網址失敗');
        }
    };

    // 複製到剪貼簿
    const handleCopy = async (shortKey) => {
        try {
            // 從環境變數獲取基礎 URL，並組合完整的短網址
            const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
            const fullUrl = `${baseUrl}/${shortKey}`;
            await navigator.clipboard.writeText(fullUrl);
            setSuccess('已複製到剪貼簿！');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('複製失敗');
        }
    };

    // 計算統計數據
    const stats = {
        total: urls.length,
        active: urls.filter(url => !url.expired).length,
        expired: urls.filter(url => url.expired).length,
    };

    return (
        <div className="url-shortener">
            <header className="url-shortener__header">
                <h1 className="url-shortener__title">🔗 短網址管理系統</h1>
                <p className="url-shortener__subtitle">
                    輕鬆管理您的短網址，支援自訂 key 與過期時間設定
                </p>
            </header>

            {/* 統計卡片 */}
            <div className="url-shortener__stats">
                <div className="url-shortener__stat-card">
                    <div className="url-shortener__stat-value">{stats.total}</div>
                    <div className="url-shortener__stat-label">總計</div>
                </div>
                <div className="url-shortener__stat-card">
                    <div className="url-shortener__stat-value">{stats.active}</div>
                    <div className="url-shortener__stat-label">有效</div>
                </div>
                <div className="url-shortener__stat-card">
                    <div className="url-shortener__stat-value">{stats.expired}</div>
                    <div className="url-shortener__stat-label">已過期</div>
                </div>
            </div>

            {/* 錯誤/成功訊息 */}
            {error && (
                <div className="url-shortener__alert url-shortener__alert--error">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="url-shortener__alert url-shortener__alert--success">
                    <span>✓</span>
                    <span>{success}</span>
                </div>
            )}

            {/* 創建表單 */}
            <div className="url-shortener__panel">
                <div className="url-shortener__panel-header">
                    <h2 className="url-shortener__panel-title">創建新短網址</h2>
                </div>

                <form className="url-shortener__form" onSubmit={handleCreate}>
                    <div className="url-shortener__form-grid">
                        <div className="url-shortener__form-group url-shortener__form-group--full">
                            <label className="url-shortener__label url-shortener__label--required">
                                目標網址
                            </label>
                            <input
                                type="url"
                                className="url-shortener__input"
                                placeholder="https://example.com/your-long-url"
                                value={formData.target_url}
                                onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                                required
                            />
                            <span className="url-shortener__helper-text">
                                請輸入完整的網址（包含 http:// 或 https://）
                            </span>
                        </div>

                        <div className="url-shortener__form-group">
                            <label className="url-shortener__label">
                                自訂短網址 Key
                            </label>
                            <input
                                type="text"
                                className="url-shortener__input"
                                placeholder="my-custom-key"
                                value={formData.key}
                                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                            />
                            <span className="url-shortener__helper-text">
                                留空則由系統自動生成
                            </span>
                        </div>

                        <div className="url-shortener__form-group">
                            <label className="url-shortener__label">
                                過期時間
                            </label>
                            <select
                                className="url-shortener__select"
                                value={formData.expires_in}
                                onChange={(e) => setFormData({ ...formData, expires_in: e.target.value })}
                            >
                                {EXPIRE_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <span className="url-shortener__helper-text">
                                選擇短網址的有效期限
                            </span>
                        </div>
                    </div>

                    <div className="url-shortener__form-actions">
                        <button
                            type="button"
                            className="url-shortener__btn url-shortener__btn--secondary"
                            onClick={() => setFormData({ key: '', target_url: '', expires_in: '' })}
                        >
                            清除
                        </button>
                        <button
                            type="submit"
                            className="url-shortener__btn url-shortener__btn--primary"
                        >
                            <span>➕</span>
                            <span>創建短網址</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* 短網址列表 */}
            <div className="url-shortener__panel">
                <div className="url-shortener__panel-header">
                    <h2 className="url-shortener__panel-title">短網址列表</h2>
                    <button
                        className="url-shortener__btn url-shortener__btn--secondary url-shortener__btn--small"
                        onClick={loadUrls}
                        disabled={loading}
                    >
                        🔄 重新整理
                    </button>
                </div>

                {loading ? (
                    <div className="url-shortener__loading">
                        <div className="url-shortener__loading-spinner"></div>
                        <p>載入中...</p>
                    </div>
                ) : urls.length === 0 ? (
                    <div className="url-shortener__empty">
                        <div className="url-shortener__empty-icon">📭</div>
                        <p className="url-shortener__empty-text">尚未建立任何短網址</p>
                        <p className="url-shortener__helper-text">使用上方表單來創建您的第一個短網址</p>
                    </div>
                ) : (
                    <div className="url-shortener__table-wrapper">
                        <table className="url-shortener__table">
                            <thead>
                                <tr>
                                    <th>短網址</th>
                                    <th>目標網址</th>
                                    <th>過期時間</th>
                                    <th>狀態</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {urls.map((url) => (
                                    <tr key={url.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span className="url-shortener__short-url">{url.key}</span>
                                                <button
                                                    className="url-shortener__copy-btn"
                                                    onClick={() => handleCopy(url.short_url || url.key)}
                                                    title="複製"
                                                >
                                                    📋
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <a
                                                href={url.target_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="url-shortener__target-url"
                                                title={url.target_url}
                                            >
                                                {url.target_url}
                                            </a>
                                        </td>
                                        <td>
                                            {url.expires_at
                                                ? new Date(url.expires_at).toLocaleString('zh-TW')
                                                : '永久'}
                                        </td>
                                        <td>
                                            <span
                                                className={`url-shortener__badge ${url.expired
                                                    ? 'url-shortener__badge--expired'
                                                    : 'url-shortener__badge--active'
                                                    }`}
                                            >
                                                {url.expired ? '已過期' : '有效'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="url-shortener__table-actions">
                                                <button
                                                    className="url-shortener__btn url-shortener__btn--secondary url-shortener__btn--small"
                                                    onClick={() => handleOpenEdit(url)}
                                                >
                                                    ✏️ 編輯
                                                </button>
                                                <button
                                                    className="url-shortener__btn url-shortener__btn--danger url-shortener__btn--small"
                                                    onClick={() => handleDelete(url.id)}
                                                >
                                                    🗑️ 刪除
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 編輯 Modal */}
            {showEditModal && editingUrl && (
                <div className="url-shortener__modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="url-shortener__modal" onClick={(e) => e.stopPropagation()}>
                        <div className="url-shortener__modal-header">
                            <h3 className="url-shortener__modal-title">編輯短網址</h3>
                            <button
                                className="url-shortener__modal-close"
                                onClick={() => setShowEditModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form className="url-shortener__form" onSubmit={handleUpdate}>
                            <div className="url-shortener__form-group">
                                <label className="url-shortener__label">
                                    短網址 Key
                                </label>
                                <input
                                    type="text"
                                    className="url-shortener__input"
                                    placeholder="my-custom-key"
                                    value={editFormData.key}
                                    onChange={(e) => setEditFormData({ ...editFormData, key: e.target.value })}
                                />
                                <span className="url-shortener__helper-text">
                                    留空則保持原值
                                </span>
                            </div>

                            <div className="url-shortener__form-group">
                                <label className="url-shortener__label">
                                    目標網址
                                </label>
                                <input
                                    type="url"
                                    className="url-shortener__input"
                                    placeholder="https://example.com/your-long-url"
                                    value={editFormData.target_url}
                                    onChange={(e) => setEditFormData({ ...editFormData, target_url: e.target.value })}
                                />
                                <span className="url-shortener__helper-text">
                                    留空則保持原值
                                </span>
                            </div>

                            <div className="url-shortener__form-group">
                                <label className="url-shortener__label">
                                    過期時間
                                </label>
                                <select
                                    className="url-shortener__select"
                                    value={editFormData.expires_in}
                                    onChange={(e) => setEditFormData({ ...editFormData, expires_in: e.target.value })}
                                >
                                    {EXPIRE_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="url-shortener__form-actions">
                                <button
                                    type="button"
                                    className="url-shortener__btn url-shortener__btn--secondary"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="url-shortener__btn url-shortener__btn--primary"
                                >
                                    💾 儲存變更
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UrlShortener;
