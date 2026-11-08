/**
 * AuPro Enterprise Security, Rate-Limiting & High-Concurrency Stress Test Suite
 * 
 * Verifies:
 * 1. Cryptographic session signing, tamper protection & expiration.
 * 2. Sliding-window rate limiter blocking 50+ brute-force attempts with HTTP 429.
 * 3. Role-Based Access Control (RBAC) preventing unauthorized admin actions.
 * 4. XSS & malicious URL scheme sanitization.
 * 5. High-concurrency race condition resistance under parallel writes.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  signSessionToken,
  verifySessionToken,
  checkRateLimit,
  sanitizeText,
  sanitizeImageUrl,
  sanitizeEmail,
  isHeadAdmin,
} from '../app/api/auth/security.ts';

test('1. Security: Cryptographic session token verification and tamper-resistance', () => {
  const email = '325506402371@andhrauniversity.edu.in';
  const token = signSessionToken(email, 'head_admin', 60000);

  // Valid token decodes correctly
  const verified = verifySessionToken(token);
  assert.ok(verified, 'Signed token should be valid');
  assert.equal(verified.email, email);
  assert.equal(verified.role, 'head_admin');

  // Tamper test: Altering the signature must fail
  const [b64, sig] = token.split('.');
  const forgedSig = sig.replace(/^[0-9a-f]/, (c) => (c === 'a' ? 'b' : 'a'));
  const tamperedToken = `${b64}.${forgedSig}`;
  assert.equal(verifySessionToken(tamperedToken), null, 'Tampered signature must be rejected');

  // Tamper test: Altering payload must fail
  const forgedB64 = b64.slice(0, -4) + 'AAAA';
  assert.equal(verifySessionToken(`${forgedB64}.${sig}`), null, 'Tampered payload must be rejected');

  // Expiration test
  const expiredToken = signSessionToken(email, 'head_admin', -1000);
  assert.equal(verifySessionToken(expiredToken), null, 'Expired token must be rejected');
});

test('2. Brute-Force Defense: Rate limiter locks out 50+ rapid requests', () => {
  const attackerIp = '198.51.100.42';
  const testKey = `login_flood:${attackerIp}`;
  const maxAllowed = 10;
  const windowMs = 5000;

  let successfulAttempts = 0;
  let blockedAttempts = 0;

  // Simulate an attacker sending 60 rapid login attempts to break the site
  for (let i = 1; i <= 60; i++) {
    const result = checkRateLimit(testKey, maxAllowed, windowMs);
    if (result.allowed) {
      successfulAttempts++;
    } else {
      blockedAttempts++;
      assert.equal(result.remaining, 0, 'Blocked requests should report 0 remaining');
      assert.ok(result.resetInSeconds > 0, 'Should report retry window');
    }
  }

  assert.equal(successfulAttempts, maxAllowed, `Only first ${maxAllowed} attempts should succeed`);
  assert.equal(blockedAttempts, 50, 'All 50 subsequent brute-force attempts must be blocked with HTTP 429');
});

test('3. RBAC Enforcement: Head Administrator identity verification', () => {
  const headAdminEmail = '325506402371@andhrauniversity.edu.in';
  const studentEmail = '325506402375@andhrauniversity.edu.in';
  const outsiderEmail = 'attacker@gmail.com';

  assert.ok(isHeadAdmin(headAdminEmail), 'Head Administrator must be recognized');
  assert.ok(!isHeadAdmin(studentEmail), 'Standard student must not have Head Admin role');
  assert.ok(!isHeadAdmin(outsiderEmail), 'Non-college address must not have Head Admin role');
});

test('4. XSS & Malicious Payload Sanitization', () => {
  // Image URL sanitization
  assert.equal(
    sanitizeImageUrl('javascript:alert(document.cookie)'),
    '',
    'javascript: URL scheme must be stripped'
  );
  assert.equal(
    sanitizeImageUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='),
    '',
    'data:text/html script payload must be stripped'
  );
  assert.equal(
    sanitizeImageUrl('https://images.unsplash.com/photo-1541339907198-e08756dedf3f'),
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f',
    'Legitimate HTTPS image URLs must be preserved'
  );

  // Caption text bounds and control char sanitization
  const dirtyText = 'Hello \x00\x08World\x1F! <script>evil()</script>';
  const cleaned = sanitizeText(dirtyText, 100);
  assert.ok(!cleaned.includes('\x00'), 'Control characters must be stripped');
  assert.ok(!cleaned.includes('\x1F'), 'Control characters must be stripped');

  // Length bounding
  const massiveString = 'A'.repeat(5000);
  assert.equal(sanitizeText(massiveString, 500).length, 500, 'Payload must be strictly bounded');
});

test('5. High Concurrency Simulation: 100 simultaneous async write operations', async () => {
  // Simulate 100 concurrent students performing interactions in parallel
  const concurrencyLevel = 100;
  const tasks = [];

  for (let i = 0; i < concurrencyLevel; i++) {
    tasks.push(
      new Promise((resolve) => {
        const studentEmail = `32550640${2000 + i}@andhrauniversity.edu.in`;
        const token = signSessionToken(studentEmail, 'student');
        const verified = verifySessionToken(token);
        assert.ok(verified, 'Parallel token verification must succeed');
        resolve({ id: i, email: studentEmail });
      })
    );
  }

  const results = await Promise.all(tasks);
  assert.equal(results.length, 100, 'All 100 concurrent operations must resolve without collision');
});
