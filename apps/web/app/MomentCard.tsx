'use client';

import React, { useState } from 'react';
import {
  InstagramLikeIcon,
  InstagramCommentIcon,
  InstagramShareIcon,
  InstagramSaveIcon,
  RepostIcon,
  InstagramMoreIcon,
  InstagramLocationIcon,
} from './icons';

export interface MomentPost {
  id: string;
  username: string;
  avatarText?: string;
  avatarUrl?: string;
  location?: string;
  isOfficial?: boolean;
  imageUrl?: string;
  imageCaption?: string;
  likesCount: number;
  likedBy?: string;
  caption: string;
  commentsCount: number;
  timeAgo: string;
}

export function MomentCard({ post }: { post: MomentPost }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [likes, setLikes] = useState(post.likesCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [commentSent, setCommentSent] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleLikeToggle = () => {
    if (liked) {
      setLiked(false);
      setLikes((prev) => Math.max(0, prev - 1));
    } else {
      setLiked(true);
      setLikes((prev) => prev + 1);
    }
  };

  const handleDoubleTap = () => {
    if (!liked) {
      setLiked(true);
      setLikes((prev) => prev + 1);
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 900);
  };

  const handleReport = () => {
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowOptions(false);
    }, 1500);
  };

  return (
    <article className="insta-card">
      {/* 1. Header */}
      <header className="insta-header">
        <div className="insta-user-row">
          <div className="insta-avatar-ring">
            <div className="insta-avatar-inner">
              {post.avatarUrl ? (
                <img src={post.avatarUrl} alt={post.username} className="insta-avatar-img" />
              ) : (
                <div className="insta-avatar-placeholder">{post.avatarText || post.username[0].toUpperCase()}</div>
              )}
            </div>
          </div>
          <div className="insta-user-info">
            <div className="insta-username-row">
              <span className="insta-username">{post.username}</span>
              {post.isOfficial && (
                <span className="insta-verified-badge" title="Verified Campus Official">
                  ✓
                </span>
              )}
            </div>
            {post.location && (
              <span className="insta-location">
                <InstagramLocationIcon size={11} />
                {post.location}
              </span>
            )}
          </div>
        </div>

        {/* More / Report button */}
        <button
          className="insta-more-btn"
          aria-label="More options"
          onClick={() => setShowOptions(true)}
        >
          <InstagramMoreIcon size={20} />
        </button>
      </header>

      {/* 2. Media Image with Double Tap */}
      <div className="insta-media-container" onDoubleClick={handleDoubleTap}>
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.caption} className="insta-media-img" loading="lazy" />
        ) : (
          <div className="insta-media-fallback">
            <div className="insta-media-watermark">AuPro</div>
            <span>{post.imageCaption || 'Campus Announcement'}</span>
          </div>
        )}

        {/* Popping Heart Animation on Double Tap */}
        {showHeartAnim && (
          <div className="insta-heart-overlay">
            <InstagramLikeIcon filled={true} size={88} />
          </div>
        )}
      </div>

      {/* 3. Action Bar (Like, Comment, Share, Bookmark) */}
      <div className="insta-actions-bar">
        <div className="insta-actions-left">
          <button
            className={`insta-action-btn ${liked ? 'liked' : ''}`}
            onClick={handleLikeToggle}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <InstagramLikeIcon filled={liked} size={24} />
          </button>
          <button className="insta-action-btn" aria-label="Comment" onClick={() => setCommentsOpen((open) => !open)}>
            <InstagramCommentIcon size={24} />
          </button>
          <button className="insta-action-btn" aria-label="Share" onClick={() => {
            if (navigator.share) navigator.share({ title: `AuPro post by ${post.username}`, text: post.caption, url: window.location.href }).catch(() => undefined);
            else navigator.clipboard?.writeText(window.location.href);
          }}>
            <InstagramShareIcon size={24} />
          </button>
          <button className={`insta-action-btn ${reposted ? 'reposted' : ''}`} aria-label={reposted ? 'Undo repost' : 'Repost'} onClick={() => setReposted((value) => !value)}>
            <RepostIcon active={reposted} size={24} />
          </button>
        </div>
        <button
          className="insta-action-btn"
          onClick={() => setSaved(!saved)}
          aria-label={saved ? 'Remove bookmark' : 'Bookmark post'}
        >
          <InstagramSaveIcon filled={saved} size={24} />
        </button>
      </div>

      {/* 4. Post Info: Likes, Caption, Comments, Time */}
      <div className="insta-details">
        <div className="insta-likes-text">
          {post.likedBy ? (
            <>
              Liked by <strong>{post.likedBy}</strong> and <strong>{likes.toLocaleString()} others</strong>
            </>
          ) : (
            <strong>{likes.toLocaleString()} likes</strong>
          )}
        </div>

        <div className="insta-caption-text">
          <span className="insta-username">{post.username}</span>
          <span className="insta-caption-body">{post.caption}</span>
        </div>

        {post.commentsCount > 0 && (
          <button className="insta-comments-link" onClick={() => setCommentsOpen((open) => !open)}>
            View all {post.commentsCount} comments
          </button>
        )}

        {reposted && <div className="insta-feedback">Reposted to your AuPro feed.</div>}
        {commentsOpen && (
          <div className="insta-comments-panel">
            {commentSent && <div className="insta-feedback">Comment added.</div>}
            <div className="insta-comment-row">
              <input className="search" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment..." aria-label="Write a comment" />
              <button className="secondary-button" disabled={!comment.trim()} onClick={() => { setCommentSent(true); setComment(''); }}>Post</button>
            </div>
          </div>
        )}

        <time className="insta-timestamp">{post.timeAgo}</time>
      </div>

      {/* 5. Instagram-Style Options / Report Modal */}
      {showOptions && (
        <div className="insta-modal-backdrop" onClick={() => setShowOptions(false)}>
          <div className="insta-modal-sheet" onClick={(e) => e.stopPropagation()}>
            {reportSuccess ? (
              <div className="insta-modal-success">
                <span className="insta-modal-check">✓</span>
                <p>Thank you for reporting. Campus moderation has been notified.</p>
              </div>
            ) : (
              <>
                <button className="insta-modal-item danger" onClick={handleReport}>
                  Report
                </button>
                <button
                  className="insta-modal-item"
                  onClick={() => {
                    navigator?.clipboard?.writeText(window.location.href);
                    alert('Post link copied to clipboard!');
                    setShowOptions(false);
                  }}
                >
                  Copy link
                </button>
                <button
                  className="insta-modal-item"
                  onClick={() => {
                    alert('Sharing to student chat group...');
                    setShowOptions(false);
                  }}
                >
                  Share to...
                </button>
                <button className="insta-modal-item cancel" onClick={() => setShowOptions(false)}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
