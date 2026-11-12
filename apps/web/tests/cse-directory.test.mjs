/**
 * AuPro CSE Second-Year Directory Test Suite
 *
 * Verifies the CSE-only student directory login:
 * 1. Directory lookup: known rolls resolve to the sheet's name + section;
 *    unknown rolls resolve to nothing; email local part IS the roll number.
 * 2. Seed: only the Head Administrator account exists; the 4 demo
 *    students and their seed activities are gone.
 * 3. registerAccount: a directory student registers with directory-only
 *    details (client-supplied name/department/year ignored); a
 *    non-directory email is refused and no account is created; the Head
 *    Administrator's seeded profile is never overwritten; HODs are exempt.
 * 4. loadStore self-cleans: a non-directory account planted in the store
 *    is dropped on the next load; Head Administrator, HOD and directory
 *    students survive.
 * 5. Source checks: OTP routes enforce the directory check and return the
 *    resolved profile; the signup form no longer asks for name, roll
 *    number, department or year.
 *
 * The registry tests run against an isolated tmpdir store so they never
 * touch the shared dev store.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Isolate the registry's JSON store BEFORE importing it (DB_FILE is
// computed from os.tmpdir() at module load).
const tmpStoreDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aupro-cse-dir-'));
process.env.TMPDIR = tmpStoreDir;

const {
  CSE_STUDENTS,
  CSE_DEPARTMENT,
  CSE_YEAR,
  NOT_IN_CSE_LIST_MESSAGE,
  getRollNoFromEmail,
  lookupCseStudent,
  lookupCseStudentByEmail,
} = await import('../app/lib/cse-students.ts');

const {
  MAIN_ADMIN_EMAIL,
  getAllAccounts,
  getAllActivities,
  findAccount,
  registerAccount,
} = await import('../app/api/auth/account-registry.ts');

const appRoot = path.resolve('.');

test('Directory: 587 students, known rolls resolve to sheet name + section', () => {
  assert.equal(Object.keys(CSE_STUDENTS).length, 587, 'complete second-year list');
  assert.equal(CSE_DEPARTMENT, 'Computer Science & Engineering');
  assert.equal(CSE_YEAR, '2nd Year');

  assert.deepEqual(lookupCseStudent('325506402001'), { name: 'A AMARNATH', section: 'CSE-1' });
  assert.deepEqual(lookupCseStudent('325506402371'), { name: 'P V N DHANUNJAY REEDY', section: 'CSE-5' });
  assert.deepEqual(lookupCseStudent('325506402587'), { name: 'Senapathy Lakshya Varshini', section: 'CSE-8' });

  // Section sizes from the sheet: 75 each except CSE-8 with 62.
  const counts = {};
  for (const s of Object.values(CSE_STUDENTS)) counts[s.section] = (counts[s.section] || 0) + 1;
  assert.deepEqual(counts, {
    'CSE-1': 75, 'CSE-2': 75, 'CSE-3': 75, 'CSE-4': 75,
    'CSE-5': 75, 'CSE-6': 75, 'CSE-7': 75, 'CSE-8': 62,
  });

  // The generated JSON the registry reads holds the same data.
  const json = JSON.parse(fs.readFileSync(path.join(appRoot, 'app/lib/cse-students.json'), 'utf8'));
  assert.equal(Object.keys(json.students).length, 587);
  assert.equal(json.department, CSE_DEPARTMENT);
  assert.equal(json.year, CSE_YEAR);
  assert.deepEqual(json.students['325506402001'], { name: 'A AMARNATH', section: 'CSE-1' });
});

test('Directory: unknown rolls resolve to nothing; email local part is the roll number', () => {
  assert.equal(lookupCseStudent('325506409999'), null);
  assert.equal(lookupCseStudent(''), null);
  assert.equal(lookupCseStudent(null), null);

  assert.equal(getRollNoFromEmail('325506402001@andhrauniversity.edu.in'), '325506402001');
  assert.equal(getRollNoFromEmail('325506402001@ANDHRAUNIVERSITY.EDU.IN'), '325506402001');
  assert.equal(getRollNoFromEmail('hod.cse@andhrauniversity.edu.in'), 'hod.cse');
  assert.equal(getRollNoFromEmail(''), '');

  assert.deepEqual(lookupCseStudentByEmail('325506402001@andhrauniversity.edu.in'), {
    rollNo: '325506402001', name: 'A AMARNATH', section: 'CSE-1',
  });
  assert.equal(lookupCseStudentByEmail('325506409999@andhrauniversity.edu.in'), null);
  assert.equal(lookupCseStudentByEmail('hod.cse@andhrauniversity.edu.in'), null);
  assert.equal(lookupCseStudentByEmail('student@gmail.com'), null);

  assert.ok(NOT_IN_CSE_LIST_MESSAGE.includes('not in the second-year CSE list'));
});

test('Seed: only the Head Administrator account exists; demo students and their activities are gone', () => {
  const accounts = getAllAccounts();
  assert.deepEqual(Object.keys(accounts), [MAIN_ADMIN_EMAIL]);

  const head = accounts[MAIN_ADMIN_EMAIL];
  assert.equal(head.name, 'P V N Dhanunjay Reddy');
  assert.equal(head.rollNo, '325506402371');
  assert.equal(head.year, '4th Year');

  const activities = getAllActivities();
  assert.equal(activities.length, 1, 'only act_init_1 survives');
  assert.equal(activities[0].id, 'act_init_1');

  const registrySource = fs.readFileSync(path.join(appRoot, 'app/api/auth/account-registry.ts'), 'utf8');
  for (const demo of ['325506402372', '325506402375', '325506402380', '325506402391']) {
    assert.ok(!registrySource.includes(demo), `registry must not contain demo ${demo}`);
  }
  for (const name of ['Sreenivas Rao', 'Divya Sri', 'Sai Teja', 'Harsha Vardhan']) {
    assert.ok(!registrySource.includes(name), `registry must not contain demo ${name}`);
  }

  const authSource = fs.readFileSync(path.join(appRoot, 'app/lib/auth.ts'), 'utf8');
  for (const demo of ['325506402372', '325506402375', '325506402380', '325506402391']) {
    assert.ok(!authSource.includes(demo), `lib/auth must not contain demo ${demo}`);
  }
});

test('registerAccount: directory student registers with directory-only details', () => {
  const ok = registerAccount('325506402001@andhrauniversity.edu.in', {
    name: 'WRONG NAME',
    username: 'amarnath_au',
    rollNo: '999999999999',
    department: 'Mechanical Engineering',
    year: '4th Year',
    phone: '+91 9000000001',
  });
  assert.equal(ok, true);

  const stored = findAccount('325506402001@andhrauniversity.edu.in');
  assert.ok(stored);
  assert.equal(stored.name, 'A AMARNATH', 'name comes from the directory, not the client');
  assert.equal(stored.rollNo, '325506402001');
  assert.equal(stored.department, 'Computer Science & Engineering');
  assert.equal(stored.year, '2nd Year');
  assert.equal(stored.section, 'CSE-1');
  assert.equal(stored.username, 'amarnath_au', 'chosen username is kept');
  assert.equal(stored.phone, '+91 9000000001');
  assert.equal(stored.isVerified, true);
});

test('registerAccount: non-directory email is refused and creates nothing', () => {
  const ok = registerAccount('325506409999@andhrauniversity.edu.in', {
    name: 'Outsider Student',
    rollNo: '325506409999',
    department: 'Computer Science & Engineering',
    year: '2nd Year',
  });
  assert.equal(ok, false, 'refused');
  assert.equal(findAccount('325506409999@andhrauniversity.edu.in'), null, 'no account created');

  const outsider = registerAccount('outsider@gmail.com', { name: 'Outsider' });
  assert.equal(outsider, false);
  assert.equal(findAccount('outsider@gmail.com'), null);
});

test('registerAccount: Head Administrator seeded profile is never overwritten; HODs are exempt', () => {
  const ok = registerAccount(MAIN_ADMIN_EMAIL, { name: 'HACKED NAME', year: '1st Year' });
  assert.equal(ok, true);
  const head = findAccount(MAIN_ADMIN_EMAIL);
  assert.equal(head.name, 'P V N Dhanunjay Reddy', 'seeded name untouched');
  assert.equal(head.year, '4th Year', 'seeded year untouched');
  assert.equal(head.rollNo, '325506402371');

  const hod = registerAccount('hod.cse@andhrauniversity.edu.in', {
    name: 'CSE HOD',
    department: 'Computer Science & Systems Engineering',
    year: '4th Year',
  });
  assert.equal(hod, true, 'HOD exempt from the directory check');
  const storedHod = findAccount('hod.cse@andhrauniversity.edu.in');
  assert.equal(storedHod.name, 'CSE HOD');
  assert.equal(storedHod.rollNo, 'hod.cse', 'no roll number invented for HODs');
});

test('loadStore self-cleans: non-directory account dropped, head + HOD + directory student survive', () => {
  // Plant a non-directory account directly in the live store (the way a
  // store written before the directory rule would carry one).
  const accounts = getAllAccounts();
  accounts['325506408888@andhrauniversity.edu.in'] = {
    email: '325506408888@andhrauniversity.edu.in',
    name: 'Legacy Student',
    username: 'legacy_student',
    rollNo: '325506408888',
    department: 'Mechanical Engineering',
    year: '3rd Year',
    isVerified: true,
    verifiedAt: new Date().toISOString(),
  };
  assert.ok(accounts['325506408888@andhrauniversity.edu.in'], 'planted in the live store object');
  // (Do NOT re-read via getAllAccounts() here to check the plant: any
  // loadStore call prunes on the spot, which is exactly the behavior
  // under test.)

  // Next load prunes it (cache-hit path prunes on every loadStore).
  const reloaded = getAllAccounts();
  assert.equal(reloaded['325506408888@andhrauniversity.edu.in'], undefined, 'non-directory account dropped');
  assert.ok(reloaded[MAIN_ADMIN_EMAIL], 'head admin survives');
  assert.ok(reloaded['hod.cse@andhrauniversity.edu.in'], 'HOD survives');
  assert.ok(reloaded['325506402001@andhrauniversity.edu.in'], 'directory student survives');
});

test('Routes: OTP routes enforce the directory check and return the resolved profile', () => {
  const verifySource = fs.readFileSync(path.join(appRoot, 'app/api/auth/verify-otp/route.ts'), 'utf8');
  assert.ok(verifySource.includes('lookupCseStudentByEmail'), 'verify-otp must look up the directory');
  assert.ok(verifySource.includes('NOT_IN_CSE_LIST_MESSAGE'), 'verify-otp must use the shared refusal message');
  assert.ok(verifySource.includes("status: 403"), 'verify-otp must refuse non-directory students');
  assert.ok(verifySource.includes('profile: responseProfile'), 'verify-otp must return the resolved profile');
  assert.ok(verifySource.includes('isHeadAdmin(cleanEmail) || isHod(cleanEmail)'), 'verify-otp must exempt head admin and HODs');

  const sendSource = fs.readFileSync(path.join(appRoot, 'app/api/auth/send-otp/route.ts'), 'utf8');
  assert.ok(sendSource.includes('lookupCseStudentByEmail'), 'send-otp must look up the directory');
  assert.ok(sendSource.includes('NOT_IN_CSE_LIST_MESSAGE'), 'send-otp must use the shared refusal message');
  assert.ok(sendSource.includes('greetingName'), 'send-otp must greet with the directory name');
  assert.ok(sendSource.includes('greetingRoll'), 'send-otp must greet with the directory roll number');

  const accountsSource = fs.readFileSync(path.join(appRoot, 'app/api/accounts/route.ts'), 'utf8');
  assert.ok(accountsSource.includes('lookupCseStudentByEmail'), 'accounts POST must enforce the directory check');
});

test('Frontend: signup no longer asks for name, roll number, department or year', () => {
  const pageSource = fs.readFileSync(path.join(appRoot, 'app/page.tsx'), 'utf8');
  assert.ok(!pageSource.includes('Roll / Reg Number *'), 'signup must not ask for the roll number');
  assert.ok(!pageSource.includes('>Full Name *<'), 'signup must not ask for the full name');
  assert.ok(!pageSource.includes("sendUniversityOtp(clean, authName, authRollNo"), 'signup must not send typed name/roll to send-otp');
  assert.ok(pageSource.includes('sendUniversityOtp(clean, true)'), 'signup sends only the email');
  assert.ok(pageSource.includes('const verified = await verifyUniversityOtp'), 'OTP submit must capture the verify response');
  assert.ok(pageSource.includes('verified?.profile'), 'OTP submit must use the resolved profile');
  assert.ok(pageSource.includes('setAuthSection'), 'resolved section must attach to the session');
  assert.ok(pageSource.includes('Your account is attached to Roll No.'), 'student must see the attached details confirmed');
  assert.ok(pageSource.includes('Your name, roll number, section and year are attached automatically'), 'signup must explain the auto-attach');

  const authSource = fs.readFileSync(path.join(appRoot, 'app/lib/auth.ts'), 'utf8');
  assert.ok(authSource.includes('export async function sendUniversityOtp(email: string, isSignup = false)'), 'sendUniversityOtp takes only email + isSignup');
  assert.ok(authSource.includes('lookupCseStudentByEmail'), 'client registry must prune against the directory');
});
