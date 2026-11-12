'use client';

import React, { useEffect, useState } from 'react';
import { compressImageFile } from '../lib/image_compressor';
import { Glyph } from './Glyph';

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
  likedBy?: string[] | string;
  caption: string;
  commentsCount: number;
  comments?: MomentComment[];
  timeAgo: string;
  durationDays?: number;
}

export interface MomentCardProps {
  currentUserEmail?: string;
  currentUsername?: string;
  isAdmin?: boolean;
  onRepost?: (post: MomentPost) => void;
  post: MomentPost;
  onToast?: (message: string) => void;
  isSaved?: boolean;
  onSaveToggle?: (postId: string) => void;
  isOwner?: boolean;
  onDelete?: (postId: string) => void;
  onPostUpdated?: (updatedPost: MomentPost) => void;
}

export function MomentCard({
  post,
  currentUserEmail,
  currentUsername,
  isAdmin = false,
  onRepost,
  onToast,
  isSaved: externalIsSaved,
  onSaveToggle,
  isOwner = false,
  onDelete,
  onPostUpdated,
}: MomentCardProps) {
  const cleanUserEmail = (currentUserEmail || '').toLowerCase().trim();
  const initialLiked = Array.isArray(post.likedBy) && cleanUserEmail ? post.likedBy.includes(cleanUserEmail) : false;
  const [liked, setLiked] = useState(initialLiked);
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

  // Sync state whenever post prop changes (e.g. from server polling / refresh)
  useEffect(() => {
    setLikes((prev) => Math.max(prev, post.likesCount ?? 0));
    setComments((prev) => {
      const serverCmts = Array.isArray(post.comments) ? post.comments : [];
      if (serverCmts.length === 0) return prev;
      const ids = new Set(serverCmts.map((c) => c.id));
      const combined = [...serverCmts];
      for (const p of prev) {
        if (p && p.id && !ids.has(p.id)) combined.push(p);
      }
      return combined;
    });
    setCommentsCount((prev) => Math.max(prev, post.commentsCount ?? (post.comments?.length ?? 0)));
    setReposts(post.repostsCount ?? 0);
    if (Array.isArray(post.likedBy) && cleanUserEmail) {
      setLiked(post.likedBy.includes(cleanUserEmail));
    }
  }, [post.id, post.likesCount, post.comments, post.commentsCount, post.repostsCount, post.likedBy, cleanUserEmail]);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [postDetailsOpen, setPostDetailsOpen] = useState(false);
  const [mediaUnavailable, setMediaUnavailable] = useState(false);
  const [following, setFollowing] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [localToast, setLocalToast] = useState('');

  const cleanPostEmail = (post.authorEmail || '').toLowerCase().trim();
  const isPostAuthor = Boolean(
    isOwner ||
    (cleanPostEmail && cleanUserEmail && cleanPostEmail === cleanUserEmail) ||
    (post.username && currentUsername && post.username.toLowerCase() === currentUsername.toLowerCase()) ||
    post.username === 'you'
  );
  const isMajorAdmin = Boolean(
    isAdmin ||
    cleanUserEmail === '325506402371@andhrauniversity.edu.in' ||
    cleanUserEmail.startsWith('325506402371')
  );
  const canDelete = Boolean(onDelete) && (isPostAuthor || isMajorAdmin);

  const notify = (message: string) => {
    if (onToast) onToast(message);
    else setLocalToast(message);
  };

  useEffect(() => {
    if (!postDetailsOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPostDetailsOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [postDetailsOpen]);

  useEffect(() => {
    if (!localToast) return;
    const timeout = window.setTimeout(() => setLocalToast(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [localToast]);

  const handleLikeToggle = async () => {
    const nextLiked = !liked;
    const nextLikes = Math.max(0, likes + (nextLiked ? 1 : -1));
    setLiked(nextLiked);
    setLikes(nextLikes);

    const updatedLikedBy = Array.isArray(post.likedBy) ? [...post.likedBy] : [];
    if (cleanUserEmail) {
      if (nextLiked && !updatedLikedBy.includes(cleanUserEmail)) {
        updatedLikedBy.push(cleanUserEmail);
      } else if (!nextLiked) {
        const idx = updatedLikedBy.indexOf(cleanUserEmail);
        if (idx !== -1) updatedLikedBy.splice(idx, 1);
      }
    }

    if (onPostUpdated) {
      onPostUpdated({
        ...post,
        likesCount: nextLikes,
        likedBy: updatedLikedBy,
      });
    }

    try {
      const res = await fetch('/api/feed', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like',
          postId: post.id,
          userEmail: cleanUserEmail || 'student@andhrauniversity.edu.in',
          postDetails: {
            caption: post.caption,
            username: post.username,
            imageUrl: post.imageUrl,
            imageCaption: post.imageCaption,
            avatarText: post.avatarText,
            authorEmail: post.authorEmail,
            authorHandle: post.authorHandle,
            category: post.category,
            location: post.location,
            isOfficial: post.isOfficial,
            timeAgo: post.timeAgo,
            likesCount: nextLikes,
            likedBy: updatedLikedBy,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.likesCount === 'number') {
          const finalLikes = Math.max(data.likesCount, nextLikes);
          setLikes(finalLikes);
          setLiked(Boolean(data.liked));
          if (onPostUpdated) {
            onPostUpdated({
              ...post,
              likesCount: finalLikes,
              likedBy: data.likedBy || updatedLikedBy,
            });
          }
        }
      }
    } catch {}
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

  const handleRepost = async () => {
    const wasReposted = reposted;
    setReposted(!wasReposted);
    setReposts((count) => Math.max(0, count + (wasReposted ? -1 : 1)));
    notify(wasReposted ? 'Repost removed.' : 'Post reposted to campus.');

    if (!wasReposted) {
      try {
        const res = await fetch('/api/feed', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'repost',
            postId: post.id,
            user: {
              email: cleanUserEmail,
              name: currentUsername || 'AU Student',
              username: currentUsername || 'au.student',
            },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (onRepost && data.repost) {
            onRepost(data.repost);
          }
        }
      } catch (e) {
        console.error('Failed to sync repost with server', e);
      }
    }
  };

  const handleCommentImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCommentError('Choose an image file to attach.');
      return;
    }

    try {
      const compressed = await compressImageFile(file, 800, 0.8);
      setCommentImage(compressed);
      setCommentError('');
    } catch {
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
    }
  };

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = comment.trim();
    if (!text && !commentImage) return;

    const newCommentItem: MomentComment = {
      id: `${Date.now()}`,
      username: currentUsername || 'you',
      avatarText: currentUsername ? currentUsername[0].toUpperCase() : 'Y',
      text,
      timeAgo: 'now',
      ...(commentImage ? { imageUrl: commentImage } : {}),
    };
    const nextComments = [...comments, newCommentItem];
    const nextCount = commentsCount + 1;
    setComments(nextComments);
    setCommentsCount(nextCount);
    setComment('');
    setCommentImage('');
    setCommentError('');

    if (onPostUpdated) {
      onPostUpdated({
        ...post,
        comments: nextComments,
        commentsCount: nextCount,
      });
    }

    try {
      const res = await fetch('/api/feed', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          postId: post.id,
          comment: {
            ...newCommentItem,
            authorEmail: cleanUserEmail,
          },
          postDetails: {
            caption: post.caption,
            username: post.username,
            imageUrl: post.imageUrl,
            imageCaption: post.imageCaption,
            avatarText: post.avatarText,
            authorEmail: post.authorEmail,
            authorHandle: post.authorHandle,
            category: post.category,
            location: post.location,
            isOfficial: post.isOfficial,
            timeAgo: post.timeAgo,
            likesCount: likes,
            likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
            comments: nextComments,
            commentsCount: nextCount,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.comments)) {
          const sIds = new Set(data.comments.map((c: any) => c.id));
          const allCmts = [...data.comments];
          for (const c of nextComments) {
            if (c && c.id && !sIds.has(c.id)) allCmts.push(c);
          }
          const finalCount = Math.max(allCmts.length, nextCount);
          setComments(allCmts);
          setCommentsCount(finalCount);
          if (onPostUpdated) {
            onPostUpdated({
              ...post,
              comments: allCmts,
              commentsCount: finalCount,
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to sync comment with server', e);
    }
  };

  if (hidden) return null;

  const hasMedia = Boolean(post.documentUrl || (post.imageUrl && !mediaUnavailable));

  // Safety Gate: If a post has no caption, no image caption, and no media, do not render a blank ghost card
  if (!Boolean(post.caption?.trim()) && !Boolean(post.imageCaption?.trim()) && !hasMedia) {
    return null;
  }

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
          {/* Header Row: Author Name, Handle, Tag, Time, Geotag, Options */}
          <div className="threads-post-header">
            <div className="threads-post-author-info">
              <div className="threads-author-topline">
                <span className="threads-post-author-name">{post.username}</span>
                {post.isOfficial && (
                  <span className="insta-verified-badge" title="Verified Campus Official">
                    <Glyph n="check" />
                  </span>
                )}
                {post.category === 'problem' && (
                  <span className="post-category-tag problem"><Glyph n="warn" /> Problem</span>
                )}
                {post.category === 'announcement' && (
                  <span className="post-category-tag announcement"><Glyph n="megaphone" /> Notice</span>
                )}
                <span className="threads-post-dot">•</span>
                <span className="threads-post-time">{post.timeAgo}</span>
              </div>
              {post.location && (
                <div className="threads-post-location" title={`Tagged at ${post.location}`}>
                  <Glyph n="pin" size={11} />
                  <span>{post.location}</span>
                </div>
              )}
            </div>

            <div className="threads-post-header-actions">
              {canDelete && (
                <button
                  type="button"
                  className="threads-quick-delete-btn"
                  onClick={handleDelete}
                  title="Delete post"
                  aria-label="Delete post"
                >
                  <Glyph n="trash" />
                </button>
              )}
              <button
                type="button"
                className="insta-more-btn threads-more-btn"
                aria-label="More options"
                onClick={() => setShowOptions(true)}
              >
                <Glyph n="more" size={18} />
              </button>
            </div>
          </div>

          {/* Post Text Body */}
          {(Boolean(post.caption?.trim()) || Boolean(post.imageCaption?.trim())) && (
            <div className="threads-post-body">
              <p className="threads-post-text">{post.caption || post.imageCaption}</p>
            </div>
          )}

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
                      <Glyph n="heart" filled size={72} />
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
                <Glyph n="heart" filled={liked} size={20} />
                {likes > 0 && <span className="threads-count-num">{likes}</span>}
              </button>

              <button
                type="button"
                className="threads-action-btn insta-action-btn"
                aria-label="Comment"
                onClick={() => setCommentsOpen(!commentsOpen)}
              >
                <Glyph n="chat" size={20} />
                {commentsCount > 0 && <span className="threads-count-num">{commentsCount}</span>}
              </button>

              <button
                type="button"
                className={`threads-action-btn insta-action-btn insta-repost-btn ${reposted ? 'reposted' : ''}`}
                aria-label={reposted ? 'Undo repost' : 'Repost'}
                aria-pressed={reposted}
                onClick={handleRepost}
              >
                <Glyph n="repeat" size={22} />
                {reposts > 0 && <span className="threads-count-num">{reposts}</span>}
              </button>

              <button
                type="button"
                className="threads-action-btn insta-action-btn"
                aria-label="Share"
                onClick={handleShare}
              >
                <Glyph n="share" size={20} />
              </button>
            </div>

            <button
              type="button"
              className={`threads-action-btn insta-action-btn ${isSaved ? 'saved' : ''}`}
              onClick={handleSaveToggle}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark post'}
              title={isSaved ? 'Remove from saved' : 'Save post'}
            >
              <Glyph n="bookmark" filled={isSaved} size={20} />
            </button>
          </div>

          {/* Thread Activity Stats */}
          <div className="threads-activity-line">
            <span>{likes} {likes === 1 ? 'like' : 'likes'}</span>
            <span>•</span>
            <span className="threads-replies-link" onClick={() => setCommentsOpen(!commentsOpen)}>
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

      {/* Inline Comments Section: Opens directly below the post so the post is always visible */}
      {commentsOpen && (
        <div className="threads-inline-comments-section">
          <div className="threads-inline-comments-header">
            <span className="threads-inline-comments-title">
              Replies to @{post.username} ({comments.length})
            </span>
            <button
              type="button"
              className="threads-inline-close-btn"
              onClick={() => setCommentsOpen(false)}
              aria-label="Hide replies"
            >
              Hide replies <Glyph n="x" size={12} />
            </button>
          </div>

          <div className="threads-inline-comments-list">
            {comments.length === 0 ? (
              <p className="threads-inline-empty">No replies yet. Be the first to start the thread.</p>
            ) : (
              comments.map((item) => (
                <div className="threads-inline-comment-item" key={item.id}>
                  <div className="threads-inline-comment-avatar" aria-hidden="true">
                    {item.avatarText || (item.username ? item.username[0].toUpperCase() : 'A')}
                  </div>
                  <div className="threads-inline-comment-bubble">
                    <div className="threads-inline-comment-top">
                      <strong className="threads-inline-comment-user">{item.username}</strong>
                      <span className="threads-inline-comment-time">{item.timeAgo}</span>
                    </div>
                    {item.text && <p className="threads-inline-comment-text">{item.text}</p>}
                    {item.imageUrl && (
                      <img
                        className="threads-inline-comment-img"
                        src={item.imageUrl}
                        alt={`Attachment by ${item.username}`}
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="threads-inline-composer">
            {commentImage && (
              <div className="threads-inline-image-preview">
                <img src={commentImage} alt="Selected preview" />
                <button type="button" aria-label="Remove image" onClick={() => setCommentImage('')}>×</button>
              </div>
            )}
            {commentError && <p className="threads-inline-error" role="alert">{commentError}</p>}
            <form className="threads-inline-form" onSubmit={handleCommentSubmit}>
              <div className="threads-inline-current-avatar" aria-hidden="true">
                {currentUsername ? currentUsername[0].toUpperCase() : 'U'}
              </div>
              <label className="threads-inline-attach-btn" aria-label="Attach photo" title="Attach photo">
                <input type="file" accept="image/*" onChange={handleCommentImage} />
                <Glyph n="plus" />
              </label>
              <input
                className="threads-inline-input"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={`Reply to @${post.username}...`}
                aria-label="Reply to post"
              />
              <button
                type="submit"
                className="threads-inline-post-btn"
                disabled={!comment.trim() && !commentImage}
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Options & Action Dialog */}
      {showOptions && (
        <div className="insta-modal-backdrop" onClick={() => setShowOptions(false)}>
          <div className="insta-modal-sheet" onClick={(e) => e.stopPropagation()}>
            {reportSuccess ? (
              <div className="insta-modal-success">
                <span className="insta-modal-check"><Glyph n="check" /></span>
                <p>Thank you for reporting. Campus moderation has been notified.</p>
              </div>
            ) : (
              <>
                <button className="insta-modal-item" onClick={handleSaveToggle}>
                  {isSaved ? <><Glyph n="star" /> Remove from Saved Posts</> : <><Glyph n="bookmark" /> Save Post to Bookmarks</>}
                </button>
                <button className="insta-modal-item" onClick={handleCopyLink}>
                  <Glyph n="clipboard" /> Copy Link
                </button>
                <button className="insta-modal-item" onClick={handleShare}>
                  ↗ Share Post
                </button>
                {canDelete && (
                  <button
                    className="insta-modal-item danger"
                    onClick={handleDelete}
                    style={{ color: '#ef4444', fontWeight: 700 }}
                  >
                    <Glyph n="trash" /> Delete Post
                  </button>
                )}
                <button className="insta-modal-item danger" onClick={handleReport}>
                  <Glyph n="warn" /> Report Post
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
              {post.location && <span className="insta-location"><Glyph n="pin" size={13} />{post.location}</span>}
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
