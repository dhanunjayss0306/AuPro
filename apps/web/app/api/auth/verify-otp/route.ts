import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { registerAccount, findAccount, logServerActivity } from '../account-registry';
import { signSessionToken, isHeadAdmin, isHod } from '../security';
import {
  CSE_DEPARTMENT,
  CSE_YEAR,
  NOT_IN_CSE_LIST_MESSAGE,
  lookupCseStudentByEmail,
} from '../../../lib/cse-students';

const COLLEGE_DOMAIN = '@andhrauniversity.edu.in';
const AUTH_SECRET = process.env.AUTH_SECRET || 'aupro-andhra-university-otp-signing-secret-2026';

// Brute-force protection: Max 5 failed attempts per IP/Email within 10 minutes
const failedAttemptsMap = new Map<string, { count: number; resetAt: number }>();

function isBruteForceLocked(key: string, maxFails = 5): boolean {
  const now = Date.now();
  const rec = failedAttemptsMap.get(key);
  if (!rec) return false;
  if (now > rec.resetAt) {
    failedAttemptsMap.delete(key);
    return false;
  }
  return rec.count >= maxFails;
}

function recordFailure(key: string, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const rec = failedAttemptsMap.get(key);
  if (!rec || now > rec.resetAt) {
    failedAttemptsMap.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    rec.count += 1;
  }
}

function clearFailures(key: string) {
  failedAttemptsMap.delete(key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, token } = body;

    if (!email || !otp || !token) {
      return NextResponse.json(
        { error: 'Email, OTP, and verification token are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Enforce College Domain
    if (!cleanEmail.endsWith(COLLEGE_DOMAIN)) {
      return NextResponse.json(
        { error: `Verification is strictly restricted to official ${COLLEGE_DOMAIN} email addresses.` },
        { status: 403 }
      );
    }

    // Check rate limit & lockout
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const lockKey = `${ip}:${cleanEmail}`;

    if (isBruteForceLocked(lockKey, 5)) {
      return NextResponse.json(
        { error: 'Account temporarily locked due to multiple failed verification attempts. Please wait 10 minutes.' },
        { status: 429 }
      );
    }

    // Decode token
    let tokenData: { email: string; expiresAt: number; hmac: string };
    try {
      const decodedJson = Buffer.from(token, 'base64url').toString('utf8');
      tokenData = JSON.parse(decodedJson);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or corrupted verification session. Please request a new code.' },
        { status: 400 }
      );
    }

    // Verify email matches token
    if (tokenData.email !== cleanEmail) {
      return NextResponse.json(
        { error: 'Verification token does not match the provided email address.' },
        { status: 400 }
      );
    }

    // Check expiration
    if (Date.now() > tokenData.expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired (valid for 10 minutes). Please request a new code.' },
        { status: 400 }
      );
    }

    // Recompute HMAC with supplied OTP
    const expectedPayload = `${cleanEmail}:${cleanOtp}:${tokenData.expiresAt}`;
    const expectedHmac = crypto.createHmac('sha256', AUTH_SECRET).update(expectedPayload).digest('hex');

    // Constant-time comparison to prevent timing attacks
    const hmacBuffer = Buffer.from(tokenData.hmac, 'hex');
    const expectedBuffer = Buffer.from(expectedHmac, 'hex');

    if (hmacBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(hmacBuffer, expectedBuffer)) {
      recordFailure(lockKey);
      return NextResponse.json(
        { error: 'Invalid verification code. Please check your 6-digit code or request a new one.' },
        { status: 400 }
      );
    }

    // Verified! Clear any previous failed attempts
    clearFailures(lockKey);

    // Resolve the profile from the second-year CSE directory: the email's
    // local part IS the roll number, so name, roll number, department,
    // year and section attach automatically. The Head Administrator and
    // HOD accounts are exempt and keep the supplied/existing profile.
    const isExempt = isHeadAdmin(cleanEmail) || isHod(cleanEmail);
    let directoryProfile: { name: string; rollNo: string; department: string; year: string; section: string } | null = null;
    if (!isExempt) {
      const student = lookupCseStudentByEmail(cleanEmail);
      if (!student) {
        return NextResponse.json({ error: NOT_IN_CSE_LIST_MESSAGE }, { status: 403 });
      }
      directoryProfile = {
        name: student.name,
        rollNo: student.rollNo,
        department: CSE_DEPARTMENT,
        year: CSE_YEAR,
        section: student.section,
      };
    }

    // Register account in registry to prevent duplicate accounts and sync across all devices.
    // For directory students the profile comes ONLY from the directory —
    // client-supplied name / roll number / department / year are ignored.
    const profileData = isExempt
      ? body.profile || {
          name: body.fullName || body.name,
          rollNo: body.rollNo,
          department: body.department,
          year: body.year,
          phone: body.phone,
        }
      : {
          ...directoryProfile,
          username: body.profile?.username || body.username,
          phone: body.profile?.phone || body.phone,
        };
    const registered = registerAccount(cleanEmail, profileData);
    if (!registered) {
      return NextResponse.json({ error: NOT_IN_CSE_LIST_MESSAGE }, { status: 403 });
    }
    // The resolved profile goes back to the client so it can show the
    // attached details (name, roll number, year, section) — never typed.
    const stored = findAccount(cleanEmail);
    const responseProfile = stored
      ? {
          name: stored.name,
          rollNo: stored.rollNo,
          department: stored.department,
          year: stored.year,
          section: stored.section,
          email: stored.email,
        }
      : directoryProfile;
    logServerActivity(
      'Account Verified & Activated',
      cleanEmail,
      `Student ${profileData.name || cleanEmail} verified identity via 6-digit OTP`
    );

    // Verified! Generate proof of verification timestamp & signed session token
    const role = isHeadAdmin(cleanEmail) ? 'head_admin' : isHod(cleanEmail) ? 'hod' : 'student';
    const sessionToken = signSessionToken(cleanEmail, role);

    const response = NextResponse.json({
      success: true,
      verified: true,
      email: cleanEmail,
      role,
      profile: responseProfile,
      sessionToken,
      verifiedAt: new Date().toISOString(),
      message: 'Student email verified successfully. Account activated.',
    });

    // Set secure HTTP-only session cookie
    response.cookies.set('aupro_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    console.error('verify-otp error:', err);
    return NextResponse.json(
      { error: err?.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
