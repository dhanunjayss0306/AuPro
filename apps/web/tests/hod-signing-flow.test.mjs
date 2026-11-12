/**
 * AuPro HOD Signing Flow Test Suite
 *
 * Verifies the HOD signing flow end to end (server logic):
 * 1. HOD identity: isHod / getHodDepartment / normalizeDepartmentKey.
 * 2. Session tokens carry role 'hod' for HOD mailboxes.
 * 3. isRequestAuthorizedAsHod enforces the HOD's own department.
 * 4. Approving an application notifies the HOD; more than 10 waiting
 *    triggers a batch alert to the HOD and to the Head Administrator.
 * 5. HOD posts a signing time (time_posted) and marks signed / collected.
 * 6. The acting user (not always the Head Administrator) is recorded.
 * 7. Source checks: API route HOD path and frontend HOD queue / statuses.
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
const tmpStoreDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aupro-hod-flow-'));
process.env.TMPDIR = tmpStoreDir;

const {
  isHod,
  getHodDepartment,
  normalizeDepartmentKey,
  getHodEmailForDepartment,
  signSessionToken,
  verifySessionToken,
  isRequestAuthorizedAsHod,
} = await import('../app/api/auth/security.ts');

const {
  MAIN_ADMIN_EMAIL,
  addStudentApplication,
  updateApplicationStatus,
  getAllApplications,
  getAllActivities,
  countApprovedAwaitingHod,
  getHodPendingCount,
} = await import('../app/api/auth/account-registry.ts');

const appRoot = path.resolve('.');

function hodRequest(token) {
  return new Request('http://localhost/api/applications', {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

function submitApp(department, n) {
  return addStudentApplication({
    studentName: `Test Student ${n}`,
    studentEmail: `test${n}@andhrauniversity.edu.in`,
    rollNo: `32550640000${n}`,
    serviceTitle: 'Bonafide certificate',
    purpose: 'Test',
    department,
    year: '4th Year',
    status: 'pending',
  });
}

test('HOD identity: isHod, getHodDepartment, normalizeDepartmentKey', () => {
  assert.equal(isHod('hod.cse@andhrauniversity.edu.in'), true);
  assert.equal(isHod('hod.ece@andhrauniversity.edu.in'), true);
  assert.equal(isHod('hod.civil@andhrauniversity.edu.in'), true);
  assert.equal(isHod('hod.mech@andhrauniversity.edu.in'), true);
  assert.equal(isHod('hod@andhrauniversity.edu.in'), true);
  assert.equal(isHod('hod.physics@andhrauniversity.edu.in'), true);
  assert.equal(isHod('325506402371@andhrauniversity.edu.in'), false);
  assert.equal(isHod('student@andhrauniversity.edu.in'), false);
  assert.equal(isHod('hod.cse@gmail.com'), false);
  assert.equal(isHod(null), false);

  assert.equal(getHodDepartment('hod.cse@andhrauniversity.edu.in'), 'cse');
  assert.equal(getHodDepartment('hod.ece@andhrauniversity.edu.in'), 'ece');
  assert.equal(getHodDepartment('hod.civil@andhrauniversity.edu.in'), 'civil');
  assert.equal(getHodDepartment('hod.mech@andhrauniversity.edu.in'), 'mech');
  assert.equal(getHodDepartment('hod.physics@andhrauniversity.edu.in'), 'physics');
  assert.equal(getHodDepartment('hod@andhrauniversity.edu.in'), 'other');
  assert.equal(getHodDepartment('student@andhrauniversity.edu.in'), 'other');

  assert.equal(normalizeDepartmentKey('Computer Science & Systems Engineering'), 'cse');
  assert.equal(normalizeDepartmentKey('CSE'), 'cse');
  assert.equal(normalizeDepartmentKey('Electronics & Communication Engineering'), 'ece');
  assert.equal(normalizeDepartmentKey('ECE'), 'ece');
  assert.equal(normalizeDepartmentKey('Civil Engineering'), 'civil');
  assert.equal(normalizeDepartmentKey('Mechanical Engineering'), 'mech');
  assert.equal(normalizeDepartmentKey('AU Engineering'), 'other');
  assert.equal(normalizeDepartmentKey(''), 'other');

  assert.equal(getHodEmailForDepartment('Computer Science & Systems Engineering'), 'hod.cse@andhrauniversity.edu.in');
  assert.equal(getHodEmailForDepartment('AU Engineering'), null);
});

test('HOD session token carries role hod; head admin still wins', () => {
  const hodToken = signSessionToken('hod.cse@andhrauniversity.edu.in', 'student', 60000);
  const hodSession = verifySessionToken(hodToken);
  assert.ok(hodSession);
  assert.equal(hodSession.role, 'hod');
  assert.equal(hodSession.email, 'hod.cse@andhrauniversity.edu.in');

  const adminToken = signSessionToken('325506402371@andhrauniversity.edu.in', 'student', 60000);
  assert.equal(verifySessionToken(adminToken).role, 'head_admin');

  const studentToken = signSessionToken('325506402372@andhrauniversity.edu.in', 'student', 60000);
  assert.equal(verifySessionToken(studentToken).role, 'student');
});

test('isRequestAuthorizedAsHod enforces the HOD own department', () => {
  const cseToken = signSessionToken('hod.cse@andhrauniversity.edu.in', 'hod', 60000);
  const eceToken = signSessionToken('hod.ece@andhrauniversity.edu.in', 'hod', 60000);

  // Session token path
  assert.equal(isRequestAuthorizedAsHod(hodRequest(cseToken), undefined, 'Computer Science & Systems Engineering'), true);
  assert.equal(isRequestAuthorizedAsHod(hodRequest(cseToken), undefined, 'Electronics & Communication Engineering'), false);
  assert.equal(isRequestAuthorizedAsHod(hodRequest(cseToken)), true);

  // Claiming-email path (no session)
  assert.equal(isRequestAuthorizedAsHod(hodRequest(null), 'hod.ece@andhrauniversity.edu.in', 'ECE'), true);
  assert.equal(isRequestAuthorizedAsHod(hodRequest(null), 'hod.ece@andhrauniversity.edu.in', 'CSE'), false);
  assert.equal(isRequestAuthorizedAsHod(hodRequest(null), 'hod.cse@andhrauniversity.edu.in'), true);

  // Students and strangers are never HOD-authorized
  const studentToken = signSessionToken('325506402372@andhrauniversity.edu.in', 'student', 60000);
  assert.equal(isRequestAuthorizedAsHod(hodRequest(studentToken), undefined, 'CSE'), false);
  assert.equal(isRequestAuthorizedAsHod(hodRequest(null), '325506402372@andhrauniversity.edu.in', 'CSE'), false);
  assert.equal(isRequestAuthorizedAsHod(hodRequest(null)), false);
});

test('Approve notifies the HOD; more than 10 waiting triggers the batch alert', () => {
  const cse = 'Computer Science & Systems Engineering';
  const refs = [];
  for (let i = 1; i <= 11; i++) {
    refs.push(submitApp(cse, i).refId);
  }
  const eceRef = submitApp('Electronics & Communication Engineering', 99).refId;

  // First 10 approvals: HOD notified each time, no batch alert yet.
  for (let i = 0; i < 10; i++) {
    const result = updateApplicationStatus(refs[i], 'approved', undefined, { email: MAIN_ADMIN_EMAIL, role: 'head_admin' });
    assert.equal(result.updated, true);
    assert.equal(result.hodPendingCount, i + 1, `count after approval ${i + 1}`);
    assert.equal(result.hodBatchAlert, false, 'no batch alert at 10 or fewer');
  }
  assert.equal(countApprovedAwaitingHod(cse), 10);
  assert.equal(getHodPendingCount(cse), 10);

  // 11th approval: batch alert fires.
  const eleventh = updateApplicationStatus(refs[10], 'approved', undefined, { email: MAIN_ADMIN_EMAIL, role: 'head_admin' });
  assert.equal(eleventh.updated, true);
  assert.equal(eleventh.hodPendingCount, 11);
  assert.equal(eleventh.hodBatchAlert, true);

  // The HOD notification lands in the activity stream, addressed to the CSE HOD.
  const activities = getAllActivities();
  const hodNotices = activities.filter((a) => a.action === 'HOD Notified — Signature Requested');
  const cseNotices = hodNotices.filter((a) => a.actor === 'hod.cse@andhrauniversity.edu.in');
  assert.ok(cseNotices.length >= 11, 'one HOD notice per CSE approval');
  assert.ok(cseNotices.every((a) => a.details.includes('Computer Science & Systems Engineering')), 'HOD notices name the department');

  // The batch alert lands twice: once for the HOD, once for the Head Administrator.
  const alerts = activities.filter((a) => a.action === 'HOD Signing Queue Alert — More Than 10 Waiting');
  assert.equal(alerts.length, 2, 'batch alert logged for HOD and Head Administrator');
  assert.ok(alerts.some((a) => a.actor === 'hod.cse@andhrauniversity.edu.in'), 'batch alert reaches the HOD');
  assert.ok(alerts.some((a) => a.actor === MAIN_ADMIN_EMAIL), 'batch alert reaches the Head Administrator');
  assert.ok(alerts[0].details.includes('11 students'), 'alert names the waiting count');

  // Approving an ECE application does not touch the CSE count.
  const eceResult = updateApplicationStatus(eceRef, 'approved', undefined, { email: MAIN_ADMIN_EMAIL, role: 'head_admin' });
  assert.equal(eceResult.hodPendingCount, 1);
  assert.equal(eceResult.hodBatchAlert, false);
  assert.equal(countApprovedAwaitingHod(cse), 11);

  // Re-approving an already-approved application does not re-notify or re-alert.
  const again = updateApplicationStatus(refs[0], 'approved', undefined, { email: MAIN_ADMIN_EMAIL, role: 'head_admin' });
  assert.equal(again.hodPendingCount, 11);
  assert.equal(again.hodBatchAlert, false);
});

test('HOD posts a signing time, then marks signed; actor is recorded', () => {
  const civil = 'Civil Engineering';
  const app = submitApp(civil, 50);
  const approved = updateApplicationStatus(app.refId, 'approved', undefined, { email: MAIN_ADMIN_EMAIL, role: 'head_admin' });
  assert.equal(approved.hodPendingCount, 1);

  // HOD posts the signing time.
  const posted = updateApplicationStatus(app.refId, 'time_posted', {
    appointmentDate: '13 Nov 2026',
    appointmentTime: '11:30 AM - 12:30 PM',
    appointmentVenue: 'HOD Office, Civil Block',
  }, { email: 'hod.civil@andhrauniversity.edu.in', role: 'hod' });
  assert.equal(posted.updated, true);
  const afterPost = getAllApplications().find((a) => a.refId === app.refId);
  assert.equal(afterPost.status, 'time_posted');
  assert.equal(afterPost.appointmentDate, '13 Nov 2026');
  assert.equal(afterPost.appointmentTime, '11:30 AM - 12:30 PM');
  assert.equal(afterPost.appointmentVenue, 'HOD Office, Civil Block');
  // No longer counted as waiting for the HOD signature.
  assert.equal(countApprovedAwaitingHod(civil), 0);

  // The time-posted activity records the HOD as the actor, not the Head Administrator.
  const activities = getAllActivities();
  const timePost = activities.find((a) => a.action === 'Signing Time Posted by HOD' && a.details.includes(app.refId));
  assert.ok(timePost, 'time-posted activity logged');
  assert.equal(timePost.actor, 'hod.civil@andhrauniversity.edu.in');

  // HOD marks it signed / collected.
  const signed = updateApplicationStatus(app.refId, 'signed', undefined, { email: 'hod.civil@andhrauniversity.edu.in', role: 'hod' });
  assert.equal(signed.updated, true);
  const afterSign = getAllApplications().find((a) => a.refId === app.refId);
  assert.equal(afterSign.status, 'signed');

  // Unknown ref IDs are not updated.
  assert.equal(updateApplicationStatus('AU-000000', 'signed', undefined, { email: 'hod.civil@andhrauniversity.edu.in', role: 'hod' }).updated, false);
});

test('API route: HOD path, department filter, approve response fields', () => {
  const routeSource = fs.readFileSync(path.join(appRoot, 'app/api/applications/route.ts'), 'utf8');
  assert.ok(routeSource.includes('isRequestAuthorizedAsHod'), 'route must authorize HODs');
  assert.ok(routeSource.includes("status === 'time_posted'"), 'route must handle time_posted');
  assert.ok(routeSource.includes("status === 'signed'"), 'route must handle signed');
  assert.ok(routeSource.includes('hodPendingCount'), 'approve response must include hodPendingCount');
  assert.ok(routeSource.includes('hodBatchAlert'), 'approve response must include hodBatchAlert');
  assert.ok(routeSource.includes("searchParams.get('department')"), 'GET must support ?department= filter');
  assert.ok(routeSource.includes('HODs may only post a signing time'), 'route must 403 other HOD actions');
  assert.ok(routeSource.includes('Only a verified (approved) application can receive a signing time'), 'time_posted requires approved');
  assert.ok(routeSource.includes('Only an approved or time-posted application can be marked signed'), 'signed requires approved or time_posted');
});

test('Frontend: HOD queue, HOD actions, and the new student statuses', () => {
  const pageSource = fs.readFileSync(path.join(appRoot, 'app/page.tsx'), 'utf8');
  assert.ok(pageSource.includes('isHodAccount(authEmail)'), 'page must gate the HOD queue on the HOD account');
  assert.ok(pageSource.includes('HOD Signing Queue'), 'page must show the HOD Signing Queue');
  assert.ok(pageSource.includes('More than 10 students are waiting for your signature'), 'page must banner the >10 queue');
  assert.ok(pageSource.includes('Post Signing Time'), 'HOD queue must offer posting a signing time');
  assert.ok(pageSource.includes('Mark Signed / Collected'), 'HOD queue must offer marking signed');
  assert.ok(pageSource.includes("status: 'time_posted'"), 'HOD form must PATCH time_posted');
  assert.ok(pageSource.includes("status: 'signed'"), 'HOD action must PATCH signed');
  assert.ok(pageSource.includes('hodEmail: authEmail'), 'HOD PATCH calls must identify the HOD');
  assert.ok(pageSource.includes('Verified — waiting for the HOD to post a signing time'), 'approved badge must name the HOD wait');
  assert.ok(pageSource.includes('Signing time posted — come in person'), 'time_posted badge must tell students to come in person');
  assert.ok(pageSource.includes('Signed &amp; collected'), 'signed badge must show collected');
  assert.ok(pageSource.includes("app.status === 'rejected'"), 'page must handle the rejected status');

  const authSource = fs.readFileSync(path.join(appRoot, 'app/lib/auth.ts'), 'utf8');
  assert.ok(authSource.includes('export function isHodAccount'), 'lib/auth must export isHodAccount');
  assert.ok(authSource.includes('export function getHodDepartment'), 'lib/auth must export getHodDepartment');
  assert.ok(authSource.includes('export function normalizeDepartmentKey'), 'lib/auth must export normalizeDepartmentKey');
  assert.ok(authSource.includes('HOD_DEPARTMENT_NAMES'), 'lib/auth must export HOD_DEPARTMENT_NAMES');
});
