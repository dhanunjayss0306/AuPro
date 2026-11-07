import { NextResponse } from 'next/server';
import {
  getAllAccounts,
  registerAccount,
  removeAccount,
  purgeAllAccountsExceptHead,
  logServerActivity,
  MAIN_ADMIN_EMAIL,
} from '../auth/account-registry';

/**
 * GET /api/accounts
 * Returns all verified registered accounts on the university portal.
 */
export async function GET() {
  try {
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
    const body = await req.json();
    const { email, name, rollNo, department, year, phone, bio } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Student email is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const success = registerAccount(cleanEmail, {
      name,
      rollNo,
      department,
      year,
      phone,
      bio,
    });

    if (success) {
      logServerActivity(
        'Account Registered',
        cleanEmail,
        `Student profile registered for ${name || 'AU Student'} (${rollNo || 'ID pending'}, ${department || 'AU Eng'})`
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
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const purgeAll = url.searchParams.get('purgeAll') === 'true';
    const email = url.searchParams.get('email');

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

    const cleanEmail = email.toLowerCase().trim();
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
