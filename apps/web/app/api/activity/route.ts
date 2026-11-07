import { NextResponse } from 'next/server';
import {
  getAllActivities,
  logServerActivity,
  clearAllActivities,
} from '../auth/account-registry';

/**
 * GET /api/activity
 * Returns the real-time activity stream of campus events.
 */
export async function GET() {
  try {
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
    const body = await req.json();
    const { action, actor, details } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action title is required.' },
        { status: 400 }
      );
    }

    const activity = logServerActivity(
      String(action),
      String(actor || 'AU User'),
      details ? String(details) : undefined
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
 */
export async function DELETE() {
  try {
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
