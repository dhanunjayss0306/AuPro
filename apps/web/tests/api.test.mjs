import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const routes = [
  '../app/api/health/route.ts',
  '../app/api/applications/route.ts',
  '../app/api/faq/route.ts',
  '../app/api/places/route.ts',
  '../app/api/auth/send-otp/route.ts',
  '../app/api/auth/verify-otp/route.ts',
];

test('API route source files exist', async () => {
  for (const route of routes) {
    await assert.doesNotReject(access(new URL(route, import.meta.url)));
  }
});

test('UI requirements: page.tsx matches user specifications', async () => {
  const pageContent = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');

  // 1. Underlined plus button
  assert.ok(pageContent.includes('plus-underline-bar'), 'Must contain plus-underline-bar for clear bottom nav plus underline');

  // 2. Feed filter navigation: Problems, Normal Posts, Announcements
  assert.ok(pageContent.includes('feed-category-bar'), 'Must contain feed-category-bar');
  assert.ok(pageContent.includes('Problems'), 'Must have Problems tab');
  assert.ok(pageContent.includes('Normal Posts'), 'Must have Normal Posts tab');
  assert.ok(pageContent.includes('Announcements'), 'Must have Announcements tab');

  // 3. Cinematic opening intro integrated
  assert.ok(pageContent.includes('IntroCinematic'), 'Must import and use IntroCinematic');

  // 4. In-App Maps Environment (No external redirects)
  assert.ok(pageContent.includes('maps-environment-wrapper'), 'Must have In-App Maps Environment');
  assert.ok(pageContent.includes('campusLandmarks'), 'Must have campus landmarks directory');

  // 5. Profile & About Yourself & Sign Out
  assert.ok(pageContent.includes('About Yourself'), 'Must have About Yourself bio field');
  assert.ok(pageContent.includes('Sign Out of AuPro'), 'Must have Sign Out option');
  assert.ok(pageContent.includes('authPhone'), 'Must ask for and display student phone number');

  // 6. Threads composer integrated with email passing
  assert.ok(pageContent.includes('ThreadsComposer'), 'Must import and use ThreadsComposer');
  assert.ok(pageContent.includes('handleThreadsPost'), 'Must handle posting from Threads composer');
  assert.ok(pageContent.includes('userEmail={authEmail}'), 'Must pass user email to composer for announcement authorization');

  // 7. No "Search campus posts" in topbar/feed
  assert.ok(!pageContent.includes('placeholder="Search campus"'), 'Must NOT have "Search campus" search bar');

  // 8. Upgraded sharp chatbot
  assert.ok(pageContent.includes('chatbot-chip-container'), 'Must have quick question chips for chatbot');
  assert.ok(pageContent.includes('chat-messages-scroll'), 'Must have conversational stream');
});

test('IntroCinematic has streaming-service style animation and reduced motion check without skip button', async () => {
  const introContent = await readFile(new URL('../app/IntroCinematic.tsx', import.meta.url), 'utf8');

  assert.ok(introContent.includes('prefers-reduced-motion'), 'Must check prefers-reduced-motion');
  assert.ok(!introContent.includes('intro-skip-button'), 'Must NOT have skip button per user instruction');
  assert.ok(introContent.includes('intro-prisms-wrapper'), 'Must have converging light prism ribbons');
  assert.ok(introContent.includes('intro-wordmark-wrap'), 'Must have AuPro wordmark');
  assert.ok(introContent.includes('intro-subtitle'), 'Must have collegiate subtitle');
});

test('ThreadsComposer has Threads posting layout with 3 categories and Announcement authorization', async () => {
  const composerContent = await readFile(new URL('../app/ThreadsComposer.tsx', import.meta.url), 'utf8');

  // Layout elements
  assert.ok(composerContent.includes('threads-left-col'), 'Must have left column for profile picture');
  assert.ok(composerContent.includes('threads-line'), 'Must have vertical connecting thread line');
  assert.ok(composerContent.includes('threads-avatar'), 'Must have user profile avatar');
  assert.ok(composerContent.includes('threads-textarea'), 'Must have typing down textarea');
  assert.ok(composerContent.includes('threads-gif-icon'), 'Must have GIF attachment support');
  assert.ok(composerContent.includes('toggleAudio'), 'Must have music / audio support');
  assert.ok(composerContent.includes('threads-post-submit-btn'), 'Must have post button');

  // 3 categories
  assert.ok(composerContent.includes('Normal Post'), 'Must support Normal Post option');
  assert.ok(composerContent.includes('Problem'), 'Must support Problem option');
  assert.ok(composerContent.includes('Announcement'), 'Must support Announcement option');

  // Announcement email authorization check
  assert.ok(composerContent.includes('AUTHORIZED_ANNOUNCEMENT_EMAILS'), 'Must have authorized announcement emails list');
  assert.ok(composerContent.includes('checkIsAuthorizedForAnnouncement'), 'Must have email authorization function');
});

test('Auth module validates college domain and announcement authorization', async () => {
  const authContent = await readFile(new URL('../app/auth.ts', import.meta.url), 'utf8');

  assert.ok(authContent.includes('isValidCollegeEmail'), 'Must export college email validator');
  assert.ok(authContent.includes('isAnnouncementAuthorized'), 'Must export announcement authorization checker');
  assert.ok(authContent.includes('AUTHORIZED_ANNOUNCEMENT_EMAILS'), 'Must list authorized announcement emails');
  assert.ok(authContent.includes('sendUniversityOtp'), 'Must export sendUniversityOtp');
  assert.ok(authContent.includes('verifyUniversityOtp'), 'Must export verifyUniversityOtp');
  assert.ok(authContent.includes('saveRegisteredUser'), 'Must export saveRegisteredUser');
});

test('OTP verification security: No skip button and mandatory 6-digit verification', async () => {
  const pageContent = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');

  // Must NOT have any skip button
  assert.ok(!pageContent.includes('Direct Sign In (Skip OTP)'), 'Must NOT contain Skip OTP backdoor');
  assert.ok(!pageContent.includes('Skip OTP'), 'Must NOT allow skipping OTP');

  // Must enforce OTP verification
  assert.ok(pageContent.includes('sendUniversityOtp'), 'Must invoke sendUniversityOtp');
  assert.ok(pageContent.includes('verifyUniversityOtp'), 'Must invoke verifyUniversityOtp');
  assert.ok(pageContent.includes('authOtpCountdown'), 'Must have countdown timer for resending OTP');
  assert.ok(pageContent.includes('maxLength={6}'), 'Must require 6-digit OTP code');
});

test('MomentCard has Instagram interactions and category badges', async () => {
  const cardContent = await readFile(new URL('../app/MomentCard.tsx', import.meta.url), 'utf8');

  assert.ok(cardContent.includes('post-category-tag'), 'Must have post category tags');
  assert.ok(cardContent.includes('InstagramLikeIcon'), 'Must have Instagram like icon');
  assert.ok(cardContent.includes('InstagramCommentIcon'), 'Must have Instagram comment icon');
  assert.ok(cardContent.includes('InstagramShareIcon'), 'Must have Instagram share icon');
  assert.ok(cardContent.includes('RepostIcon'), 'Must have Repost icon');
  assert.ok(cardContent.includes('handleDoubleTap'), 'Must have double-tap like interaction');
});
