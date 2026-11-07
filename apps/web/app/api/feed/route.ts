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

/**
 * GET /api/feed
 * Returns all shared campus feed posts across all students and devices.
 */
export async function GET() {
  try {
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
 */
export async function POST(req: Request) {
  try {
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

    if (!caption && !imageUrl) {
      return NextResponse.json(
        { error: 'Post must have a caption or image.' },
        { status: 400 }
      );
    }

    const postPayload: ServerFeedPost = {
      id: id || 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      username: username || 'AU Student',
      authorEmail: authorEmail || '',
      authorHandle: authorHandle || username || 'student',
      avatarText: avatarText || (username ? username.charAt(0).toUpperCase() : 'A'),
      isOfficial: Boolean(isOfficial),
      category: category || 'normal',
      location: location || '',
      imageUrl: imageUrl || '',
      imageCaption: imageCaption || '',
      likesCount: typeof likesCount === 'number' ? likesCount : 0,
      likedBy: authorEmail ? [] : [],
      repostsCount: typeof repostsCount === 'number' ? repostsCount : 0,
      caption: caption || '',
      commentsCount: typeof commentsCount === 'number' ? commentsCount : 0,
      comments: Array.isArray(comments) ? comments : [],
      timeAgo: timeAgo || 'Just now',
      durationDays: typeof durationDays === 'number' ? durationDays : 30,
    };

    const saved = addServerPost(postPayload);

    // Log the post activity in the real-time activity stream
    const activityAction = category === 'problem'
      ? 'Campus Problem Reported'
      : category === 'announcement'
      ? 'Official Announcement Published'
      : 'Feed Post Published';

    logServerActivity(
      activityAction,
      authorEmail || username || 'AU Student',
      caption ? caption.substring(0, 90) : (location || 'Campus post')
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
    const body = await req.json();
    const { action, postId, userEmail, comment, user } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required for interactions.' },
        { status: 400 }
      );
    }

    // 1. Real Likes Toggle (Persisted per student email, no automated numbers)
    if (action === 'like') {
      const result = togglePostLike(postId, userEmail);
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
      const result = addPostComment(postId, comment);
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
 * DELETE /api/feed?id=...
 * Removes a post by ID from the central feed.
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID query parameter is required.' },
        { status: 400 }
      );
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
