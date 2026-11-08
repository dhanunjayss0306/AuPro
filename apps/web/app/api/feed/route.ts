import { NextResponse } from 'next/server';
import {
  getAllPosts,
  addServerPost,
  deleteServerPost,
  logServerActivity,
  togglePostLike,
  addPostComment,
  repostFeedPost,
  ServerFeedPost,
} from '../auth/account-registry';
import {
  checkRateLimit,
  getClientIp,
  sanitizeText,
  sanitizeImageUrl,
  sanitizeEmail,
  isHeadAdmin,
  isRequestAuthorizedAsAdmin,
} from '../auth/security';

/**
 * GET /api/feed
 * Returns all shared campus feed posts across all students and devices.
 */
export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`get_feed:${ip}`, 120, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } }
      );
    }

    const posts = getAllPosts();
    return NextResponse.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to retrieve feed posts.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feed
 * Adds a new student post to the shared campus feed.
 * Protected against XSS, image scheme injection, and unauthorized announcements.
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`post_feed:${ip}`, 20, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Posting too rapidly. Please wait a minute before publishing again.' },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } }
      );
    }

    const body = await req.json();
    const {
      id,
      username,
      authorEmail,
      authorHandle,
      avatarText,
      isOfficial,
      category,
      location,
      imageUrl,
      imageCaption,
      likesCount,
      repostsCount,
      caption,
      commentsCount,
      comments,
      timeAgo,
      durationDays,
    } = body;

    const cleanCaption = sanitizeText(caption, 2000);
    const cleanImageUrl = sanitizeImageUrl(imageUrl);

    if (!cleanCaption && !cleanImageUrl) {
      return NextResponse.json(
        { error: 'Post must have a valid caption or image.' },
        { status: 400 }
      );
    }

    const cleanAuthorEmail = sanitizeEmail(authorEmail);

    // Security Gate: Only the verified Head Administrator can post Official Announcements
    const canPostAnnouncement = isHeadAdmin(cleanAuthorEmail) || isRequestAuthorizedAsAdmin(req, cleanAuthorEmail);
    const effectiveCategory = category === 'announcement'
      ? (canPostAnnouncement ? 'announcement' : 'normal')
      : (category || 'normal');
    const effectiveIsOfficial = Boolean(isOfficial && canPostAnnouncement);

    const postPayload: ServerFeedPost = {
      id: id || 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      username: sanitizeText(username, 100) || 'AU Student',
      authorEmail: cleanAuthorEmail,
      authorHandle: sanitizeText(authorHandle || username, 60) || 'student',
      avatarText: sanitizeText(avatarText, 10) || (username ? username.charAt(0).toUpperCase() : 'A'),
      isOfficial: effectiveIsOfficial,
      category: effectiveCategory,
      location: sanitizeText(location, 120),
      imageUrl: cleanImageUrl,
      imageCaption: sanitizeText(imageCaption, 200),
      likesCount: typeof likesCount === 'number' ? Math.max(0, likesCount) : 0,
      likedBy: [],
      repostsCount: typeof repostsCount === 'number' ? Math.max(0, repostsCount) : 0,
      caption: cleanCaption,
      commentsCount: typeof commentsCount === 'number' ? Math.max(0, commentsCount) : 0,
      comments: Array.isArray(comments) ? comments.slice(0, 50) : [],
      timeAgo: timeAgo || 'Just now',
      durationDays: typeof durationDays === 'number' ? durationDays : 30,
    };

    const saved = addServerPost(postPayload);

    // Log the post activity in the real-time activity stream
    const activityAction = effectiveCategory === 'problem'
      ? 'Campus Problem Reported'
      : effectiveCategory === 'announcement'
      ? 'Official Announcement Published'
      : 'Feed Post Published';

    logServerActivity(
      activityAction,
      cleanAuthorEmail || username || 'AU Student',
      cleanCaption ? cleanCaption.substring(0, 90) : (location || 'Campus post')
    );

    return NextResponse.json({
      success: true,
      post: saved,
      posts: getAllPosts(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error publishing feed post.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/feed
 * Handles real student interactions: real likes, shared comments, and authentic reposts.
 */
export async function PATCH(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`patch_feed:${ip}`, 60, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Interaction rate limit reached. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } }
      );
    }

    const body = await req.json();
    const { action, postId, userEmail, comment, user, postDetails } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required for interactions.' },
        { status: 400 }
      );
    }

    const cleanPostDetails = postDetails ? {
      caption: sanitizeText(postDetails.caption, 2000),
      username: sanitizeText(postDetails.username, 100),
      imageUrl: sanitizeImageUrl(postDetails.imageUrl),
      imageCaption: sanitizeText(postDetails.imageCaption, 200),
      avatarText: sanitizeText(postDetails.avatarText, 10),
      authorEmail: sanitizeEmail(postDetails.authorEmail),
      authorHandle: sanitizeText(postDetails.authorHandle, 60),
      category: postDetails.category,
      location: sanitizeText(postDetails.location, 120),
      isOfficial: Boolean(postDetails.isOfficial),
      timeAgo: sanitizeText(postDetails.timeAgo, 30),
      durationDays: typeof postDetails.durationDays === 'number' ? postDetails.durationDays : 30,
    } : undefined;

    // 1. Real Likes Toggle (Persisted per student email, no automated numbers)
    if (action === 'like') {
      const cleanEmail = sanitizeEmail(userEmail);
      const result = togglePostLike(postId, cleanEmail, cleanPostDetails);
      return NextResponse.json({
        success: true,
        action: 'like',
        postId,
        likesCount: result.likesCount,
        liked: result.liked,
        likedBy: result.likedBy,
      });
    }

    // 2. Real Comments (Visible to everyone across all devices)
    if (action === 'comment') {
      if (!comment || (!comment.text && !comment.imageUrl)) {
        return NextResponse.json(
          { error: 'Comment text or image is required.' },
          { status: 400 }
        );
      }
      const cleanComment = {
        id: comment.id || 'cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        username: sanitizeText(comment.username || comment.author, 100) || 'AU Student',
        authorEmail: sanitizeEmail(comment.authorEmail),
        avatarText: sanitizeText(comment.avatarText, 10) || ((comment.username || comment.author || 'A').charAt(0).toUpperCase()),
        text: sanitizeText(comment.text, 500),
        imageUrl: sanitizeImageUrl(comment.imageUrl),
        timeAgo: sanitizeText(comment.timeAgo, 30) || 'Just now',
      };
      const result = addPostComment(postId, cleanComment, cleanPostDetails);
      return NextResponse.json({
        success: true,
        action: 'comment',
        postId,
        comments: result.comments,
        commentsCount: result.commentsCount,
      });
    }

    // 3. Real Reposts (Post is republished by user and visible to all)
    if (action === 'repost') {
      const newPost = repostFeedPost(postId, user || {});
      if (!newPost) {
        return NextResponse.json(
          { error: 'Original post not found to repost.' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        action: 'repost',
        postId,
        repost: newPost,
        posts: getAllPosts(),
      });
    }

    return NextResponse.json(
      { error: `Unknown interaction action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error processing interaction.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/feed?id=...&userEmail=...
 * Removes a post by ID from the central feed.
 * Strictly checks that the requester is the original author OR the Head Administrator.
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get('id');
    const userEmail = sanitizeEmail(url.searchParams.get('userEmail') || '');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID query parameter is required.' },
        { status: 400 }
      );
    }

    // Find the post to verify author ownership
    const currentPosts = getAllPosts();
    const targetPost = currentPosts.find((p) => p.id === postId);

    if (targetPost) {
      const isAuthor = Boolean(userEmail && targetPost.authorEmail && targetPost.authorEmail.toLowerCase() === userEmail);
      const isAdmin = isHeadAdmin(userEmail) || isRequestAuthorizedAsAdmin(req, userEmail);

      if (!isAuthor && !isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized: Only the author of this post or the Head Administrator can delete it.' },
          { status: 403 }
        );
      }
    }

    deleteServerPost(postId);
    return NextResponse.json({
      success: true,
      message: `Post ${postId} deleted.`,
      posts: getAllPosts(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error deleting post.' },
      { status: 500 }
    );
  }
}
