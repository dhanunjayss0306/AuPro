import { NextResponse } from 'next/server';
import {
  getAllAccounts,
  findAccount,
  registerAccount,
  removeAccount,
  purgeAllAccountsExceptHead,
  logServerActivity,
  MAIN_ADMIN_EMAIL,
} from '../auth/account-registry';
import {
  checkRateLimit,
  getClientIp,
  sanitizeEmail,
  sanitizeText,
  isRequestAuthorizedAsAdmin,
  isHeadAdmin,
  isHod,
} from '../auth/security';
import { NOT_IN_CSE_LIST_MESSAGE, lookupCseStudentByEmail } from '../../lib/cse-students';

/**
 * GET /api/accounts
 * Returns all verified registered accounts on the university portal.
 */
export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`get_accounts:${ip}`, 60, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } }
      );
    }

    const accounts = getAllAccounts();
    return NextResponse.json({
      success: true,
      count: Object.keys(accounts).length,
      accounts,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to retrieve accounts registry.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounts
 * Registers or updates a student account in the central database.
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`post_accounts:${ip}`, 30, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many account modification requests. Please wait a minute.' },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } }
      );
    }

    const body = await req.json();
    const { email, name, rollNo, department, year, phone, bio } = body;

    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      return NextResponse.json(
        { error: 'Valid student email is required.' },
        { status: 400 }
      );
    }

    // Only second-year CSE students may be registered. The Head
    // Administrator and HODs are exempt; everyone else must be in the
    // directory (the registerAccount call refuses them too).
    if (!isHeadAdmin(cleanEmail) && !isHod(cleanEmail) && !lookupCseStudentByEmail(cleanEmail)) {
      return NextResponse.json({ error: NOT_IN_CSE_LIST_MESSAGE }, { status: 403 });
    }

    const success = registerAccount(cleanEmail, {
      name: sanitizeText(name, 120),
      rollNo: sanitizeText(rollNo, 50),
      department: sanitizeText(department, 100),
      year: sanitizeText(year, 50),
      phone: sanitizeText(phone, 30),
      bio: sanitizeText(bio, 500),
    });

    if (success) {
      const stored = findAccount(cleanEmail);
      logServerActivity(
        'Account Registered',
        cleanEmail,
        `Student profile registered for ${stored?.name || name || 'AU Student'} (${stored?.rollNo || rollNo || 'ID pending'}, ${stored?.department || department || 'AU Eng'})`
      );
      const accounts = getAllAccounts();
      return NextResponse.json({
        success: true,
        account: accounts[cleanEmail],
      });
    }

    return NextResponse.json(
      { error: 'Failed to register account.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error registering account.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounts?email=... OR ?purgeAll=true
 * Deletes a student account or resets all accounts except the Head Master account.
 * Strictly protected: Requires Head Administrator authorization.
 */
export async function DELETE(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`del_accounts:${ip}`, 20, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many administrative requests. Please wait a minute.' },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } }
      );
    }

    const url = new URL(req.url);
    const purgeAll = url.searchParams.get('purgeAll') === 'true';
    const email = url.searchParams.get('email');
    const adminEmail = url.searchParams.get('adminEmail') || '';

    // Enforce Head Administrator authorization
    const isAuthorized = isRequestAuthorizedAsAdmin(req, adminEmail);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the Head Administrator may delete or purge student accounts.' },
        { status: 403 }
      );
    }

    if (purgeAll) {
      purgeAllAccountsExceptHead();
      logServerActivity(
        'Purged All Accounts (Admin)',
        MAIN_ADMIN_EMAIL,
        'Reset platform registry to Head Account only'
      );
      return NextResponse.json({
        success: true,
        message: 'All accounts except Head Account purged successfully.',
        accounts: getAllAccounts(),
      });
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Target email query parameter is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeEmail(email);
    if (cleanEmail === MAIN_ADMIN_EMAIL || cleanEmail.startsWith('325506402371')) {
      return NextResponse.json(
        { error: 'Cannot delete the Head Master Account.' },
        { status: 403 }
      );
    }

    const success = removeAccount(cleanEmail);
    if (success) {
      logServerActivity(
        'Account Removed (Admin)',
        MAIN_ADMIN_EMAIL,
        `Removed student account for ${cleanEmail}`
      );
      return NextResponse.json({
        success: true,
        message: `Account ${cleanEmail} removed successfully.`,
        accounts: getAllAccounts(),
      });
    }

    return NextResponse.json(
      { error: 'Account not found or could not be removed.' },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error removing account.' },
      { status: 500 }
    );
  }
}
