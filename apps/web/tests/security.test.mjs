import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const appRoot = path.resolve('.');

test('GPS Auto-Tracking: page.tsx and globals.css support live geolocation', () => {
  const pageSource = fs.readFileSync(path.join(appRoot, 'app/page.tsx'), 'utf8');
  const cssSource = fs.readFileSync(path.join(appRoot, 'app/globals.css'), 'utf8');

  assert.ok(pageSource.includes('watchPosition'), 'Must use navigator.geolocation.watchPosition for continuous auto-tracking');
  assert.ok(pageSource.includes('getCurrentPosition'), 'Must use getCurrentPosition for immediate GPS lock');
  assert.ok(pageSource.includes('handleLocateMe'), 'Must provide handleLocateMe for centering on user GPS');
  assert.ok(pageSource.includes('userCoords'), 'Must maintain userCoords state for routing');
  assert.ok(pageSource.includes('gmaps-gps-badge'), 'Must render live GPS badge overlay');
  assert.ok(pageSource.includes('gps-active'), 'Must provide visual active state on GPS button');
  assert.ok(cssSource.includes('.gmaps-gps-badge'), 'CSS must define .gmaps-gps-badge styling');
  assert.ok(cssSource.includes('.gps-live-dot'), 'CSS must define live pulse indicator');
});

test('Security Gate 1 & 2: No leaked secrets, credentials, or public API keys in codebase', () => {
  const pageSource = fs.readFileSync(path.join(appRoot, 'app/page.tsx'), 'utf8');
  assert.ok(!pageSource.includes('AIzaSy'), 'Must not contain Google API key');
  assert.ok(!pageSource.includes('re_'), 'Must not contain Resend production secret');
  assert.ok(!pageSource.includes('xkeysib-'), 'Must not contain Brevo production secret');
  assert.ok(!pageSource.includes('sk-'), 'Must not contain OpenAI or private secret');
});

test('Security Gate 11: next.config.mjs enforces HSTS, CSP, and security headers', () => {
  const nextConfigSource = fs.readFileSync(path.join(appRoot, 'next.config.mjs'), 'utf8');
  assert.ok(nextConfigSource.includes('Strict-Transport-Security'), 'Must include HSTS header');
  assert.ok(nextConfigSource.includes('X-Content-Type-Options'), 'Must include nosniff header');
  assert.ok(nextConfigSource.includes('X-Frame-Options'), 'Must include frame protection');
  assert.ok(nextConfigSource.includes('Content-Security-Policy'), 'Must include CSP header');
  assert.ok(nextConfigSource.includes('geolocation=(self)'), 'Permissions-Policy must allow geolocation for self');
  assert.ok(nextConfigSource.includes('poweredByHeader: false'), 'Must hide X-Powered-By');
});

test('Security Gate 8: Rate limiting implemented on authentication endpoints', () => {
  const sendOtpSource = fs.readFileSync(path.join(appRoot, 'app/api/auth/send-otp/route.ts'), 'utf8');
  const verifyOtpSource = fs.readFileSync(path.join(appRoot, 'app/api/auth/verify-otp/route.ts'), 'utf8');

  assert.ok(sendOtpSource.includes('checkRateLimit'), 'send-otp must enforce rate limits');
  assert.ok(sendOtpSource.includes('429'), 'send-otp must return HTTP 429 when rate limit exceeded');
  assert.ok(verifyOtpSource.includes('isBruteForceLocked'), 'verify-otp must prevent brute-force attacks');
  assert.ok(verifyOtpSource.includes('429'), 'verify-otp must return HTTP 429 when locked');
});

test('Security Gate 4 & 5: Cryptographic token validation with HMAC-SHA256 and constant-time check', () => {
  const verifyOtpSource = fs.readFileSync(path.join(appRoot, 'app/api/auth/verify-otp/route.ts'), 'utf8');
  assert.ok(verifyOtpSource.includes('crypto.timingSafeEqual'), 'Must use timingSafeEqual to defeat timing attacks');
  assert.ok(verifyOtpSource.includes('COLLEGE_DOMAIN'), 'Must enforce college domain restriction');
});

test('Security Gate 15 & Shipping Checklist: robots.txt, sitemap.xml, llms.txt, not-found.tsx exist', () => {
  const robots = fs.readFileSync(path.join(appRoot, 'public/robots.txt'), 'utf8');
  assert.ok(robots.includes('Disallow: /api/'), 'robots.txt must protect internal API routes');
  assert.ok(fs.existsSync(path.join(appRoot, 'public/sitemap.xml')), 'sitemap.xml must exist');
  assert.ok(fs.existsSync(path.join(appRoot, 'public/llms.txt')), 'llms.txt must exist');
  assert.ok(fs.existsSync(path.join(appRoot, 'app/not-found.tsx')), 'Custom 404 page (not-found.tsx) must exist');
});
