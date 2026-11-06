'use client';

import React, { useEffect, useState } from 'react';
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
  category?: 'normal' | 'problem' | 'announcement';
  imageUrl?: string;
  documentUrl?: string;
  imageCaption?: string;
  likesCount: number;
  repostsCount?: number;
  likedBy?: string;
  caption: string;
  commentsCount: number;
  comments?: MomentComment[];
  timeAgo: string;
  durationDays?: number;
}

export interface MomentComment {
  id: string;
  username: string;
  avatarText: string;
  text: string;
  timeAgo: string;
  imageUrl?: string;
}

export function MomentCard({ post, onToast }: { post: MomentPost; onToast?: (message: string) => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [likes, setLikes] = useState(post.likesCount);
  const [reposts, setReposts] = useState(post.repostsCount ?? 0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [commentImage, setCommentImage] = useState('');
  const [commentError, setCommentError] = useState('');
  const [comments, setComments] = useState<MomentComment[]>(post.comments ?? []);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [postDetailsOpen, setPostDetailsOpen] = useState(false);
  const [mediaUnavailable, setMediaUnavailable] = useState(false);
  const [following, setFollowing] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [localToast, setLocalToast] = useState('');

  const notify = (message: string) => {
    if (onToast) onToast(message);
    else setLocalToast(message);
  };

  useEffect(() => {
    if (!commentsOpen && !postDetailsOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCommentsOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [commentsOpen, postDetailsOpen]);

  useEffect(() => {
    if (!localToast) return;
    const timeout = window.setTimeout(() => setLocalToast(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [localToast]);

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
    notify('Thanks for reporting. Campus moderation has been notified.');
    setTimeout(() => {
      setReportSuccess(false);
      setShowOptions(false);
    }, 1500);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `AuPro post by ${post.username}`, text: post.caption, url });
        notify('Post shared.');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          notify('Share cancelled.');
          return;
        }
        notify('Could not share this post. Try copying its link instead.');
      }
      return;
    }

    try {
      if (!navigator.clipboard) throw new Error('Clipboard access is unavailable.');
      await navigator.clipboard.writeText(url);
      notify('Post link copied.');
    } catch {
      notify('Could not copy the post link. Copy the page address from your browser.');
    }
  };

  const handleCopyLink = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard access is unavailable.');
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#post-${post.id}`);
      notify('Post link copied.');
      setShowOptions(false);
    } catch {
      notify('Could not copy the post link. Copy the page address from your browser.');
    }
  };

  const handleRepost = () => {
    const wasReposted = reposted;
    setReposted(!wasReposted);
    setReposts((count) => Math.max(0, count + (wasReposted ? -1 : 1)));
    notify(wasReposted ? 'Repost removed.' : 'Post reposted.');
  };

  const handleCommentImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCommentError('Choose an image file to attach.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setCommentError('Choose an image smaller than 8 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCommentImage(reader.result);
        setCommentError('');
      } else {
        setCommentError('This image could not be previewed.');
      }
    };
    reader.onerror = () => setCommentError('This image could not be read.');
    reader.readAsDataURL(file);
  };

  const handleCommentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = comment.trim();
    if (!text && !commentImage) return;

    setComments((existing) => [
      ...existing,
      {
        id: `${Date.now()}`,
        username: 'you',
        avatarText: 'Y',
        text,
        timeAgo: 'now',
        ...(commentImage ? { imageUrl: commentImage } : {}),
      },
    ]);
    setCommentsCount((count) => count + 1);
    setComment('');
    setCommentImage('');
    setCommentError('');
  };

  if (hidden) return null;

  return (
    <article className="insta-card" id={`post-${post.id}`}>
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
              {post.category === 'problem' && (
                <span className="post-category-tag problem">⚠️ Problem</span>
              )}
              {post.category === 'announcement' && (
                <span className="post-category-tag announcement">📢 Notice</span>
              )}
            </div>
            {post.location && (
              <span className="insta-location">
                <InstagramLocationIcon size={13} />
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
      <button
        type="button"
        className="insta-media-container"
        aria-label={`Open post by ${post.username}`}
        onClick={() => setPostDetailsOpen(true)}
        onDoubleClick={handleDoubleTap}
      >
        {post.documentUrl ? (
          <div className="insta-pdf-preview">
            <span className="insta-pdf-badge">PDF</span>
            <strong>{post.imageCaption?.replace(/^PDF document · /, '') || 'Campus document'}</strong>
            <span>Open post details to view the document</span>
          </div>
        ) : post.imageUrl && !mediaUnavailable ? (
          <img
            src={post.imageUrl}
            alt={post.imageCaption || `Campus moment shared by ${post.username}`}
            className="insta-media-img"
            loading="lazy"
            onError={() => setMediaUnavailable(true)}
          />
        ) : (
          <div className={`insta-media-fallback ${post.imageCaption === 'Robotics hackathon' ? 'robotics-art' : 'campus-art'}`}>
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
      </button>

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
          <button className="insta-action-btn" aria-label="Comment" onClick={() => setCommentsOpen(true)}>
            <InstagramCommentIcon size={24} />
          </button>
          <button className="insta-action-btn" aria-label="Share" onClick={handleShare}>
            <InstagramShareIcon size={24} />
          </button>
          <button className={`insta-action-btn insta-repost-btn ${reposted ? 'reposted' : ''}`} aria-label={reposted ? 'Undo repost' : 'Repost'} aria-pressed={reposted} onClick={handleRepost}>
            <RepostIcon active={reposted} size={28} />
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
              Liked by{' '}<strong>{post.likedBy}</strong>{' '}and{' '}<strong>{likes.toLocaleString()} others</strong>
            </>
          ) : (
            <strong>{likes.toLocaleString()} likes</strong>
          )}
        </div>
        <div className="insta-repost-count">{reposts.toLocaleString()} reposts</div>

        <div className="insta-caption-text">
          <span className="insta-username">{post.username}</span>
          <span className="insta-caption-body"> {post.caption}</span>
        </div>

        {comments.slice(0, 2).map((item) => (
          <div className="insta-comment-preview" key={item.id}>
            <span className="insta-username">{item.username}</span>
            <span>{item.text}</span>
          </div>
        ))}
        {commentsCount > 0 && (
          <button className="insta-comments-link" onClick={() => setCommentsOpen(true)}>
            View all {commentsCount.toLocaleString()} comments
          </button>
        )}

        {commentsOpen && (
          <div className="insta-comments-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCommentsOpen(false);
          }}>
            <section className="insta-comments-dialog" role="dialog" aria-modal="true" aria-labelledby={`comments-title-${post.id}`}>
              <header className="insta-comments-header">
                <h2 id={`comments-title-${post.id}`}>Comments</h2>
                <button className="insta-comments-close" aria-label="Close comments" onClick={() => setCommentsOpen(false)}>×</button>
              </header>
              <div className="insta-comments-list">
                {comments.length === 0 ? (
                  <p className="insta-comments-empty">No comments yet. Start the conversation.</p>
                ) : comments.map((item) => (
                  <article className="insta-comment-item" key={item.id}>
                    <div className="insta-comment-avatar" aria-hidden="true">{item.avatarText}</div>
                    <div className="insta-comment-content">
                      <p><strong>{item.username}</strong>{item.text && <> {item.text}</>}</p>
                      {item.imageUrl && <img className="insta-comment-image" src={item.imageUrl} alt={`Image attached by ${item.username}`} />}
                      <time>{item.timeAgo}</time>
                    </div>
                  </article>
                ))}
              </div>
              <div className="insta-comments-composer">
                {commentImage && (
                  <div className="insta-comment-image-preview">
                    <img src={commentImage} alt="Selected image preview" />
                    <button type="button" aria-label="Remove selected image" onClick={() => setCommentImage('')}>×</button>
                    <span>Preview only; this image is not uploaded.</span>
                  </div>
                )}
                {commentError && <p className="insta-comment-error" role="alert">{commentError}</p>}
                <form className="insta-comment-form" onSubmit={handleCommentSubmit}>
                  <label className="insta-comment-attach" aria-label="Attach an image">
                    <input type="file" accept="image/*" onChange={handleCommentImage} />
                    <span aria-hidden="true">＋</span>
                  </label>
                  <input
                    className="insta-comment-input"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Add a comment..."
                    aria-label="Add a comment"
                    maxLength={500}
                  />
                  <button className="insta-comment-post" type="submit" disabled={!comment.trim() && !commentImage}>Post</button>
                </form>
                <p className="insta-comment-upload-note">Comments and attachments are local previews in this demo.</p>
              </div>
            </section>
          </div>
        )}

        <div className="insta-post-metadata">
          <time className="insta-timestamp">{post.timeAgo}</time>
          {post.durationDays && <span className="insta-post-duration">Visible for {post.durationDays} days</span>}
        </div>
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
                <button className="insta-modal-item" onClick={handleCopyLink}>Copy link</button>
                <button className="insta-modal-item" onClick={() => { notify('Post hidden from your feed.'); setShowOptions(false); setHidden(true); }}>Hide</button>
                <button className="insta-modal-item" onClick={() => { setFollowing((value) => !value); notify(following ? `You unfollowed ${post.username}.` : `You followed ${post.username}.`); setShowOptions(false); }}>
                  {following ? 'Unfollow' : 'Follow'}
                </button>
                <button className="insta-modal-item cancel" onClick={() => setShowOptions(false)}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {postDetailsOpen && (
        <div className="insta-detail-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPostDetailsOpen(false);
        }}>
          <section className="insta-detail-dialog" role="dialog" aria-modal="true" aria-label={`Post by ${post.username}`}>
            <button className="insta-detail-close" aria-label="Close post details" onClick={() => setPostDetailsOpen(false)}>×</button>
            {post.documentUrl ? (
              <div className="insta-pdf-preview insta-pdf-detail">
                <span className="insta-pdf-badge">PDF</span>
                <strong>{post.imageCaption?.replace(/^PDF document · /, '') || 'Campus document'}</strong>
                <a href={post.documentUrl} target="_blank" rel="noreferrer">Open PDF in a new tab</a>
              </div>
            ) : post.imageUrl && !mediaUnavailable ? (
              <img src={post.imageUrl} alt={post.imageCaption || `Campus moment shared by ${post.username}`} onError={() => setMediaUnavailable(true)} />
            ) : (
              <div className={`insta-media-fallback ${post.imageCaption === 'Robotics hackathon' ? 'robotics-art' : 'campus-art'}`}>
                <div className="insta-media-watermark">AuPro</div>
                <span>{post.imageCaption || 'Campus Announcement'}</span>
              </div>
            )}
            <div className="insta-detail-caption">
              <strong>{post.username}</strong>{' '}{post.caption}
              {post.location && <span className="insta-location"><InstagramLocationIcon size={13} />{post.location}</span>}
              <button className="insta-comments-link" onClick={() => { setPostDetailsOpen(false); setCommentsOpen(true); }}>View comments</button>
            </div>
          </section>
        </div>
      )}
      {localToast && <div className="insta-toast" role="status">{localToast}</div>}
    </article>
  );
}
