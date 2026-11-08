import { NextResponse } from 'next/server';
import {
  getAllActivities,
  logServerActivity,
  clearAllActivities,
} from '../auth/account-registry';
import {
  checkRateLimit,
  getClientIp,
  sanitizeText,
  isRequestAuthorizedAsAdmin,
} from '../auth/security';

/**
 * GET /api/activity
 * Returns the real-time activity stream of campus events.
 */
export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`get_activity:${ip}`, 60, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const activities = getAllActivities();
    return NextResponse.json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to retrieve platform activities.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activity
 * Appends a new activity log entry to the central stream.
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`post_activity:${ip}`, 30, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many activity reports.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { action, actor, details } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action title is required.' },
        { status: 400 }
      );
    }

    const activity = logServerActivity(
      sanitizeText(action, 80),
      sanitizeText(actor || 'AU User', 100),
      details ? sanitizeText(details, 300) : undefined
    );

    return NextResponse.json({
      success: true,
      activity,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error logging activity.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/activity
 * Clears the activity log.
 * Strictly restricted to the Head Administrator.
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const adminEmail = url.searchParams.get('adminEmail') || '';
    const isAuthorized = isRequestAuthorizedAsAdmin(req, adminEmail);

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the Head Administrator can clear activity logs.' },
        { status: 403 }
      );
    }

    clearAllActivities();
    return NextResponse.json({
      success: true,
      message: 'All platform activities cleared.',
      activities: [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error clearing activities.' },
      { status: 500 }
    );
  }
}
