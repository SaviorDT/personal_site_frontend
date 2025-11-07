import React, { useState } from 'react';
import './PostEditor.css';

const PostEditor = ({ onSubmit, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        content: initialData?.content || '',
        tags: initialData?.tags?.join(', ') || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 驗證
        if (!formData.title.trim()) {
            setError('請輸入文章標題');
            return;
        }
        if (!formData.content.trim()) {
            setError('請輸入文章內容');
            return;
        }

        setLoading(true);
        try {
            // 處理標籤: 分割並清理
            const tags = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const postData = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                tags: tags.length > 0 ? tags : undefined,
            };

            await onSubmit(postData);

            // 成功後清空表單
            setFormData({
                title: '',
                content: '',
                tags: '',
            });
        } catch (err) {
            setError(err.message || '發表文章失敗');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-editor">
            <div className="post-editor-header">
                <h2>{initialData ? '編輯文章' : '✍️ 新增文章'}</h2>
            </div>

            {error && (
                <div className="post-editor-error">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="post-editor-form">
                <div className="form-group">
                    <label htmlFor="title">文章標題 *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="輸入文章標題..."
                        disabled={loading}
                        maxLength={200}
                    />
                    <span className="char-count">{formData.title.length}/200</span>
                </div>

                <div className="form-group">
                    <label htmlFor="content">文章內容 *</label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="分享你的想法..."
                        rows={12}
                        disabled={loading}
                    />
                    <span className="char-count">{formData.content.length} 字元</span>
                </div>

                <div className="form-group">
                    <label htmlFor="tags">標籤 (選填)</label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="例如: React, 前端開發, 教學 (用逗號分隔)"
                        disabled={loading}
                    />
                    <span className="form-hint">💡 使用逗號分隔多個標籤</span>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        取消
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? '發表中...' : '✨ 發表文章'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostEditor;
