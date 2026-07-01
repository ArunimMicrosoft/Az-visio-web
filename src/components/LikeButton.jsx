// LikeButton — heart toggle with live count. Used at the top of each article.
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchLikeState, likeArticle, unlikeArticle } from '../utils/blogLikes';
import './LikeButton.css';

const LikeButton = ({ slug }) => {
  const { user, isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pulse, setPulse] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const state = await fetchLikeState(slug, user?.id);
    setCount(state.count);
    setLiked(state.likedByUser);
    setLoading(false);
  }, [slug, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    if (busy) return;
    setBusy(true);

    // Optimistic update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));
    if (nextLiked) {
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
    }

    const fn = nextLiked ? likeArticle : unlikeArticle;
    const res = await fn(slug, user.id);
    if (!res.ok) {
      // Roll back on error
      setLiked(!nextLiked);
      setCount((c) => c + (nextLiked ? -1 : 1));
    }
    setBusy(false);
  };

  return (
    <button
      type="button"
      className={`like-btn ${liked ? 'liked' : ''} ${pulse ? 'pulse' : ''}`}
      onClick={toggle}
      disabled={busy || loading}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike this article' : 'Like this article'}
      title={isAuthenticated ? (liked ? 'Unlike' : 'Like this article') : 'Sign in to like'}
    >
      <span className="like-heart" aria-hidden="true">
        {liked ? '❤️' : '🤍'}
      </span>
      <span className="like-count">
        {loading ? '…' : count.toLocaleString('en-IN')}
      </span>
    </button>
  );
};

export default LikeButton;
