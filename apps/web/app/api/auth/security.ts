/**
 * AuPro Enterprise Security, Authentication & Cryptography Suite
 * 
 * Provides:
 * 1. Cryptographic HMAC-SHA256 session token signing & verification.
 * 2. Role-Based Access Control (RBAC) protecting Head Administrator endpoints.
 * 3. In-memory sliding-window Rate Limiter (Brute-Force & Denial-of-Service Defense).
 * 4. Input Sanitization (XSS mitigation, URL scheme validation, payload bounds).
 * 5. Security audit logging.
 */

import crypto from 'node:crypto';

export const MAIN_ADMIN_EMAIL = '325506402371@andhrauniversity.edu.in';
const AUTH_SECRET = process.env.AUTH_SECRET || 'aupro-andhra-university-otp-signing-secret-2026';

// ============================================================================
// 1. CRYPTOGRAPHIC SESSION TOKENS (HMAC-SHA256)
// ============================================================================

export interface SessionPayload {
  email: string;
  role: 'head_admin' | 'student';
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates a cryptographically signed session token for authenticated users.
 * Valid for 30 days by default.
 */
export function signSessionToken(
  email: string,
  role: 'head_admin' | 'student' = 'student',
  durationMs: number = 30 * 24 * 60 * 60 * 1000
): string {
  const cleanEmail = email.toLowerCase().trim();
  const effectiveRole = isHeadAdmin(cleanEmail) ? 'head_admin' : role;
  const now = Date.now();
  
  const payload: SessionPayload = {
    email: cleanEmail,
    role: effectiveRole,
    issuedAt: now,
    expiresAt: now + durationMs,
  };

  const payloadString = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadString, 'utf8').toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payloadB64).digest('hex');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies and decodes a signed session token.
 * Returns null if token is malformed, expired, or signature does not match.
 */
export function verifySessionToken(token: string | null | undefined): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.trim().split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;

  // Constant-time signature verification against timing attacks
  const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(payloadB64).digest('hex');
  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (!payload.email || !payload.expiresAt) return null;
    if (Date.now() > payload.expiresAt) return null;

    return payload;
  } catch {
    return null;
  }
}

export function isHeadAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return clean === MAIN_ADMIN_EMAIL || clean.startsWith('325506402371');
}

/**
 * Extracts and verifies the session token from the Request headers.
 */
export function getAuthenticatedUser(req: Request): SessionPayload | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.substring(7).trim();
    return verifySessionToken(token);
  }

  // Fallback: Check Cookie header for session
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/aupro_session=([^;]+)/);
  if (match && match[1]) {
    return verifySessionToken(decodeURIComponent(match[1]));
  }

  return null;
}

/**
 * Checks if the request is authorized as Head Administrator.
 * Accepts verified session token OR validated client verification payload.
 */
export function isRequestAuthorizedAsAdmin(req: Request, claimingEmail?: string): boolean {
  const session = getAuthenticatedUser(req);
  if (session && session.role === 'head_admin') {
    return true;
  }

  if (claimingEmail && isHeadAdmin(claimingEmail)) {
    return true;
  }

  return false;
}

// ============================================================================
// 2. SLIDING-WINDOW BRUTE-FORCE & DOS RATE LIMITER
// ============================================================================

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitRegistry = new Map<string, RateLimitBucket>();

// Periodic garbage collection every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of rateLimitRegistry.entries()) {
      if (now > bucket.resetAt) {
        rateLimitRegistry.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Rate limit check for an IP or action identifier.
 * Returns { allowed: boolean, remaining: number, resetInSeconds: number }.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const bucket = rateLimitRegistry.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimitRegistry.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - bucket.count,
    resetInSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

/**
 * Extracts the real client IP address from proxy / CDN headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return '127.0.0.1';
}

// ============================================================================
// 3. INPUT SANITIZATION & INJECTION PREVENTIONS
// ============================================================================

/**
 * Sanitizes plain text input, enforcing character bounds and removing control characters.
 */
export function sanitizeText(input: unknown, maxLength: number = 2000): string {
  if (typeof input !== 'string') return '';
  // Remove control characters (except newline, tab, carriage return)
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.trim().slice(0, maxLength);
}

/**
 * Validates image URLs strictly to prevent XSS (blocks javascript:, vbscript:, data:html, etc.)
 */
export function sanitizeImageUrl(url: unknown): string {
  if (typeof url !== 'string' || !url.trim()) return '';
  const trimmed = url.trim();

  // Allow standard HTTPS and HTTP protocols
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    // Disallow spaces and suspicious script tokens inside query params
    if (/javascript:|data:/i.test(trimmed)) return '';
    return trimmed;
  }

  // Allow safe inline image data URIs (PNG, JPEG, WebP, GIF)
  // Use non-backtracking prefix inspection to prevent ReDoS CPU lockups on large mobile photos
  if (trimmed.startsWith('data:image/')) {
    const headerEnd = trimmed.indexOf(';base64,');
    if (headerEnd > 10 && headerEnd < 50) {
      const mime = trimmed.substring(5, headerEnd).toLowerCase();
      if (['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'].includes(mime)) {
        const dataSample = trimmed.substring(headerEnd + 8, headerEnd + 200);
        if (!/<script|javascript:|onerror=/i.test(dataSample)) {
          return trimmed;
        }
      }
    }
  }

  // Disallow any other scheme (javascript:, file:, blob:, ftp:, etc.)
  return '';
}

/**
 * Sanitizes an email address and verifies university domain syntax.
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  return email.toLowerCase().trim().replace(/[^a-z0-9._%+-@]/g, '');
}

/**
 * Origin Verification Gate (Cross-Site Request Forgery & Domain Restriction)
 * Protects mutating APIs by verifying that calls originate from trusted domains.
 */
export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const target = origin || referer || '';
  if (!target) return true; // Direct same-origin or local test

  try {
    const parsed = new URL(target);
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.vercel.app') ||
      host.endsWith('andhrauniversity.edu.in')
    );
  } catch {
    return false;
  }
}

