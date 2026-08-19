import React, { useState, useEffect, useRef } from 'react';
import findNumberGameService from './findNumberGameService';
import './FindNumberGame.css';

const GRID_SIZE = 25;
const COUNTDOWN_SECONDS = 3;
const WRONG_FEEDBACK_DURATION = 400; // 點錯時，閃紅/震動效果持續時間 (ms)

// 產生 1~25 隨機打亂的陣列
const generateShuffledNumbers = () => {
    const numbers = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
};

// 將秒數格式化為固定兩位小數的字串
const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--';
    return seconds.toFixed(2);
};

const FindNumberGame = () => {
    // idle -> countdown -> playing -> completed
    const [gameState, setGameState] = useState('idle');
    const [countdownValue, setCountdownValue] = useState(COUNTDOWN_SECONDS);
    const [numbers, setNumbers] = useState(() => Array.from({ length: GRID_SIZE }, (_, i) => i + 1));
    const [nextNumber, setNextNumber] = useState(1);
    const [wrongIndex, setWrongIndex] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(null);
    const [bestTime, setBestTime] = useState(null);
    const [isNewRecord, setIsNewRecord] = useState(false);

    const countdownTimerRef = useRef(null);
    const wrongTimeoutRef = useRef(null);
    const startTimestampRef = useRef(null);

    // 讀取歷史最佳紀錄
    useEffect(() => {
        setBestTime(findNumberGameService.getBestTime());
    }, []);

    // 元件卸載時清除所有計時器
    useEffect(() => {
        return () => {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
        };
    }, []);

    // 開始遊戲（同時也是「重新開始」與「再玩一次」共用的邏輯）
    // 流程：打亂數字 -> 倒數 3 秒（畫面不顯示數字）-> 倒數結束後翻開數字並開始計時
    const beginCountdown = () => {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);

        setNumbers(generateShuffledNumbers());
        setNextNumber(1);
        setWrongIndex(null);
        setElapsedTime(null);
        setIsNewRecord(false);
        setCountdownValue(COUNTDOWN_SECONDS);
        setGameState('countdown');

        countdownTimerRef.current = setInterval(() => {
            setCountdownValue((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownTimerRef.current);
                    countdownTimerRef.current = null;
                    startTimestampRef.current = performance.now();
                    setGameState('playing');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // 點擊格子
    const handleCellClick = (index) => {
        if (gameState !== 'playing') return;

        const value = numbers[index];

        if (value !== nextNumber) {
            // 點錯：閃紅 + 震動提示，不影響進度
            setWrongIndex(index);
            if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
            wrongTimeoutRef.current = setTimeout(() => setWrongIndex(null), WRONG_FEEDBACK_DURATION);
            return;
        }

        if (value === GRID_SIZE) {
            // 全部點完，結算成績
            const elapsedSeconds = (performance.now() - startTimestampRef.current) / 1000;
            const newRecord = bestTime === null || elapsedSeconds < bestTime;

            setElapsedTime(elapsedSeconds);
            setIsNewRecord(newRecord);

            if (newRecord) {
                setBestTime(elapsedSeconds);
                findNumberGameService.saveBestTime(elapsedSeconds);
            }

            setGameState('completed');
        }

        setNextNumber((prev) => prev + 1);
    };

    const isBoardRevealed = gameState === 'playing' || gameState === 'completed';

    return (
        <div className="find-number-game">
            <header className="find-number-game__header">
                <h1 className="find-number-game__title">🔢 找數字遊戲</h1>
                <p className="find-number-game__subtitle">
                    1~25 隨機散佈在 5×5 格子中，依照順序點擊完成，看看你需要多少秒！
                </p>
            </header>

            <div className="find-number-game__panel">
                <div className="find-number-game__info-bar">
                    <div className="find-number-game__info-item">
                        <span className="find-number-game__info-label">下一個目標</span>
                        <span className="find-number-game__info-value">
                            {gameState === 'playing' ? nextNumber : '--'}
                        </span>
                    </div>
                    <div className="find-number-game__info-item">
                        <span className="find-number-game__info-label">歷史最佳</span>
                        <span className="find-number-game__info-value">
                            {bestTime !== null ? `${formatTime(bestTime)} 秒` : '尚無紀錄'}
                        </span>
                    </div>
                    {gameState === 'playing' && (
                        <button
                            type="button"
                            className="find-number-game__btn find-number-game__btn--secondary find-number-game__btn--small"
                            onClick={beginCountdown}
                        >
                            🔄 重新開始
                        </button>
                    )}
                </div>

                <div className="find-number-game__board-wrapper">
                    <div className="find-number-game__board">
                        {numbers.map((value, index) => {
                            const isClicked = isBoardRevealed && value < nextNumber;
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    className={[
                                        'find-number-game__cell',
                                        isClicked ? 'find-number-game__cell--clicked' : '',
                                        wrongIndex === index ? 'find-number-game__cell--wrong' : ''
                                    ].filter(Boolean).join(' ')}
                                    onClick={() => handleCellClick(index)}
                                    disabled={gameState !== 'playing' || isClicked}
                                >
                                    {isBoardRevealed ? value : ''}
                                </button>
                            );
                        })}
                    </div>

                    {gameState === 'idle' && (
                        <div className="find-number-game__overlay">
                            <button
                                type="button"
                                className="find-number-game__btn find-number-game__btn--primary find-number-game__btn--large"
                                onClick={beginCountdown}
                            >
                                ▶️ 開始遊戲
                            </button>
                        </div>
                    )}

                    {gameState === 'countdown' && (
                        <div className="find-number-game__overlay">
                            <div key={countdownValue} className="find-number-game__countdown">
                                {countdownValue}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {gameState === 'completed' && (
                <div className="find-number-game__modal-overlay">
                    <div className="find-number-game__modal">
                        <div className="find-number-game__modal-header">
                            <h3 className="find-number-game__modal-title">🎉 完成！</h3>
                        </div>

                        <div className="find-number-game__modal-body">
                            {isNewRecord && (
                                <p className="find-number-game__modal-record">🏆 新紀錄！</p>
                            )}
                            <p className="find-number-game__modal-time">
                                本次用時：<strong>{formatTime(elapsedTime)} 秒</strong>
                            </p>
                            <p className="find-number-game__modal-best">
                                歷史最佳：{bestTime !== null ? `${formatTime(bestTime)} 秒` : '--'}
                            </p>
                        </div>

                        <div className="find-number-game__modal-actions">
                            <button
                                type="button"
                                className="find-number-game__btn find-number-game__btn--primary"
                                onClick={beginCountdown}
                            >
                                🔁 再玩一次
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindNumberGame;
