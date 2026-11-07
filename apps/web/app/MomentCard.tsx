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

export interface MomentComment {
  id: string;
  username: string;
  avatarText: string;
  text: string;
  timeAgo: string;
  imageUrl?: string;
}

export interface MomentPost {
  id: string;
  username: string;
  authorEmail?: string;
  authorHandle?: string;
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

export interface MomentCardProps {
  post: MomentPost;
  onToast?: (message: string) => void;
  isSaved?: boolean;
  onSaveToggle?: (postId: string) => void;
  isOwner?: boolean;
  onDelete?: (postId: string) => void;
}

export function MomentCard({
  post,
  onToast,
  isSaved: externalIsSaved,
  onSaveToggle,
  isOwner = false,
  onDelete,
}: MomentCardProps) {
  const [liked, setLiked] = useState(false);
  const [internalSaved, setInternalSaved] = useState(false);
  const isSaved = externalIsSaved !== undefined ? externalIsSaved : internalSaved;

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
      if (event.key === 'Escape') {
        setCommentsOpen(false);
        setPostDetailsOpen(false);
      }
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

  const handleSaveToggle = () => {
    if (onSaveToggle) {
      onSaveToggle(post.id);
    } else {
      setInternalSaved(!isSaved);
      notify(!isSaved ? 'Post saved to bookmarks.' : 'Post removed from saved.');
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      if (window.confirm('Are you sure you want to delete this post?')) {
        onDelete(post.id);
        setShowOptions(false);
      }
    }
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
    notify(wasReposted ? 'Repost removed.' : 'Post reposted to campus.');
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

  const hasMedia = Boolean(post.documentUrl || (post.imageUrl && !mediaUnavailable));

  return (
    <article className="insta-card threads-post-card" id={`post-${post.id}`}>
      {/* Authentic Meta Threads Two-Column Structure */}
      <div className="threads-post-layout">
        {/* Left Column: Author Avatar + Continuous Vertical Thread Line */}
        <div className="threads-post-left">
          <div className="threads-post-avatar">
            {post.avatarUrl ? (
              <img src={post.avatarUrl} alt={post.username} className="threads-avatar-img" />
            ) : (
              <div className="threads-avatar-placeholder">
                {post.avatarText || (post.username[0] || 'A').toUpperCase()}
              </div>
            )}
          </div>
          <div className="threads-post-line" />
          <div className="threads-post-loop-dot">
            {comments.length > 0 ? (
              <span className="threads-loop-badge">{comments.length}</span>
            ) : (
              <span className="threads-loop-circle" />
            )}
          </div>
        </div>

        {/* Right Column: User Info, Category Tag, Text, Optional Media, Actions, Activity */}
        <div className="threads-post-right">
          {/* Header Row: Author Name, Handle, Tag, Time, Options */}
          <div className="threads-post-header">
            <div className="threads-post-author-info">
              <span className="threads-post-author-name">{post.username}</span>
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
              <span className="threads-post-dot">•</span>
              <span className="threads-post-time">{post.timeAgo}</span>
            </div>

            <div className="threads-post-header-actions">
              {(isOwner || Boolean(onDelete)) && (
                <button
                  type="button"
                  className="threads-quick-delete-btn"
                  onClick={handleDelete}
                  title="Delete post"
                  aria-label="Delete post"
                >
                  🗑️
                </button>
              )}
              <button
                type="button"
                className="insta-more-btn threads-more-btn"
                aria-label="More options"
                onClick={() => setShowOptions(true)}
              >
                <InstagramMoreIcon size={18} />
              </button>
            </div>
          </div>

          {/* Location pill if tagged */}
          {post.location && (
            <div className="threads-post-location">
              <InstagramLocationIcon size={12} />
              <span>{post.location}</span>
            </div>
          )}

          {/* Post Text Body */}
          <div className="threads-post-body">
            <p className="threads-post-text">{post.caption}</p>
          </div>

          {/* Optional Media Container:
              ONLY rendered if an image or document is present!
              If NO picture is uploaded, NOTHING is shown here. No black boxes, no placeholders. */}
          {hasMedia && (
            <div className="threads-media-wrapper">
              {post.documentUrl ? (
                <div
                  className="threads-pdf-card"
                  onClick={() => setPostDetailsOpen(true)}
                >
                  <span className="insta-pdf-badge">PDF</span>
                  <div className="threads-pdf-info">
                    <strong>{post.imageCaption?.replace(/^PDF document · /, '') || 'Campus document'}</strong>
                    <span>Open post details to view the document</span>
                  </div>
                </div>
              ) : post.imageUrl && !mediaUnavailable ? (
                <div
                  className="threads-image-container insta-media-container"
                  onClick={() => setPostDetailsOpen(true)}
                  onDoubleClick={handleDoubleTap}
                >
                  <img
                    src={post.imageUrl}
                    alt={post.imageCaption || `Photo by ${post.username}`}
                    className="threads-image-img insta-media-img"
                    loading="lazy"
                    onError={() => setMediaUnavailable(true)}
                  />
                  {/* Popping Heart Animation on Double Tap */}
                  {showHeartAnim && (
                    <div className="insta-heart-overlay">
                      <InstagramLikeIcon filled={true} size={72} />
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Action Icons Bar (Threads Style: Heart, Speech, Repost, Share, Save) */}
          <div className="threads-actions-bar insta-actions-bar">
            <div className="threads-actions-left insta-actions-left">
              <button
                type="button"
                className={`threads-action-btn insta-action-btn ${liked ? 'liked' : ''}`}
                onClick={handleLikeToggle}
                aria-label={liked ? 'Unlike' : 'Like'}
              >
                <InstagramLikeIcon filled={liked} size={20} />
                {likes > 0 && <span className="threads-count-num">{likes}</span>}
              </button>

              <button
                type="button"
                className="threads-action-btn insta-action-btn"
                aria-label="Comment"
                onClick={() => setCommentsOpen(true)}
              >
                <InstagramCommentIcon size={20} />
                {commentsCount > 0 && <span className="threads-count-num">{commentsCount}</span>}
              </button>

              <button
                type="button"
                className={`threads-action-btn insta-action-btn insta-repost-btn ${reposted ? 'reposted' : ''}`}
                aria-label={reposted ? 'Undo repost' : 'Repost'}
                aria-pressed={reposted}
                onClick={handleRepost}
              >
                <RepostIcon active={reposted} size={22} />
                {reposts > 0 && <span className="threads-count-num">{reposts}</span>}
              </button>

              <button
                type="button"
                className="threads-action-btn insta-action-btn"
                aria-label="Share"
                onClick={handleShare}
              >
                <InstagramShareIcon size={20} />
              </button>
            </div>

            <button
              type="button"
              className={`threads-action-btn insta-action-btn ${isSaved ? 'saved' : ''}`}
              onClick={handleSaveToggle}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark post'}
              title={isSaved ? 'Remove from saved' : 'Save post'}
            >
              <InstagramSaveIcon filled={isSaved} size={20} />
            </button>
          </div>

          {/* Thread Activity Stats */}
          <div className="threads-activity-line">
            <span>{likes} {likes === 1 ? 'like' : 'likes'}</span>
            <span>•</span>
            <span className="threads-replies-link" onClick={() => setCommentsOpen(true)}>
              {commentsCount} {commentsCount === 1 ? 'reply' : 'replies'}
            </span>
            {reposts > 0 && (
              <>
                <span>•</span>
                <span>{reposts} reposts</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Comments Dialog (Threads Style) */}
      {commentsOpen && (
        <div
          className="insta-comments-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCommentsOpen(false);
          }}
        >
          <section className="insta-comments-dialog" role="dialog" aria-modal="true" aria-labelledby={`comments-title-${post.id}`}>
            <header className="insta-comments-header">
              <h2 id={`comments-title-${post.id}`}>Replies to @{post.username}</h2>
              <button className="insta-comments-close" aria-label="Close comments" onClick={() => setCommentsOpen(false)}>×</button>
            </header>

            <div className="insta-comments-list">
              {comments.length === 0 ? (
                <p className="insta-comments-empty">No replies yet. Be the first to start the thread.</p>
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
                  <img src={commentImage} alt="Selected preview" />
                  <button type="button" aria-label="Remove image" onClick={() => setCommentImage('')}>×</button>
                  <span>Preview only</span>
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
                  placeholder="Reply to thread..."
                  aria-label="Reply to thread"
                />
                <button type="submit" className="insta-comment-post" disabled={!comment.trim() && !commentImage}>
                  Post
                </button>
              </form>
            </div>
          </section>
        </div>
      )}

      {/* Options & Action Dialog */}
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
                <button className="insta-modal-item" onClick={handleSaveToggle}>
                  {isSaved ? '★ Remove from Saved Posts' : '☆ Save Post to Bookmarks'}
                </button>
                <button className="insta-modal-item" onClick={handleCopyLink}>
                  📋 Copy Link
                </button>
                <button className="insta-modal-item" onClick={handleShare}>
                  ↗ Share Post
                </button>
                {(isOwner || Boolean(onDelete)) && (
                  <button
                    className="insta-modal-item danger"
                    onClick={handleDelete}
                    style={{ color: '#ef4444', fontWeight: 700 }}
                  >
                    🗑️ Delete Post
                  </button>
                )}
                <button className="insta-modal-item danger" onClick={handleReport}>
                  ⚠️ Report Post
                </button>
                <button className="insta-modal-item cancel" onClick={() => setShowOptions(false)}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Post Details / Media Zoom Dialog */}
      {postDetailsOpen && hasMedia && (
        <div
          className="insta-detail-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPostDetailsOpen(false);
          }}
        >
          <section className="insta-detail-dialog" role="dialog" aria-modal="true" aria-label={`Post by ${post.username}`}>
            <button className="insta-detail-close" aria-label="Close" onClick={() => setPostDetailsOpen(false)}>×</button>
            {post.documentUrl ? (
              <div className="insta-pdf-preview insta-pdf-detail">
                <span className="insta-pdf-badge">PDF</span>
                <strong>{post.imageCaption?.replace(/^PDF document · /, '') || 'Campus document'}</strong>
                <a href={post.documentUrl} target="_blank" rel="noreferrer">Open PDF in new tab</a>
              </div>
            ) : post.imageUrl && !mediaUnavailable ? (
              <img src={post.imageUrl} alt={post.imageCaption || `Photo by ${post.username}`} onError={() => setMediaUnavailable(true)} />
            ) : null}
            <div className="insta-detail-caption">
              <strong>{post.username}</strong>{' '}{post.caption}
              {post.location && <span className="insta-location"><InstagramLocationIcon size={13} />{post.location}</span>}
              <button className="insta-comments-link" onClick={() => { setPostDetailsOpen(false); setCommentsOpen(true); }}>
                View replies
              </button>
            </div>
          </section>
        </div>
      )}

      {localToast && <div className="insta-toast" role="status">{localToast}</div>}
    </article>
  );
}
