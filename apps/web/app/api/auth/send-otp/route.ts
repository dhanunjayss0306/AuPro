import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { isAccountRegistered, MAIN_ADMIN_EMAIL } from '../account-registry';

// College domain enforcement
const COLLEGE_DOMAIN = '@andhrauniversity.edu.in';
const AUTH_SECRET = process.env.AUTH_SECRET || 'aupro-andhra-university-otp-signing-secret-2026';

// In-Memory Rate Limiting (Protects against brute force and email spam)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

function checkRateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

function generate6DigitOtp(): string {
  // Generates cryptographically secure 6-digit numeric code (100000 to 999999)
  return crypto.randomInt(100000, 1000000).toString();
}

function createVerificationToken(email: string, otp: string, expiresAt: number): string {
  const payload = `${email.toLowerCase().trim()}:${otp}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  const tokenData = {
    email: email.toLowerCase().trim(),
    expiresAt,
    hmac,
  };
  return Buffer.from(JSON.stringify(tokenData)).toString('base64url');
}

function getEmailHtml(name: string, otp: string, rollNo: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AuPro Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; overflow: hidden;" cellspacing="0" cellpadding="0">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">AuPro</h1>
              <p style="margin: 6px 0 0 0; color: #bfdbfe; font-size: 13px; font-weight: 500;">Andhra University College of Engineering</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 24px;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; font-weight: 700;">Student Email Verification</h2>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Hello <strong>${name || 'Student'}</strong>${rollNo ? ` (Roll No: <strong>${rollNo}</strong>)` : ''},
              </p>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Use the following 6-digit one-time verification code to verify and activate your official Andhra University student account:
              </p>
              
              <!-- Code Card -->
              <div style="background-color: #f8fafc; border: 2px dashed #93c5fd; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 8px; font-weight: 600;">Your One-Time Password (OTP)</div>
                <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1e3a8a; padding: 4px 0;">
                  ${otp}
                </div>
                <div style="font-size: 12px; color: #dc2626; margin-top: 8px; font-weight: 500;">Expires in 10 minutes</div>
              </div>

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 12px 14px; margin-bottom: 24px;">
                <p style="margin: 0; color: #1e40af; font-size: 12px; line-height: 1.5;">
                  <strong>Identity Security:</strong> This one-time verification ensures that your student roll number cannot be used by anyone else on campus. Never share this code.
                </p>
              </div>

              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                If you did not request this code, you can safely ignore this email. No account will be activated without this code.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.4;">
                Andhra University College of Engineering • Visakhapatnam - 530003, A.P., India<br>
                Official Student Portal Verification
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

async function sendViaResend(email: string, name: string, otp: string, rollNo: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: 'RESEND_API_KEY is not configured.' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'AuPro <onboarding@resend.dev>',
        to: [email],
        subject: `AuPro - Your AU Student Verification Code: ${otp}`,
        html: getEmailHtml(name, otp, rollNo),
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      console.error('Resend dispatch failed with status', res.status, errJson);
      return { success: false, error: errJson.message || `Resend HTTP error ${res.status}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Resend fetch exception:', err);
    return { success: false, error: err?.message || 'Network exception calling Resend' };
  }
}

async function sendViaBrevo(email: string, name: string, otp: string, rollNo: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: 'AuPro Andhra University',
        email: process.env.EMAIL_FROM || 'verify@andhrauniversity.edu.in',
      },
      to: [{ email, name: name || 'Student' }],
      subject: `AuPro - Your AU Student Verification Code: ${otp}`,
      htmlContent: getEmailHtml(name, otp, rollNo),
    }),
  });

  return res.ok;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, fullName = '', rollNo = '' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid college email is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Enforce @andhrauniversity.edu.in
    if (!cleanEmail.endsWith(COLLEGE_DOMAIN)) {
      return NextResponse.json(
        { error: `Registration is strictly restricted to official ${COLLEGE_DOMAIN} student email addresses.` },
        { status: 403 }
      );
    }

    // Strict One-Account-Per-Student Enforcement (Main Admin email is exempt)
    const { isSignup = false } = body;
    if (isSignup && cleanEmail !== MAIN_ADMIN_EMAIL && isAccountRegistered(cleanEmail)) {
      return NextResponse.json(
        { error: 'An account has already been created for this university email. Each student may register only one account. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Rate Limiting: Max 5 requests per 10 minutes per IP/Email
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const rateLimitKey = `${ip}:${cleanEmail}`;
    const rateCheck = checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please wait 10 minutes before requesting another verification code.' },
        { status: 429 }
      );
    }

    // Generate 6-digit numeric code & 10 minute expiration
    const otp = generate6DigitOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const token = createVerificationToken(cleanEmail, otp, expiresAt);

    let delivered = false;
    let dispatchError = '';

    // 1. Attempt sending via Resend if configured
    if (process.env.RESEND_API_KEY) {
      const resendResult = await sendViaResend(cleanEmail, fullName, otp, rollNo);
      if (resendResult.success) {
        delivered = true;
      } else {
        dispatchError = resendResult.error || '';
      }
    }

    // 2. Attempt sending via Brevo if configured and not yet delivered
    if (!delivered && process.env.BREVO_API_KEY) {
      try {
        delivered = await sendViaBrevo(cleanEmail, fullName, otp, rollNo);
      } catch (e) {
        console.warn('Brevo dispatch failed:', e);
      }
    }

    // If external mail provider is linked and dispatched
    if (delivered) {
      return NextResponse.json({
        success: true,
        token,
        email: cleanEmail,
        message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your college inbox (and spam folder).`,
        providerStatus: 'delivered',
      });
    }

    // If no external mail provider is configured yet or provider returned restriction:
    return NextResponse.json({
      success: true,
      token,
      email: cleanEmail,
      message: `Verification code generated.`,
      providerStatus: 'setup_required',
      providerError: dispatchError || undefined,
      devCode: otp, // Enables immediate testing until the user adds RESEND_API_KEY in Vercel
    });
  } catch (err: any) {
    console.error('send-otp error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}
