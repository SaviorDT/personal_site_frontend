import { useState, useCallback } from 'react';
import reactionService, { ReactionService } from '@/services/reactionService';

export function useReactions(type = 'post') {
  const [reactions, setReactions] = useState([]);
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReactions = useCallback(async (id) => {
    setLoading(true);
<<<<<<< HEAD
    console.log('[useReactions] Fetching reactions:', { id, type });
=======
>>>>>>> upstream/golang-programing-class

    try {
      const result = type === 'post'
        ? await reactionService.getPostReactions(id)
        : await reactionService.getCommentReactions(id);

      if (result.success) {
<<<<<<< HEAD
        console.log('[useReactions] Reactions fetched successfully:', result.data);
        setReactions(result.data.reactions || []);
        setUserReaction(result.data.user_reaction || null);
      } else {
        // API 返回失敗，記錄錯誤但不拋出異常
        console.error('[useReactions] Failed to fetch reactions:', result.error);
      }
    } catch (err) {
      console.error('[useReactions] Exception fetching reactions:', err);
=======
        setReactions(result.data.reactions || []);
        setUserReaction(result.data.user_reaction || null);
      }
    } catch (err) {
      console.error('Failed to fetch reactions:', err);
>>>>>>> upstream/golang-programing-class
    } finally {
      setLoading(false);
    }
  }, [type]);

  const addReaction = useCallback(async (id, reactionType) => {
    const previousReaction = userReaction;
    const previousReactions = [...reactions];
<<<<<<< HEAD
    let apiCallSucceeded = false;

    try {
      // 立即執行樂觀更新，為用戶提供即時反饋
      if (userReaction?.type === reactionType) {
        // 如果點同一個反應，取消反應
=======

    try {
      if (userReaction?.type === reactionType) {
>>>>>>> upstream/golang-programing-class
        setUserReaction(null);
        setReactions(prev =>
          prev.map(r =>
            r.type === reactionType
              ? { ...r, count: Math.max(0, r.count - 1) }
              : r
          )
        );
      } else {
<<<<<<< HEAD
        // 切換到不同的反應
=======
>>>>>>> upstream/golang-programing-class
        if (userReaction) {
          setReactions(prev =>
            prev.map(r =>
              r.type === userReaction.type
                ? { ...r, count: Math.max(0, r.count - 1) }
                : r
            )
          );
        }

        setUserReaction({ type: reactionType });

        const existing = reactions.find(r => r.type === reactionType);
        if (existing) {
          setReactions(prev =>
            prev.map(r =>
              r.type === reactionType
                ? { ...r, count: r.count + 1 }
                : r
            )
          );
        } else {
          setReactions(prev => [...prev, { type: reactionType, count: 1 }]);
        }
      }

<<<<<<< HEAD
      // 發送 API 請求
=======
>>>>>>> upstream/golang-programing-class
      const result = type === 'post'
        ? await reactionService.addReactionToPost(id, reactionType)
        : await reactionService.addReactionToComment(id, reactionType);

      if (result.success) {
<<<<<<< HEAD
        // API 成功，標記為成功
        apiCallSucceeded = true;
        console.log('Reaction API call successful, fetching latest data...');
        
        // API 成功後，重新獲取數據以確保與伺服器同步
        // 但我們需要小心不要丟失樂觀更新
        try {
          await fetchReactions(id);
        } catch (fetchErr) {
          console.error('Failed to refresh reactions after API success:', fetchErr);
          // 即使重新獲取失敗，API 呼叫已成功，保留樂觀更新
        }
      } else {
        // API 返回錯誤，回滾樂觀更新
        console.error('API returned error:', result.error);
        setUserReaction(previousReaction);
        setReactions(previousReactions);
        throw new Error(result.error || '反應操作失敗');
      }
    } catch (err) {
      console.error('Failed to add reaction:', err);
      
      // 只在 API 呼叫失敗時回滾
      if (!apiCallSucceeded) {
        setUserReaction(previousReaction);
        setReactions(previousReactions);
      }
      
=======
        await fetchReactions(id);
      } else {
        setUserReaction(previousReaction);
        setReactions(previousReactions);
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Failed to add reaction:', err);
      setUserReaction(previousReaction);
      setReactions(previousReactions);
>>>>>>> upstream/golang-programing-class
      throw err;
    }
  }, [type, userReaction, reactions, fetchReactions]);

  const getTotalReactions = useCallback(() => {
    return reactions.reduce((sum, r) => sum + r.count, 0);
  }, [reactions]);

  const hasUserReacted = useCallback((reactionType) => {
    return userReaction?.type === reactionType;
  }, [userReaction]);

  const getReactionCount = useCallback((reactionType) => {
    const reaction = reactions.find(r => r.type === reactionType);
    return reaction?.count || 0;
  }, [reactions]);

  return {
    reactions,
    userReaction,
    loading,
    fetchReactions,
    addReaction,
    getTotalReactions,
    hasUserReacted,
    getReactionCount,
    REACTION_TYPES: ReactionService.REACTION_TYPES,
    REACTION_INFO: ReactionService.REACTION_INFO,
  };
}
