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
  '../app/api/accounts/route.ts',
  '../app/api/activity/route.ts',
  '../app/api/feed/route.ts',
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

  // 2. Feed: Pure continuous unified Threads stream (Problems/Normal Posts/Announcements top bar removed per user spec)
  assert.ok(!pageContent.includes('feed-category-bar'), 'Must NOT contain feed-category-bar in the feed');

  // Instagram-style Profile in About Tab
  assert.ok(pageContent.includes('insta-profile-screen'), 'Must render Instagram-style profile screen');
  assert.ok(pageContent.includes('Down Your Posts'), 'Must display "Down Your Posts" in profile section');
  assert.ok(pageContent.includes('insta-stats-row'), 'Must display 3 horizontal stats in profile');
  assert.ok(pageContent.includes('nav-hidden'), 'Must support scroll-driven auto-hiding navigation bar');

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

test('Dark mode support and profile email wrapping', async () => {
  const pageContent = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');
  const cssContent = await readFile(new URL('../app/globals.css', import.meta.url), 'utf8');
  const iconsContent = await readFile(new URL('../app/icons.tsx', import.meta.url), 'utf8');

  // Dark mode in page
  assert.ok(pageContent.includes('toggleTheme'), 'Must have toggleTheme function');
  assert.ok(pageContent.includes('aupro_theme'), 'Must persist theme preference');
  assert.ok(pageContent.includes('SunIcon') && pageContent.includes('MoonIcon'), 'Must use Sun and Moon icons');

  // Dark mode in icons
  assert.ok(iconsContent.includes('SunIcon') && iconsContent.includes('MoonIcon'), 'Must export SunIcon and MoonIcon');

  // Email wrapping in profile menu
  assert.ok(pageContent.includes('profile-dropdown-email'), 'Must use profile-dropdown-email for wrapping');
  assert.ok(cssContent.includes('word-break: break-all'), 'Must break email word across lines');
  assert.ok(cssContent.includes('[data-theme=\'dark\']'), 'Must have dark theme CSS rules');
});

test('Threads Feed & Check About post management requirements', async () => {
  const cardContent = await readFile(new URL('../app/MomentCard.tsx', import.meta.url), 'utf8');
  const pageContent = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');
  const cssContent = await readFile(new URL('../app/globals.css', import.meta.url), 'utf8');

  // 1. Text-first feed: No media fallback when no picture
  assert.ok(!cardContent.includes('insta-media-fallback'), 'Must NOT show random black picture/media fallback when no picture attached');
  assert.ok(cardContent.includes('hasMedia = Boolean'), 'Must conditionally render media only when photo/document is present');

  // 2. Dark mode posting composer visibility
  assert.ok(cssContent.includes(".threads-composer-card"), 'Must style threads-composer-card in dark mode');
  assert.ok(cssContent.includes(".threads-anon-label"), 'Must style threads-anon-label in dark mode');

  // 3. Check About subtabs: My Posts and Saved with delete and unsave
  assert.ok(pageContent.includes("aboutSubTab === 'posts'"), 'Must have My Posts subtab in About section');
  assert.ok(pageContent.includes("aboutSubTab === 'saved'"), 'Must have Saved Bookmarks subtab in About section');
  assert.ok(pageContent.includes("handleDeletePost"), 'Must support deleting user posts');
  assert.ok(pageContent.includes("handleSaveToggle"), 'Must support saving and unsaving posts');
  assert.ok(cardContent.includes("onDelete"), 'MomentCard must accept onDelete callback');
  assert.ok(cardContent.includes("onSaveToggle"), 'MomentCard must accept onSaveToggle callback');

  // 4. Modal dark mode & scroll navbar
  assert.ok(cssContent.includes(".insta-modal-sheet"), 'Must style insta-modal-sheet');
  assert.ok(cssContent.includes(".insta-modal-item"), 'Must style insta-modal-item');
  assert.ok(cssContent.includes(".bottom-nav.nav-hidden"), 'Must style auto-hiding bottom navigation bar');
  assert.ok(cssContent.includes(".insta-profile-screen"), 'Must style Instagram-style profile screen');

  // 5. In-App Navigation and Whole Page AU Info
  assert.ok(pageContent.includes("isNavigating"), 'Must support in-app navigation mode');
  assert.ok(pageContent.includes("gmaps-nav-hud-top"), 'Must render in-app turn-by-turn navigation HUD');
  assert.ok(!pageContent.includes("window.open("), 'Must NOT redirect out to external window for navigation');
  assert.ok(pageContent.includes("au-info-fullpage"), 'Must open whole page for AU Info');
});

test('Content Moderation analyzes every post for university problems, campus life, and academic studies', async () => {
  const modContent = await readFile(new URL('../app/content_moderation.ts', import.meta.url), 'utf8');

  assert.ok(modContent.includes('CAMPUS_PROBLEM_KEYWORDS'), 'Must define campus problem keyword dictionary');
  assert.ok(modContent.includes('UNIVERSITY_CAMPUS_KEYWORDS'), 'Must define university campus keyword dictionary');
  assert.ok(modContent.includes('ACADEMIC_STUDY_KEYWORDS'), 'Must define academic study keyword dictionary');
  assert.ok(modContent.includes('PROHIBITED_OFF_TOPIC_TERMS'), 'Must define prohibited off-topic terms (commercial, gossip, ads)');
  assert.ok(modContent.includes('analyzePostTopic'), 'Must export analyzePostTopic analyzer');
  assert.ok(modContent.includes('validateUniversityRelevance'), 'Must export validateUniversityRelevance');
});

test('Headteacher Administrator central server accounts, live activity stream, and shared feed sync', async () => {
  const accountsRoute = await readFile(new URL('../app/api/accounts/route.ts', import.meta.url), 'utf8');
  const activityRoute = await readFile(new URL('../app/api/activity/route.ts', import.meta.url), 'utf8');
  const feedRoute = await readFile(new URL('../app/api/feed/route.ts', import.meta.url), 'utf8');
  const authModule = await readFile(new URL('../app/auth.ts', import.meta.url), 'utf8');
  const pageContent = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');

  // Accounts API
  assert.ok(accountsRoute.includes('getAllAccounts'), 'Accounts route must return all accounts');
  assert.ok(accountsRoute.includes('registerAccount'), 'Accounts route must support registering accounts');
  assert.ok(accountsRoute.includes('purgeAllAccountsExceptHead'), 'Accounts route must support purging accounts');

  // Activity API
  assert.ok(activityRoute.includes('getAllActivities'), 'Activity route must return all activities');
  assert.ok(activityRoute.includes('logServerActivity'), 'Activity route must support appending activities');
  assert.ok(activityRoute.includes('clearAllActivities'), 'Activity route must support clearing activities');

  // Shared Feed API
  assert.ok(feedRoute.includes('getAllPosts'), 'Feed route must return all posts');
  assert.ok(feedRoute.includes('addServerPost'), 'Feed route must support publishing posts');
  assert.ok(feedRoute.includes('deleteServerPost'), 'Feed route must support deleting posts');

  // Auth sync methods
  assert.ok(authModule.includes('fetchRegisteredUsersServer'), 'Auth must export fetchRegisteredUsersServer');
  assert.ok(authModule.includes('fetchPlatformActivitiesServer'), 'Auth must export fetchPlatformActivitiesServer');
  assert.ok(authModule.includes('DEFAULT_INITIAL_ACCOUNTS'), 'Auth must have initial student accounts pre-seeded');

  // UI sync integration
  assert.ok(pageContent.includes("fetch('/api/accounts')"), 'Page must fetch accounts from server API');
  assert.ok(pageContent.includes("fetch('/api/activity')"), 'Page must fetch activity from server API');
  assert.ok(pageContent.includes("fetch('/api/feed')"), 'Page must fetch feed posts from server API');
});
