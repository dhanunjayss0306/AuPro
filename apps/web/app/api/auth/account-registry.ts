/**
 * AuPro Central Server-Side Database & Account Registry
 * 
 * Manages:
 * 1. Verified university student accounts across all devices.
 * 2. Real-time platform activity audit stream.
 * 3. Shared campus feed posts.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const MAIN_ADMIN_EMAIL = '325506402371@andhrauniversity.edu.in';

export interface ServerStudentProfile {
  email: string;
  name: string;
  username: string;
  rollNo?: string;
  department?: string;
  year?: string;
  phone?: string;
  bio?: string;
  password?: string;
  isVerified: boolean;
  verifiedAt: string;
}

export interface ServerPlatformActivity {
  id: string;
  action: string;
  actor: string;
  details?: string;
  timestamp: string;
}

export interface ServerFeedPost {
  id: string;
  username: string;
  authorEmail?: string;
  authorHandle?: string;
  avatarText?: string;
  isOfficial?: boolean;
  category?: 'normal' | 'problem' | 'announcement';
  location?: string;
  imageUrl?: string;
  imageCaption?: string;
  likesCount: number;
  likedBy?: string[];
  repostsCount: number;
  repostedBy?: string[];
  repostedFrom?: string;
  caption: string;
  commentsCount: number;
  comments?: any[];
  timeAgo: string;
  durationDays?: number;
}

interface ServerDataStore {
  accounts: Record<string, ServerStudentProfile>;
  activities: ServerPlatformActivity[];
  posts: ServerFeedPost[];
}

const DB_FILE = path.join(os.tmpdir(), 'aupro_shared_store_v1.json');

const INITIAL_HEAD_ACCOUNT: ServerStudentProfile = {
  email: MAIN_ADMIN_EMAIL,
  name: 'P V N Dhanunjay Reddy',
  username: 'p_v_n_dhanunajay_reedy',
  rollNo: '325506402371',
  department: 'Computer Science & Systems Engineering',
  year: '4th Year',
  phone: '+91 9876543210',
  bio: 'Head Administrator & Engineering Student @ Andhra University College of Engineering.',
  isVerified: true,
  verifiedAt: '2026-11-06T10:00:00.000Z',
};

const INITIAL_STUDENT_ACCOUNTS: ServerStudentProfile[] = [
  INITIAL_HEAD_ACCOUNT,
  {
    email: '325506402372@andhrauniversity.edu.in',
    name: 'A Sreenivas Rao',
    username: 'sreenivas_rao',
    rollNo: '325506402372',
    department: 'Mechanical Engineering',
    year: '4th Year',
    phone: '+91 9848022334',
    bio: 'Mechanical final year student. CAD & Thermal lab projects.',
    isVerified: true,
    verifiedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    email: '325506402375@andhrauniversity.edu.in',
    name: 'K Divya Sri',
    username: 'k_divya_sri',
    rollNo: '325506402375',
    department: 'Electronics & Communication Engineering',
    year: '3rd Year',
    phone: '+91 9989011223',
    bio: 'ECE 3rd year. VLSI and Embedded systems researcher.',
    isVerified: true,
    verifiedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    email: '325506402380@andhrauniversity.edu.in',
    name: 'M Sai Teja',
    username: 'sai_teja_au',
    rollNo: '325506402380',
    department: 'Civil Engineering',
    year: '2nd Year',
    phone: '+91 9701044556',
    bio: 'Civil engineering sophomore. Surveying and structural designs.',
    isVerified: true,
    verifiedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    email: '325506402391@andhrauniversity.edu.in',
    name: 'P Harsha Vardhan',
    username: 'harsha_vardhan',
    rollNo: '325506402391',
    department: 'Computer Science & Systems Engineering',
    year: '4th Year',
    phone: '+91 9866077889',
    bio: 'AU CSE senior. Full-stack development & AI research.',
    isVerified: true,
    verifiedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const INITIAL_ACTIVITIES: ServerPlatformActivity[] = [
  {
    id: 'act_init_1',
    action: 'User Signed In',
    actor: MAIN_ADMIN_EMAIL,
    details: 'Head Administrator authenticated into AuPro portal',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'act_init_2',
    action: 'Account Registered',
    actor: '325506402372@andhrauniversity.edu.in',
    details: 'Student A Sreenivas Rao verified identity via 6-digit OTP',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'act_init_3',
    action: 'Campus Problem Reported',
    actor: '325506402375@andhrauniversity.edu.in',
    details: 'Water purifier filter replacement needed in ECE block 2nd floor',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
  {
    id: 'act_init_4',
    action: 'Feed Post Published',
    actor: '325506402380@andhrauniversity.edu.in',
    details: 'Civil department survey lab timing updated for 2nd years',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'act_init_5',
    action: 'Applied for Certificate',
    actor: '325506402391@andhrauniversity.edu.in',
    details: 'Bonafide Certificate (Ref ID: AU-582910)',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
];

const INITIAL_POSTS: ServerFeedPost[] = [
  {
    id: 'post_init_1',
    username: 'k_divya_sri',
    authorEmail: '325506402375@andhrauniversity.edu.in',
    authorHandle: 'k_divya_sri',
    avatarText: 'K',
    isOfficial: false,
    category: 'problem',
    location: 'ECE Block 2nd Floor',
    likesCount: 5,
    repostsCount: 1,
    caption: 'Water purifier in ECE block 2nd floor is leaking continuously, please send campus maintenance to repair it.',
    commentsCount: 2,
    timeAgo: '2h ago',
    durationDays: 30,
  },
  {
    id: 'post_init_2',
    username: 'harsha_vardhan',
    authorEmail: '325506402391@andhrauniversity.edu.in',
    authorHandle: 'harsha_vardhan',
    avatarText: 'H',
    isOfficial: false,
    category: 'normal',
    location: 'Dr. B.R. Ambedkar Central Library',
    likesCount: 8,
    repostsCount: 2,
    caption: 'Does anyone have previous year question papers (PYQs) and handwritten notes for 4-1 Machine Learning and Cloud Computing?',
    commentsCount: 4,
    timeAgo: '4h ago',
    durationDays: 30,
  },
  {
    id: 'post_init_3',
    username: 'sai_teja_au',
    authorEmail: '325506402380@andhrauniversity.edu.in',
    authorHandle: 'sai_teja_au',
    avatarText: 'S',
    isOfficial: false,
    category: 'normal',
    location: 'AU Golden Jubilee Ground',
    likesCount: 12,
    repostsCount: 3,
    caption: 'AU College of Engineering sports trials will commence next Monday at the Golden Jubilee Ground. Register at the physical education department.',
    commentsCount: 1,
    timeAgo: '8h ago',
    durationDays: 30,
  },
];

function loadStore(): ServerDataStore {
  // Global memory cache first
  const globalStore = (globalThis as any).__AUPRO_GLOBAL_STORE__;
  if (globalStore && globalStore.accounts) {
    return globalStore;
  }

  // Attempt filesystem persistence
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && parsed.accounts) {
        // Guarantee Head Account
        if (!parsed.accounts[MAIN_ADMIN_EMAIL]) {
          parsed.accounts[MAIN_ADMIN_EMAIL] = INITIAL_HEAD_ACCOUNT;
        }
        (globalThis as any).__AUPRO_GLOBAL_STORE__ = parsed;
        return parsed;
      }
    }
  } catch {}

  // Fallback to fresh initial store
  const accountsMap: Record<string, ServerStudentProfile> = {};
  for (const acc of INITIAL_STUDENT_ACCOUNTS) {
    accountsMap[acc.email.toLowerCase().trim()] = acc;
  }

  const fresh: ServerDataStore = {
    accounts: accountsMap,
    activities: [...INITIAL_ACTIVITIES],
    posts: [...INITIAL_POSTS],
  };

  (globalThis as any).__AUPRO_GLOBAL_STORE__ = fresh;
  saveStoreToFile(fresh);
  return fresh;
}

function saveStoreToFile(store: ServerDataStore) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch {}
}

export function getAllAccounts(): Record<string, ServerStudentProfile> {
  const store = loadStore();
  return store.accounts;
}

export function findAccount(email: string): ServerStudentProfile | null {
  const store = loadStore();
  return store.accounts[email.toLowerCase().trim()] || null;
}

export function registerAccount(email: string, profile?: Partial<ServerStudentProfile>): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  const store = loadStore();

  const existing = store.accounts[clean];
  const updated: ServerStudentProfile = {
    email: clean,
    name: profile?.name || existing?.name || 'AU Student',
    username: profile?.username || existing?.username || clean.split('@')[0].replace(/[^a-z0-9_]/g, '_'),
    rollNo: profile?.rollNo || existing?.rollNo || clean.replace(/[^0-9]/g, '') || '32550640' + Math.floor(1000 + Math.random() * 9000),
    department: profile?.department || existing?.department || 'AU College of Engineering',
    year: profile?.year || existing?.year || '4th Year',
    phone: profile?.phone || existing?.phone || '',
    bio: profile?.bio || existing?.bio || `Student @ AU College of Engineering (${profile?.department || 'Engineering'})`,
    password: profile?.password || existing?.password || '',
    isVerified: true,
    verifiedAt: existing?.verifiedAt || new Date().toISOString(),
  };

  store.accounts[clean] = updated;
  saveStoreToFile(store);
  return true;
}

export function removeAccount(email: string): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  if (clean === MAIN_ADMIN_EMAIL || clean.startsWith('325506402371')) {
    return false; // Head account cannot be removed
  }
  const store = loadStore();
  delete store.accounts[clean];
  saveStoreToFile(store);
  return true;
}

export function purgeAllAccountsExceptHead(): void {
  const store = loadStore();
  const headAccount = store.accounts[MAIN_ADMIN_EMAIL] || INITIAL_HEAD_ACCOUNT;
  store.accounts = {
    [MAIN_ADMIN_EMAIL]: headAccount,
  };
  saveStoreToFile(store);
}

export function getAllActivities(): ServerPlatformActivity[] {
  const store = loadStore();
  return store.activities;
}

export function logServerActivity(action: string, actor: string, details?: string): ServerPlatformActivity {
  const store = loadStore();
  const newActivity: ServerPlatformActivity = {
    id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action,
    actor: actor || 'AU User',
    details,
    timestamp: new Date().toISOString(),
  };

  store.activities.unshift(newActivity);
  store.activities = store.activities.slice(0, 100); // keep last 100 events
  saveStoreToFile(store);
  return newActivity;
}

export function clearAllActivities(): void {
  const store = loadStore();
  store.activities = [];
  saveStoreToFile(store);
}

export function getAllPosts(): ServerFeedPost[] {
  const store = loadStore();
  return store.posts;
}

export function addServerPost(post: ServerFeedPost): ServerFeedPost {
  const store = loadStore();
  store.posts.unshift(post);
  store.posts = store.posts.slice(0, 100);
  saveStoreToFile(store);
  return post;
}

export function deleteServerPost(postId: string): boolean {
  const store = loadStore();
  store.posts = store.posts.filter((p) => p.id !== postId);
  saveStoreToFile(store);
  return true;
}

export function isAccountRegistered(email: string): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  const store = loadStore();
  return Boolean(store.accounts[clean]);
}

export function clearAllAccounts(): void {
  purgeAllAccountsExceptHead();
}

export function getRegisteredCount(): number {
  const store = loadStore();
  return Object.keys(store.accounts).length;
}

export function getRegisteredAccountsList(): string[] {
  const store = loadStore();
  return Object.keys(store.accounts);
}


export function togglePostLike(postId: string, userEmail: string): { likesCount: number; liked: boolean; likedBy: string[] } {
  const store = loadStore();
  const post = store.posts.find((p) => p.id === postId);
  if (!post) {
    return { likesCount: 0, liked: false, likedBy: [] };
  }
  const cleanEmail = (userEmail || 'student@andhrauniversity.edu.in').toLowerCase().trim();
  post.likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
  const idx = post.likedBy.indexOf(cleanEmail);
  let liked = false;
  if (idx >= 0) {
    post.likedBy.splice(idx, 1);
    post.likesCount = Math.max(0, post.likedBy.length);
    liked = false;
  } else {
    post.likedBy.push(cleanEmail);
    post.likesCount = post.likedBy.length;
    liked = true;
  }
  saveStoreToFile(store);
  return { likesCount: post.likesCount, liked, likedBy: post.likedBy };
}

export function addPostComment(
  postId: string,
  comment: {
    id?: string;
    username: string;
    authorEmail?: string;
    avatarText?: string;
    text: string;
    timeAgo?: string;
    imageUrl?: string;
  }
): { comments: any[]; commentsCount: number } {
  const store = loadStore();
  const post = store.posts.find((p) => p.id === postId);
  if (!post) {
    return { comments: [], commentsCount: 0 };
  }
  post.comments = Array.isArray(post.comments) ? post.comments : [];
  const newComment = {
    id: comment.id || 'cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    username: comment.username || 'AU Student',
    authorEmail: comment.authorEmail || '',
    avatarText: comment.avatarText || (comment.username ? comment.username[0].toUpperCase() : 'A'),
    text: comment.text,
    timeAgo: comment.timeAgo || 'Just now',
    ...(comment.imageUrl ? { imageUrl: comment.imageUrl } : {}),
  };
  post.comments.push(newComment);
  post.commentsCount = post.comments.length;
  saveStoreToFile(store);

  logServerActivity(
    'Comment Added',
    comment.authorEmail || comment.username,
    'Replied: "' + comment.text.slice(0, 60) + '"'
  );

  return { comments: post.comments, commentsCount: post.commentsCount };
}

export function repostFeedPost(
  postId: string,
  user: { email?: string; name?: string; username?: string }
): ServerFeedPost | null {
  const store = loadStore();
  const original = store.posts.find((p) => p.id === postId);
  if (!original) return null;

  original.repostsCount = (original.repostsCount || 0) + 1;
  original.repostedBy = Array.isArray(original.repostedBy) ? original.repostedBy : [];
  if (user.email && !original.repostedBy.includes(user.email.toLowerCase().trim())) {
    original.repostedBy.push(user.email.toLowerCase().trim());
  }

  const repostUsername = user.username || (user.name ? user.name.toLowerCase().replace(/\s+/g, '_') : 'au.student');
  const repostUserEmail = user.email || '';

  const newPost = {
    id: 'repost_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    username: repostUsername,
    authorEmail: repostUserEmail,
    authorHandle: repostUsername,
    avatarText: user.name ? user.name[0].toUpperCase() : 'R',
    isOfficial: false,
    category: original.category || 'normal',
    location: original.location,
    imageUrl: original.imageUrl,
    imageCaption: original.imageCaption,
    likesCount: 0,
    likedBy: [],
    repostsCount: 0,
    repostedFrom: original.authorHandle || original.username,
    caption: '🔁 Reposted from @' + (original.authorHandle || original.username) + ':\n\n' + original.caption,
    commentsCount: 0,
    comments: [],
    timeAgo: 'Just now',
    durationDays: 30,
  };

  store.posts.unshift(newPost);
  store.posts = store.posts.slice(0, 100);
  saveStoreToFile(store);

  logServerActivity(
    'Post Reposted',
    repostUserEmail || repostUsername,
    'Reposted post by @' + (original.authorHandle || original.username)
  );

  return newPost;
}
