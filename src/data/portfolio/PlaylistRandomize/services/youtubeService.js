// YouTube API 服務
export class YouTubeService {
    // 格式化影片持續時間 (從 ISO 8601 轉換為 M:SS 格式)
    static formatDuration(duration) {
        if (!duration) return '0:00';

        // 解析 ISO 8601 格式 (例如: PT4M13S)
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return '0:00';

        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // 獲取播放清單基本信息
    static async fetchPlaylistInfo(playlistId, apiKey) {
        const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch playlist info: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            throw new Error('播放清單不存在或無法訪問');
        }

        return data.items[0];
    }

    // 獲取播放清單中的所有影片
    static async fetchPlaylistVideos(playlistId, apiKey) {
        let allVideos = [];
        let nextPageToken = '';
        const maxResults = 50; // YouTube API 單次最多返回 50 個結果

        do {
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&pageToken=${nextPageToken}&key=${apiKey}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch playlist videos: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            allVideos = allVideos.concat(data.items || []);
            nextPageToken = data.nextPageToken || '';

        } while (nextPageToken);

        return allVideos;
    }

    // 獲取影片詳細信息（包括持續時間）
    static async fetchVideoDetails(videoIds, apiKey) {
        if (videoIds.length === 0) return [];

        // YouTube API 一次最多查詢 50 個影片
        const chunks = [];
        for (let i = 0; i < videoIds.length; i += 50) {
            chunks.push(videoIds.slice(i, i + 50));
        }

        let allVideoDetails = [];

        for (const chunk of chunks) {
            const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${chunk.join(',')}&key=${apiKey}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch video details: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            allVideoDetails = allVideoDetails.concat(data.items || []);
        }

        return allVideoDetails;
    }

    // 處理和格式化播放清單數據
    static processPlaylistData(playlistInfo, playlistVideos, videoDetails, playlistId) {
        // 合併數據並格式化
        const videos = playlistVideos.map((playlistItem, index) => {
            const videoId = playlistItem.contentDetails?.videoId || playlistItem.snippet?.resourceId?.videoId;
            const videoDetail = videoDetails.find(detail => detail.id === videoId);

            // 判斷影片狀態
            let status = 'unavailable';
            let title = '已刪除的影片';

            if (videoDetail) {
                // 檢查影片是否可播放
                const privacy = videoDetail.status?.privacyStatus;
                const uploadStatus = videoDetail.status?.uploadStatus;

                if (privacy === 'public' && uploadStatus === 'processed') {
                    status = 'playable';
                } else if (privacy === 'private') {
                    status = 'private';
                    title = '私人影片';
                } else if (privacy === 'unlisted') {
                    status = 'unlisted';
                    title = '未列出的影片';
                } else {
                    status = 'unavailable';
                }

                // 使用影片詳情中的標題
                title = videoDetail.snippet?.title || title;
            } else {
                // 如果無法獲取影片詳情，嘗試使用播放清單項目中的資訊
                if (playlistItem.snippet?.title &&
                    playlistItem.snippet.title !== 'Deleted video' &&
                    playlistItem.snippet.title !== 'Private video') {
                    title = playlistItem.snippet.title;
                } else {
                    // 根據播放清單項目的描述判斷狀態
                    if (playlistItem.snippet?.title === 'Private video') {
                        title = '私人影片';
                        status = 'private';
                    } else {
                        title = `已刪除的影片 #${index + 1}`;
                        status = 'deleted';
                    }
                }
            }

            return {
                id: videoId || `deleted_${Date.now()}_${Math.random()}`,
                title: title,
                duration: videoDetail ? this.formatDuration(videoDetail.contentDetails?.duration) : '0:00',
                status: status,
                thumbnail: videoDetail?.snippet?.thumbnails?.medium?.url ||
                    playlistItem.snippet?.thumbnails?.medium?.url ||
                    null,
                publishedAt: videoDetail?.snippet?.publishedAt || playlistItem.snippet?.publishedAt,
                channelTitle: videoDetail?.snippet?.channelTitle || '未知頻道',
                description: videoDetail?.snippet?.description || playlistItem.snippet?.description || '',
                position: playlistItem.snippet?.position || index
            };
        });

        // 統計信息
        const playableVideos = videos.filter(video => video.status === 'playable');
        const unavailableVideos = videos.filter(video => video.status !== 'playable');
        const privateVideos = videos.filter(video => video.status === 'private');
        const deletedVideos = videos.filter(video => video.status === 'deleted');
        const unlistedVideos = videos.filter(video => video.status === 'unlisted');

        return {
            id: playlistId,
            title: playlistInfo.snippet?.title || '未知播放清單',
            description: playlistInfo.snippet?.description || '',
            channelTitle: playlistInfo.snippet?.channelTitle || '未知頻道',
            publishedAt: playlistInfo.snippet?.publishedAt,
            thumbnail: playlistInfo.snippet?.thumbnails?.high?.url || null,
            totalVideos: videos.length,
            playableVideos: playableVideos.length,
            unavailableVideos: unavailableVideos.length,
            privateVideos: privateVideos.length,
            deletedVideos: deletedVideos.length,
            unlistedVideos: unlistedVideos.length,
            videos: videos.sort((a, b) => a.position - b.position) // 按原始順序排序
        };
    }

    // 獲取完整播放清單數據的主要方法
    static async getPlaylistData(playlistId, apiKey) {
        if (!playlistId.trim() || !apiKey.trim()) {
            throw new Error('播放清單 ID 和 API Token 都是必需的');
        }

        try {
            // 1. 獲取播放清單基本信息
            const playlistInfo = await this.fetchPlaylistInfo(playlistId, apiKey);

            // 2. 獲取播放清單中的所有影片項目
            const playlistVideos = await this.fetchPlaylistVideos(playlistId, apiKey);

            if (playlistVideos.length === 0) {
                throw new Error('播放清單為空或無法存取');
            }

            // 3. 提取影片 ID
            const videoIds = playlistVideos
                .map(item => item.contentDetails?.videoId || item.snippet?.resourceId?.videoId)
                .filter(id => id);

            // 4. 獲取影片詳細信息
            const videoDetails = await this.fetchVideoDetails(videoIds, apiKey);

            // 5. 處理和格式化數據
            return this.processPlaylistData(playlistInfo, playlistVideos, videoDetails, playlistId);

        } catch (error) {
            // 根據錯誤類型提供更具體的錯誤資訊
            let errorMessage = '載入播放清單失敗';

            if (error.message.includes('403')) {
                errorMessage = 'API 配額已用完或 API Key 無效';
            } else if (error.message.includes('404')) {
                errorMessage = '播放清單不存在或無法存取';
            } else if (error.message.includes('400')) {
                errorMessage = '請求參數錯誤，請檢查播放清單 ID';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = '網路連線錯誤，請檢查網路連線';
            } else {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        }
    }
}
