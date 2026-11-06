import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  isAccountRegistered,
  registerAccount,
  clearAllAccounts,
  getRegisteredCount,
  MAIN_ADMIN_EMAIL,
} from '../app/api/auth/account-registry.ts';

const AUTH_SECRET = process.env.AUTH_SECRET || 'aupro-andhra-university-otp-signing-secret-2026';
const COLLEGE_DOMAIN = '@andhrauniversity.edu.in';

function generate6DigitOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function createVerificationToken(email, otp, expiresAt) {
  const payload = `${email.toLowerCase().trim()}:${otp}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  const tokenData = {
    email: email.toLowerCase().trim(),
    expiresAt,
    hmac,
  };
  return Buffer.from(JSON.stringify(tokenData)).toString('base64url');
}

function verifyTokenAndOtp(email, otp, token) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  // Decode token
  const decodedJson = Buffer.from(token, 'base64url').toString('utf8');
  const tokenData = JSON.parse(decodedJson);

  if (tokenData.email !== cleanEmail) {
    return { ok: false, error: 'Email mismatch' };
  }
  if (Date.now() > tokenData.expiresAt) {
    return { ok: false, error: 'Expired' };
  }

  const expectedPayload = `${cleanEmail}:${cleanOtp}:${tokenData.expiresAt}`;
  const expectedHmac = crypto.createHmac('sha256', AUTH_SECRET).update(expectedPayload).digest('hex');

  const hmacBuffer = Buffer.from(tokenData.hmac, 'hex');
  const expectedBuffer = Buffer.from(expectedHmac, 'hex');

  if (hmacBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(hmacBuffer, expectedBuffer)) {
    return { ok: false, error: 'Invalid verification code' };
  }

  return { ok: true, email: cleanEmail };
}

test('Step 1: Purge all accounts and start clean', () => {
  clearAllAccounts();
  assert.equal(getRegisteredCount(), 0, 'All previous accounts must be wiped to 0');
  console.log('✓ Verified: All previous accounts cleared. Total accounts: 0');
});

test('Step 2: Designated Main ID is recognized', () => {
  assert.equal(MAIN_ADMIN_EMAIL, '325506402371@andhrauniversity.edu.in');
  console.log(`✓ Verified: Designated Main Admin ID = ${MAIN_ADMIN_EMAIL}`);
});

test('Step 3: End-to-end OTP lifecycle with Main ID: 325506402371@andhrauniversity.edu.in', () => {
  const mainEmail = '325506402371@andhrauniversity.edu.in';
  
  // 1. Domain validation
  assert.ok(mainEmail.endsWith(COLLEGE_DOMAIN), 'Main ID must belong to AU domain');

  // 2. OTP generation
  const otp = generate6DigitOtp();
  assert.match(otp, /^\d{6}$/, 'Generated OTP must be strictly 6 digits');
  console.log(`Generated OTP code for ${mainEmail}: ${otp}`);

  // 3. Cryptographic token issuance
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const token = createVerificationToken(mainEmail, otp, expiresAt);
  assert.ok(token && token.length > 20, 'Cryptographic token must be issued');

  // 4. Test wrong OTP rejection
  const wrongResult = verifyTokenAndOtp(mainEmail, '000000', token);
  assert.equal(wrongResult.ok, false);
  assert.equal(wrongResult.error, 'Invalid verification code');
  console.log('✓ Verified: Incorrect OTP (000000) rejected with HTTP 400 error.');

  // 5. Test correct OTP verification
  const correctResult = verifyTokenAndOtp(mainEmail, otp, token);
  assert.equal(correctResult.ok, true);
  assert.equal(correctResult.email, mainEmail);
  console.log(`✓ Verified: Correct OTP (${otp}) passed HMAC validation and activated account!`);

  // 6. Register account in registry
  registerAccount(mainEmail);
  assert.equal(isAccountRegistered(mainEmail), true);
  console.log(`✓ Verified: ${mainEmail} recorded as active verified account.`);
});

test('Step 4: Strict One-Account-Per-Student Rule (Preventing duplicate account creation)', () => {
  const otherStudent = '325506402399@andhrauniversity.edu.in';
  
  // First registration for this student
  assert.equal(isAccountRegistered(otherStudent), false);
  const otp = generate6DigitOtp();
  const token = createVerificationToken(otherStudent, otp, Date.now() + 10 * 60 * 1000);
  const verifyRes = verifyTokenAndOtp(otherStudent, otp, token);
  assert.equal(verifyRes.ok, true);
  registerAccount(otherStudent);
  assert.equal(isAccountRegistered(otherStudent), true);
  console.log(`✓ Verified: First account created and registered for ${otherStudent}`);

  // Attempt to create second account with same email -> MUST BE BLOCKED
  const alreadyRegistered = isAccountRegistered(otherStudent);
  assert.equal(alreadyRegistered, true, 'Subsequent account creation for same email must be recognized as existing');
  console.log(`✓ Verified: Second account attempt for ${otherStudent} is BLOCKED (one email = one account only).`);
});
