import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'aupro-andhra-university-otp-signing-secret-2026';

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
      return NextResponse.json(
        { error: 'Invalid verification code. Please check your 6-digit code or request a new one.' },
        { status: 400 }
      );
    }

    // Verified! Generate proof of verification timestamp
    return NextResponse.json({
      success: true,
      verified: true,
      email: cleanEmail,
      verifiedAt: new Date().toISOString(),
      message: 'Student email verified successfully. Account activated.',
    });
  } catch (err: any) {
    console.error('verify-otp error:', err);
    return NextResponse.json(
      { error: err?.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
