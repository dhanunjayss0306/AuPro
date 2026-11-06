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

  // 3. Create menu: Only Announcement Post and Problem
  assert.ok(pageContent.includes('Announcement Post'), 'Must have Announcement Post');
  assert.ok(pageContent.includes('Problem'), 'Must have Problem option');
  assert.ok(!pageContent.includes('Create New Post'), 'Must NOT have "Create New Post" in create menu');
  assert.ok(!pageContent.includes('Event Post'), 'Must NOT have "Event Post" in create menu');

  // 4. No "Search campus posts" in topbar/feed
  assert.ok(!pageContent.includes('placeholder="Search campus"'), 'Must NOT have "Search campus" search bar');

  // 5. Google Maps export for Location tab
  assert.ok(pageContent.includes('google.com/maps'), 'Must have Google Maps export in location tab');
  assert.ok(pageContent.includes('iframe'), 'Must have interactive iframe for Google Maps');

  // 6. Upgraded sharp chatbot
  assert.ok(pageContent.includes('chatbot-chip-container'), 'Must have quick question chips for chatbot');
  assert.ok(pageContent.includes('chat-messages-scroll'), 'Must have conversational stream');
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
