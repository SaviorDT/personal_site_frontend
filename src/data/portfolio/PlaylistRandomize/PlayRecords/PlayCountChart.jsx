import React, { useMemo } from 'react';

const PlayCountChart = ({ data }) => {
    // 計算圖表數據
    const chartData = useMemo(() => {
        if (!data || Object.keys(data).length === 0) {
            return { bars: [], maxValue: 0, maxCount: 0 };
        }

        const entries = Object.entries(data)
            .map(([playCount, videoCount]) => ({
                playCount: parseInt(playCount),
                videoCount: parseInt(videoCount)
            }))
            .sort((a, b) => a.playCount - b.playCount);

        const maxValue = Math.max(...entries.map(e => e.videoCount));
        const maxCount = Math.max(...entries.map(e => e.playCount));

        return { bars: entries, maxValue, maxCount };
    }, [data]);

    if (chartData.bars.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                color: '#8b9bb3',
                padding: '2rem',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                border: '1px solid #444'
            }}>
                暫無數據可顯示
            </div>
        );
    }

    const CHART_HEIGHT = 200;
    const CHART_WIDTH = 400;
    const PADDING = 40;

    return (
        <div className="play-count-chart">
            <div style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #444'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '16px'
                }}>
                    <svg
                        width={CHART_WIDTH + PADDING * 2}
                        height={CHART_HEIGHT + PADDING * 2}
                        style={{ backgroundColor: '#333', borderRadius: '4px' }}
                    >
                        {/* Y軸 */}
                        <line
                            x1={PADDING}
                            y1={PADDING}
                            x2={PADDING}
                            y2={CHART_HEIGHT + PADDING}
                            stroke="#666"
                            strokeWidth="2"
                        />

                        {/* X軸 */}
                        <line
                            x1={PADDING}
                            y1={CHART_HEIGHT + PADDING}
                            x2={CHART_WIDTH + PADDING}
                            y2={CHART_HEIGHT + PADDING}
                            stroke="#666"
                            strokeWidth="2"
                        />

                        {/* Y軸標籤 */}
                        <text
                            x={20}
                            y={PADDING / 2}
                            fill="#ccc"
                            fontSize="12"
                            textAnchor="middle"
                        >
                            影片數
                        </text>

                        {/* X軸標籤 */}
                        <text
                            x={CHART_WIDTH / 2 + PADDING}
                            y={CHART_HEIGHT + PADDING + 30}
                            fill="#ccc"
                            fontSize="12"
                            textAnchor="middle"
                        >
                            播放次數
                        </text>

                        {/* 繪製柱狀圖 */}
                        {chartData.bars.map((bar, index) => {
                            const barWidth = Math.max(20, (CHART_WIDTH - 20) / chartData.bars.length - 5);
                            const barHeight = (bar.videoCount / chartData.maxValue) * (CHART_HEIGHT - 20);
                            const x = PADDING + 10 + index * (barWidth + 5);
                            const y = CHART_HEIGHT + PADDING - barHeight;

                            return (
                                <g key={bar.playCount}>
                                    {/* 柱子 */}
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill="#4A90E2"
                                        stroke="#5AA3F0"
                                        strokeWidth="1"
                                        rx="2"
                                    />

                                    {/* 數值標籤 */}
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 5}
                                        fill="#ccc"
                                        fontSize="10"
                                        textAnchor="middle"
                                    >
                                        {bar.videoCount}
                                    </text>

                                    {/* X軸數值 */}
                                    <text
                                        x={x + barWidth / 2}
                                        y={CHART_HEIGHT + PADDING + 15}
                                        fill="#999"
                                        fontSize="10"
                                        textAnchor="middle"
                                    >
                                        {bar.playCount}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Y軸刻度線 */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                            const y = CHART_HEIGHT + PADDING - ratio * (CHART_HEIGHT - 20);
                            const value = Math.round(ratio * chartData.maxValue);

                            return (
                                <g key={index}>
                                    <line
                                        x1={PADDING - 5}
                                        y1={y}
                                        x2={PADDING + 5}
                                        y2={y}
                                        stroke="#666"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={PADDING - 10}
                                        y={y + 4}
                                        fill="#999"
                                        fontSize="10"
                                        textAnchor="end"
                                    >
                                        {value}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* 圖表說明 */}
                <div style={{
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'center',
                    marginTop: '8px'
                }}>
                    橫軸：播放次數 | 縱軸：擁有該播放次數的影片數量
                </div>

                {/* 統計摘要 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginTop: '12px',
                    padding: '8px',
                    backgroundColor: '#333',
                    borderRadius: '4px',
                    fontSize: '11px'
                }}>
                    <span>最高播放次數: {chartData.maxCount}</span>
                    <span>不同播放次數: {chartData.bars.length}</span>
                    <span>最多影片數: {chartData.maxValue}</span>
                </div>
            </div>
        </div>
    );
};

export default PlayCountChart;
