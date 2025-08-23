import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const VirtualizedHistory = ({ records, getThumbnailByVideoId, showAllHistory }) => {
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(10); // 增加初始值以支持更多記錄
    const containerRef = useRef(null);
    const ITEM_HEIGHT = 80; // 每個項目的高度
    const BUFFER_SIZE = 5; // 緩衝區大小

    // 格式化時間顯示
    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        };
    };

    // 計算可見範圍 - 使用 useCallback 確保能獲取最新的 records
    const calculateVisibleRange = useCallback(() => {
        if (!containerRef.current || !records.length) return;

        const scrollTop = containerRef.current.scrollTop;
        const containerHeight = containerRef.current.clientHeight;

        const newStartIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
        const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);
        const newEndIndex = Math.min(records.length, newStartIndex + visibleCount + BUFFER_SIZE * 2);

        setStartIndex(newStartIndex);
        setEndIndex(newEndIndex);
    }, [records]);

    // 處理滾動事件 - 使用 useCallback 確保引用穩定性
    const handleScroll = () => {
        calculateVisibleRange();
    };

    // 當記錄變化時重置索引並重新計算
    useEffect(() => {
        if (records.length > 0) {
            setStartIndex(0);
            // 初始顯示更多記錄，確保虛擬化正常工作
            const initialEndIndex = Math.min(records.length, Math.max(50, Math.ceil(400 / ITEM_HEIGHT) + BUFFER_SIZE * 2));
            setEndIndex(initialEndIndex);
            // 使用 setTimeout 確保容器已經渲染
            setTimeout(() => {
                calculateVisibleRange();
            }, 0);
        } else {
            setStartIndex(0);
            setEndIndex(0);
        }
    }, [records.length]);

    // 當顯示模式改變時重新計算
    useEffect(() => {
        setTimeout(() => {
            calculateVisibleRange();
        }, 0);
    }, [showAllHistory]);

    // 綁定滾動事件
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    // 可見的記錄項目
    const visibleRecords = useMemo(() => {
        const slicedRecords = records.slice(startIndex, endIndex).map((record, index) => ({
            ...record,
            virtualIndex: startIndex + index
        }));

        return slicedRecords;
    }, [records, startIndex, endIndex, showAllHistory]);

    // 總高度
    const totalHeight = records.length * ITEM_HEIGHT;

    if (records.length === 0) {
        return (
            <div style={{ textAlign: 'center', color: '#8b9bb3', padding: '2rem' }}>
                沒有找到符合條件的播放記錄
            </div>
        );
    }

    return (
        <div className="virtualized-history">
            <div
                ref={containerRef}
                className="history-container"
                style={{
                    height: showAllHistory ? '500px' : '320px', // 增加 showAllHistory 時的高度
                    overflowY: 'auto',
                    border: '1px solid #333',
                    borderRadius: '8px'
                }}
            >
                <div style={{ height: totalHeight, position: 'relative' }}>
                    <div
                        style={{
                            transform: `translateY(${startIndex * ITEM_HEIGHT}px)`,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0
                        }}
                    >
                        {visibleRecords.map((record) => {
                            const dateTime = formatDateTime(record.timestamp);

                            return (
                                <div
                                    key={`${record.videoId}-${record.timestamp}`}
                                    className="history-item"
                                    style={{
                                        height: ITEM_HEIGHT,
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        borderBottom: '1px solid #444',
                                        backgroundColor: record.virtualIndex % 2 === 0 ? '#2a2a2a' : '#333'
                                    }}
                                >
                                    <div className="history-thumbnail">
                                        {getThumbnailByVideoId(record.videoId) ? (
                                            <img
                                                src={getThumbnailByVideoId(record.videoId)}
                                                alt={record.title}
                                                style={{
                                                    width: '60px',
                                                    height: '45px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '60px',
                                                height: '45px',
                                                backgroundColor: '#555',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '10px',
                                                color: '#999'
                                            }}>
                                                {dateTime.time}
                                            </div>
                                        )}
                                    </div>

                                    <div className="history-info" style={{ marginLeft: '12px', flex: 1 }}>
                                        <h5 style={{
                                            margin: '0 0 4px 0',
                                            fontSize: '14px',
                                            lineHeight: '1.3',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {record.title}
                                        </h5>
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#999',
                                            display: 'flex',
                                            gap: '12px'
                                        }}>
                                            <span>日期: {dateTime.date}</span>
                                            <span>時間: {dateTime.time}</span>
                                        </div>
                                    </div>

                                    <div className="history-index" style={{
                                        fontSize: '12px',
                                        color: '#666',
                                        minWidth: '40px',
                                        textAlign: 'right'
                                    }}>
                                        #{record.virtualIndex + 1}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {records.length > 10 && (
                <div className="scroll-info" style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'center'
                }}>
                    顯示 {Math.min(startIndex + 1, records.length)}-{Math.min(endIndex, records.length)} / {records.length} 筆記錄
                </div>
            )}
        </div>
    );
};

export default VirtualizedHistory;
