import React, { useMemo, useState } from 'react';
import battleCatService from './battleCatService';
import './BattleCatMonthly.css';

// 章節列表保留為變數，之後可由你填入實際章節名稱（約 10 個）
const CHAPTERS = [
    '世界一',
    '世界二',
    '世界三',
    '未來一',
    '未來二',
    '未來三',
    '宇宙一',
    '宇宙二',
    '宇宙三',
    '傳奇',
];

const BattleCatSearch = () => {
    const [chapter, setChapter] = useState('');
    const [enemy1, setEnemy1] = useState('');
    const [enemy2, setEnemy2] = useState('');
    const [enemy3, setEnemy3] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState([]);

    const enemies = useMemo(() => [enemy1.trim(), enemy2.trim(), enemy3.trim()].filter(Boolean), [enemy1, enemy2, enemy3]);
    const canSubmit = chapter && enemies.length >= 1;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setLoading(true);
        setError('');
        setResults([]);
        try {
            const data = await battleCatService.findLevel({ chapter, enemies: [enemy1, enemy2, enemy3] });
            setResults(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.error || '查詢失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bc-search-page">
            <header className="bc-header">
                <h1 className="bc-title">戰貓關卡搜尋</h1>
                <p className="bc-subtitle">選擇章節並輸入至少一個敵人名稱進行查詢</p>
            </header>

            <div className="bc-panel">
                <header className="bc-panel__header">
                    <h2 className="bc-panel__title">搜尋條件</h2>
                </header>
                <form className="bc-form" onSubmit={handleSubmit}>
                    <fieldset className="bc-fieldset">
                        <legend>章節</legend>
                        <div className="bc-radio-group">
                            {CHAPTERS.map((c, idx) => {
                                const id = `chapter-${idx}`;
                                return (
                                    <label key={id} htmlFor={id} className={`bc-radio ${chapter === c ? 'active' : ''}`}>
                                        <input
                                            id={id}
                                            type="radio"
                                            name="chapter"
                                            value={c}
                                            checked={chapter === c}
                                            onChange={(e) => setChapter(e.target.value)}
                                            required
                                        />
                                        <span>{c}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>

                    <fieldset className="bc-fieldset">
                        <legend>敵人名稱（至少填 1 項）</legend>
                        <div className="bc-enemies">
                            <input
                                className="bc-input"
                                placeholder="敵人名稱 1"
                                value={enemy1}
                                onChange={(e) => setEnemy1(e.target.value)}
                            />
                            <input
                                className="bc-input"
                                placeholder="敵人名稱 2"
                                value={enemy2}
                                onChange={(e) => setEnemy2(e.target.value)}
                            />
                            <input
                                className="bc-input"
                                placeholder="敵人名稱 3"
                                value={enemy3}
                                onChange={(e) => setEnemy3(e.target.value)}
                            />
                        </div>
                    </fieldset>

                    <div className="bc-actions">
                        <button className="bc-btn" type="submit" disabled={!canSubmit || loading}>
                            {loading ? '查詢中…' : '開始搜尋'}
                        </button>
                    </div>

                    {error && <div className="bc-error">{error}</div>}
                </form>
            </div>

            <section className="bc-results">
                {results.length > 0 && (
                    <div className="bc-panel">
                        <header className="bc-panel__header">
                            <h2 className="bc-panel__title">搜尋結果</h2>
                            <p className="bc-panel__subtitle">共 {results.length} 筆組合</p>
                        </header>
                        <div className="bc-table-wrapper">
                            <table className="bc-table">
                                <thead>
                                    <tr>
                                        <th>敵人組合</th>
                                        <th>關卡數量</th>
                                        <th>關卡明細</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((row, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <div className="bc-badges">
                                                    {(row?.enemies || []).map((en, i) => (
                                                        <span key={i} className="bc-badge">{en}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>{row?.levels?.length || 0}</td>
                                            <td>
                                                <table className="bc-levels-table">
                                                    <tbody>
                                                        {(row?.levels || []).map((lv, i) => (
                                                            <tr key={i}>
                                                                <td className="lv-chip-col">
                                                                    <span className="lv-chip">{lv.level}</span>
                                                                </td>
                                                                <td className="lv-name-col">
                                                                    <span className="lv-name" dangerouslySetInnerHTML={{ __html: lv.name }} />
                                                                </td>
                                                                <td className="lv-hp-col">
                                                                    <span className="lv-hp">HP: {lv.hp}</span>
                                                                </td>
                                                                <td className="lv-enemies-col">
                                                                    <span className="lv-enemies">{lv.enemies}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default BattleCatSearch;
