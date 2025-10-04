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
    '傳說',
];

const ENEMIES = [
    "豬大哥",
    "不死鱷魚",
    "炸烏賊天使",
    "爆走姆特貓",
    "紅髮扭扭蛇",
    "浪子漢",
    "黑色破壞一族",
    "拉腸狗",
    "壁犬",
    "不死大猩猩",
    "不死大鯢",
    "噴噴老師",
    "異星袋拳",
    "獅豬",
    "宙星生化魚",
    "鬣狼",
    "棺材狗",
    "熊星人",
    "銀河貓彈",
    "巨匠",
    "不死扭扭蛇",
    "不死企鵝大哥Z",
    "不死河馬將",
    "熊熊老師",
    "汪仔星人",
    "狼與少女",
    "扭扭蛇",
    "樹懶賴",
    "加百列天使",
    "影子拳擊手",
    "鋼鐵狗仔",
    "狗仔紅帽咪娜",
    "眼猴星人",
    "CyberX",
    "鋼鐵斑海豹桑",
    "超級鋼鐵河馬將",
    "生化魚鈴木",
    "天使斯雷普尼爾",
    "不死袋拳",
    "大猩猩",
    "臭老兔",
    "臉星人",
    "鼴小龍",
    "狗塔",
    "咩咩",
    "斑海星人",
    "駝背",
    "小噴噴",
    "天使愛好家",
    "傳奇噴噴Ω",
    "快豚星人",
    "師匠",
    "黑澤導演",
    "蛾蛾蛾蛾",
    "臉君",
    "鱷星宅宅",
    "善哉",
    "鴨子倫倫",
    "戰鬥無尾熊球",
    "天使野豬",
    "犬武者武藏",
    "殺意狗",
    "蛾星女神",
    "黑猩猩",
    "宙星.企鵝大哥",
    "披著水豚皮的水豚",
    "大嘴武哥",
    "一角君",
    "河馬將天使",
    "無尾熊球",
    "凹凸駝背",
    "異星貴賓",
    "宙猩將軍",
    "鋼鐵犀一角",
    "鴕鳥愛美惠",
    "瀟灑哥",
    "海豚姑娘",
    "袋拳",
    "寄居星人",
    "黑熊",
    "燕梓南",
    "大夢君",
    "激動咩咩",
    "背負.和平.鴿",
    "貴賓",
    "神",
    "必殺達也",
    "河馬將",
    "澎湃",
    "松鼠阿嘎",
    "伊麗莎白56世",
    "鼴鼠隊長",
    "豪豬教授",
    "豬野郎",
    "企鵝大哥",
    "天使小雞",
    "松黑藏",
    "食蛙星人",
    "落猩天使",
    "粥董",
    "飛天小豬",
    "赤井噴太郎",
    "眉毛鳥",
    "赤面歌王",
    "寄生噴噴",
    "伊麗莎白2世",
    "小戰士貓彈",
    "鋼鐵臉君",
    "墓手太郎",
    "墓手花子",
    "精英汪仔星人",
    "不死斑海豹桑",
    "狗仔",
    "鱷魚宅宅",
    "惡之帝王貓彈",
    "河馬星人",
    "小魷",
    "神(認真)",
    "邪星小旋風",
    "黑暗野豬",
    "鋼鐵河馬將",
    "破壞生物異星海蝶",
    "破壞一族",
    "天使先生",
    "小光",
    "蛙助",
    "斑海豹桑",
    "反叛的瓦爾基麗貓",
    "不死狗仔",
    "羊駝背",
    "澎湃媽",
    "六角龍邪",
    "終極千兆宏偉神",
    "黑色噴噴",
    "火馬",
    "團結筷子幫",
    "花園鰻5兄弟",
    "不死豬野郎"
]

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

    // 將給定字串中的關鍵詞加上醒目標註（不分大小寫，中文不使用字界）
    const highlightHtml = (input, keys) => {
        const html = String(input ?? '');
        const keywords = (keys || []).map(s => String(s || '').trim()).filter(Boolean);
        if (!html || keywords.length === 0) return html;
        // 關鍵字長度由長到短，避免子字串破壞較長匹配
        const sorted = Array.from(new Set(keywords)).sort((a, b) => b.length - a.length);
        const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = sorted.map(escapeRegExp).join('|');
        const re = new RegExp(`(${pattern})`, 'gi');
        return html.replace(re, '<span class="bc-highlight">$1</span>');
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
                                list="enemy-options"
                                value={enemy1}
                                onChange={(e) => setEnemy1(e.target.value)}
                            />
                            <input
                                className="bc-input"
                                placeholder="敵人名稱 2"
                                list="enemy-options"
                                value={enemy2}
                                onChange={(e) => setEnemy2(e.target.value)}
                            />
                            <input
                                className="bc-input"
                                placeholder="敵人名稱 3"
                                list="enemy-options"
                                value={enemy3}
                                onChange={(e) => setEnemy3(e.target.value)}
                            />
                            <datalist id="enemy-options">
                                {ENEMIES.map((enemy, idx) => (
                                    <option key={idx} value={enemy} />
                                ))}
                            </datalist>
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
                                                        {(row?.levels || []).map((lv, i) => {
                                                            const keys = (row?.enemies || []).filter(Boolean);
                                                            const enemiesHtml = highlightHtml(lv.enemies, keys);
                                                            return (
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
                                                                        <span className="lv-enemies" dangerouslySetInnerHTML={{ __html: enemiesHtml }} />
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
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
