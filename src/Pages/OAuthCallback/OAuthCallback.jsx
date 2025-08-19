import React, { useEffect, useState } from 'react';

// OAuth 回呼頁：從查詢參數拿到使用者資訊，存入 localStorage，並嘗試自動關閉分頁
const OAuthCallback = () => {
    const [msg, setMsg] = useState('正在處理 OAuth 登入...');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        let user = null;

        // 支援 user=base64(JSON)
        const encoded = params.get('user');
        if (encoded) {
            try {
                const json = atob(encoded);
                user = JSON.parse(json);
            } catch (e) {
                console.error('解析使用者資訊失敗 (base64):', e);
            }
        }

        // 或支援單獨參數（user_id/id、nickname/name/username、role）
        if (!user) {
            const id = params.get('user_id') || params.get('id');
            const nickname = params.get('nickname') || params.get('name') || params.get('username');
            const role = params.get('role') || 'user';
            if (id && nickname) user = { id, nickname, role };
        }

        if (user) {
            try {
                localStorage.setItem('user', JSON.stringify(user));
                // 讓使用者知道成功
                setMsg('登入成功，分頁即將關閉...');
                // 嘗試自動關閉（可能被阻擋）
                setTimeout(() => window.close(), 600);
            } catch (e) {
                console.error('寫入 localStorage 失敗:', e);
                setMsg('登入成功，但無法寫入 localStorage，請手動關閉分頁');
            }
        } else {
            setMsg('未取得使用者資訊，請重試登入');
        }
    }, []);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <h2>OAuth Callback</h2>
            <p>{msg}</p>
            <small style={{ opacity: 0.7, marginTop: 12 }}>若未自動關閉，請手動關閉此分頁</small>
        </div>
    );
};

export default OAuthCallback;
