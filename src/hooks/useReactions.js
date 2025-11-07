import { useState, useCallback } from 'react';
import reactionService, { ReactionService } from '@/services/reactionService';

export function useReactions(type = 'post') {
  const [reactions, setReactions] = useState([]);
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReactions = useCallback(async (id) => {
    setLoading(true);

    try {
      const result = type === 'post'
        ? await reactionService.getPostReactions(id)
        : await reactionService.getCommentReactions(id);

      if (result.success) {
        setReactions(result.data.reactions || []);
        setUserReaction(result.data.user_reaction || null);
      }
    } catch (err) {
      console.error('Failed to fetch reactions:', err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const addReaction = useCallback(async (id, reactionType) => {
    const previousReaction = userReaction;
    const previousReactions = [...reactions];

    try {
      if (userReaction?.type === reactionType) {
        setUserReaction(null);
        setReactions(prev =>
          prev.map(r =>
            r.type === reactionType
              ? { ...r, count: Math.max(0, r.count - 1) }
              : r
          )
        );
      } else {
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

      const result = type === 'post'
        ? await reactionService.addReactionToPost(id, reactionType)
        : await reactionService.addReactionToComment(id, reactionType);

      if (result.success) {
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
