import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const routes = [
  '../app/api/health/route.ts',
  '../app/api/applications/route.ts',
  '../app/api/faq/route.ts',
  '../app/api/places/route.ts',
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
  assert.ok(pageContent.includes('aupro_intro_seen'), 'Must use session storage guard for intro');

  // 4. Threads composer integrated
  assert.ok(pageContent.includes('ThreadsComposer'), 'Must import and use ThreadsComposer');
  assert.ok(pageContent.includes('handleThreadsPost'), 'Must handle posting from Threads composer');

  // 5. No "Search campus posts" in topbar/feed
  assert.ok(!pageContent.includes('placeholder="Search campus"'), 'Must NOT have "Search campus" search bar');

  // 6. Google Maps export for Location tab
  assert.ok(pageContent.includes('google.com/maps'), 'Must have Google Maps export in location tab');
  assert.ok(pageContent.includes('iframe'), 'Must have interactive iframe for Google Maps');

  // 7. Upgraded sharp chatbot
  assert.ok(pageContent.includes('chatbot-chip-container'), 'Must have quick question chips for chatbot');
  assert.ok(pageContent.includes('chat-messages-scroll'), 'Must have conversational stream');
});

test('IntroCinematic has streaming-service style animation, skip button, and reduced motion check', async () => {
  const introContent = await readFile(new URL('../app/IntroCinematic.tsx', import.meta.url), 'utf8');

  assert.ok(introContent.includes('prefers-reduced-motion'), 'Must check prefers-reduced-motion');
  assert.ok(introContent.includes('intro-skip-button'), 'Must have an accessible skip button');
  assert.ok(introContent.includes('intro-prisms-wrapper'), 'Must have converging light prism ribbons');
  assert.ok(introContent.includes('intro-wordmark-wrap'), 'Must have AuPro wordmark');
  assert.ok(introContent.includes('intro-subtitle'), 'Must have collegiate subtitle');
});

test('ThreadsComposer has Threads app posting layout: avatar on left, handle, photo/GIF, music, and post button', async () => {
  const composerContent = await readFile(new URL('../app/ThreadsComposer.tsx', import.meta.url), 'utf8');

  assert.ok(composerContent.includes('threads-left-col'), 'Must have left column for profile picture');
  assert.ok(composerContent.includes('threads-line'), 'Must have vertical connecting thread line');
  assert.ok(composerContent.includes('threads-avatar'), 'Must have user profile avatar');
  assert.ok(composerContent.includes('threads-textarea'), 'Must have typing down textarea');
  assert.ok(composerContent.includes('threads-gif-icon'), 'Must have GIF attachment support');
  assert.ok(composerContent.includes('toggleAudio'), 'Must have music / audio support');
  assert.ok(composerContent.includes('threads-post-submit-btn'), 'Must have post button');
  assert.ok(composerContent.includes('threads-type-pills'), 'Must have announcement and problem category selector');
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
