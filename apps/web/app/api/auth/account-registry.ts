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

// Department helpers mirrored from app/api/auth/security.ts (kept local
// instead of imported: this registry is also loaded directly by node --test,
// where an extensionless relative import cannot resolve).
function normalizeDepartmentKey(department: string | null | undefined): string {
  if (!department) return 'other';
  const d = department.toLowerCase();
  if (d.includes('computer') || d.includes('cse') || /(^|[^a-z])cs([^a-z]|$)/.test(d)) return 'cse';
  if (d.includes('electronics') || d.includes('ece') || /(^|[^a-z])ec([^a-z]|$)/.test(d)) return 'ece';
  if (d.includes('civil')) return 'civil';
  if (d.includes('mechanical') || d.includes('mech')) return 'mech';
  return 'other';
}

function getHodEmailForDepartment(department: string | null | undefined): string | null {
  const key = normalizeDepartmentKey(department);
  if (key === 'other') return null;
  return `hod.${key}@andhrauniversity.edu.in`;
}

// Application lifecycle for the HOD signing flow:
// pending     = submitted, awaiting Head Administrator verification
// approved    = Head Administrator verified, HOD notified, awaiting HOD to post a signing time
// time_posted = HOD posted a signing date/time/venue; student comes in person
// signed      = student came in person and got it signed / collected (end state)
// rejected    = Head Administrator rejected
export type ApplicationStatus = 'pending' | 'approved' | 'time_posted' | 'signed' | 'rejected';

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


export interface ServerStudentApplication {
  id: string;
  refId: string;
  studentName: string;
  studentEmail: string;
  rollNo: string;
  serviceTitle: string;
  purpose?: string;
  department?: string;
  year?: string;
  submittedAt: string;
  status: ApplicationStatus;
  documentUrl?: string;
  documentName?: string;
  letterContent?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentVenue?: string;
  requiredDocuments?: string;
  verificationNote?: string;
}

interface ServerDataStore {
  accounts: Record<string, ServerStudentProfile>;
  activities: ServerPlatformActivity[];
  posts: ServerFeedPost[];
  applications?: ServerStudentApplication[];
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

const INITIAL_POSTS: ServerFeedPost[] = [];

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
        // Purge legacy demo posts and any ghost posts without caption or image
        parsed.posts = (parsed.posts || []).filter(
          (p: any) => p && !p.id?.startsWith('post_init_') && (Boolean(p.caption?.trim()) || Boolean(p.imageUrl))
        );
        parsed.applications = parsed.applications || [];
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
    applications: [],
  };

  (globalThis as any).__AUPRO_GLOBAL_STORE__ = fresh;
  saveStoreToFile(fresh);
  return fresh;
}

let saveDebounceTimer: any = null;

function saveStoreToFile(store: ServerDataStore) {
  // 1. Synchronous in-memory update: read operations immediately see new data in 0.001ms
  (globalThis as any).__AUPRO_GLOBAL_STORE__ = store;

  // 2. Debounced asynchronous disk flush: prevents blocking Node event loop on high-concurrency mobile traffic
  if (saveDebounceTimer) return;
  saveDebounceTimer = setTimeout(() => {
    saveDebounceTimer = null;
    try {
      const currentStore = (globalThis as any).__AUPRO_GLOBAL_STORE__ || store;
      const tmpFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(2, 7)}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(currentStore, null, 2), 'utf8');

      try {
        fs.renameSync(tmpFile, DB_FILE);
      } catch {
        try {
          fs.copyFileSync(tmpFile, DB_FILE);
          fs.unlinkSync(tmpFile);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to persist AuPro store:', err);
    }
  }, 100);
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
  // Filter out any ghost/blank posts or legacy mock posts
  return (store.posts || []).filter(
    (p) => p && !p.id?.startsWith('post_init_') && (Boolean(p.caption?.trim()) || Boolean(p.imageUrl))
  );
}

export function addServerPost(post: ServerFeedPost): ServerFeedPost {
  const store = loadStore();
  // Reject ghost posts that have neither caption nor image
  if (!post || (!post.caption?.trim() && !post.imageUrl)) {
    return post;
  }
  const existingIdx = store.posts.findIndex((p) => p.id === post.id);
  if (existingIdx >= 0) {
    store.posts[existingIdx] = { ...store.posts[existingIdx], ...post };
  } else {
    store.posts.unshift(post);
    store.posts = store.posts.slice(0, 100);
  }
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


export function togglePostLike(
  postId: string,
  userEmail: string,
  postDetails?: Partial<ServerFeedPost>
): { likesCount: number; liked: boolean; likedBy: string[] } {
  const store = loadStore();
  let post = store.posts.find((p) => p.id === postId);
  const cleanEmail = (userEmail || 'student@andhrauniversity.edu.in').toLowerCase().trim();

  if (!post) {
    const hasContent = Boolean(postDetails?.caption?.trim()) || Boolean(postDetails?.imageUrl);
    if (!hasContent) {
      // Do not create an empty ghost post
      return { likesCount: 0, liked: false, likedBy: [] };
    }
    const initialLikedBy = Array.isArray(postDetails?.likedBy) ? [...postDetails.likedBy] : [];
    if (!initialLikedBy.includes(cleanEmail)) {
      initialLikedBy.push(cleanEmail);
    }
    post = {
      id: postId,
      username: postDetails?.username || 'AU Student',
      authorEmail: postDetails?.authorEmail,
      authorHandle: postDetails?.authorHandle || 'student',
      avatarText: postDetails?.avatarText || (postDetails?.username ? postDetails.username.charAt(0).toUpperCase() : 'A'),
      isOfficial: Boolean(postDetails?.isOfficial),
      category: postDetails?.category || 'normal',
      location: postDetails?.location,
      imageUrl: postDetails?.imageUrl,
      imageCaption: postDetails?.imageCaption,
      caption: postDetails?.caption || '',
      likesCount: Math.max(initialLikedBy.length, typeof postDetails?.likesCount === 'number' ? postDetails.likesCount : 1),
      likedBy: initialLikedBy,
      repostsCount: typeof postDetails?.repostsCount === 'number' ? postDetails.repostsCount : 0,
      commentsCount: typeof postDetails?.commentsCount === 'number' ? postDetails.commentsCount : (Array.isArray(postDetails?.comments) ? postDetails.comments.length : 0),
      comments: Array.isArray(postDetails?.comments) ? [...postDetails.comments] : [],
      timeAgo: postDetails?.timeAgo || 'Just now',
      durationDays: postDetails?.durationDays || 30,
    };
    store.posts.unshift(post);
    saveStoreToFile(store);
    return { likesCount: post.likesCount, liked: true, likedBy: post.likedBy || initialLikedBy };
  } else if (postDetails) {
    // Enrich existing post if it was previously incomplete
    if (!post.caption?.trim() && postDetails.caption?.trim()) {
      post.caption = postDetails.caption;
    }
    if (!post.imageUrl && postDetails.imageUrl) {
      post.imageUrl = postDetails.imageUrl;
    }
    if ((!post.username || post.username === 'AU Student') && postDetails.username && postDetails.username !== 'AU Student') {
      post.username = postDetails.username;
    }
    if (!post.avatarText && postDetails.avatarText) {
      post.avatarText = postDetails.avatarText;
    }
    if (!post.authorEmail && postDetails.authorEmail) {
      post.authorEmail = postDetails.authorEmail;
    }
  }

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
  },
  postDetails?: Partial<ServerFeedPost>
): { comments: any[]; commentsCount: number } {
  const store = loadStore();
  let post = store.posts.find((p) => p.id === postId);
  if (!post) {
    const hasContent = Boolean(postDetails?.caption?.trim()) || Boolean(postDetails?.imageUrl);
    if (!hasContent) {
      // Do not create a ghost post in central store
      return { comments: [comment], commentsCount: 1 };
    }
    const priorComments = Array.isArray(postDetails?.comments) ? [...postDetails.comments] : [];
    post = {
      id: postId,
      username: postDetails?.username || 'AU Student',
      authorEmail: postDetails?.authorEmail,
      authorHandle: postDetails?.authorHandle || 'student',
      avatarText: postDetails?.avatarText || (postDetails?.username ? postDetails.username.charAt(0).toUpperCase() : 'A'),
      isOfficial: Boolean(postDetails?.isOfficial),
      category: postDetails?.category || 'normal',
      location: postDetails?.location,
      imageUrl: postDetails?.imageUrl,
      imageCaption: postDetails?.imageCaption,
      caption: postDetails?.caption || '',
      likesCount: typeof postDetails?.likesCount === 'number' ? postDetails.likesCount : (Array.isArray(postDetails?.likedBy) ? postDetails.likedBy.length : 0),
      likedBy: Array.isArray(postDetails?.likedBy) ? postDetails.likedBy : [],
      repostsCount: typeof postDetails?.repostsCount === 'number' ? postDetails.repostsCount : 0,
      commentsCount: priorComments.length,
      comments: priorComments,
      timeAgo: postDetails?.timeAgo || 'Just now',
      durationDays: postDetails?.durationDays || 30,
    };
    store.posts.unshift(post);
  } else if (postDetails) {
    // Enrich existing post if incomplete
    if (!post.caption?.trim() && postDetails.caption?.trim()) {
      post.caption = postDetails.caption;
    }
    if (!post.imageUrl && postDetails.imageUrl) {
      post.imageUrl = postDetails.imageUrl;
    }
    if ((!post.username || post.username === 'AU Student') && postDetails.username && postDetails.username !== 'AU Student') {
      post.username = postDetails.username;
    }
    if (!post.avatarText && postDetails.avatarText) {
      post.avatarText = postDetails.avatarText;
    }
    if (!post.authorEmail && postDetails.authorEmail) {
      post.authorEmail = postDetails.authorEmail;
    }
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
  const existingIdx = post.comments.findIndex((c) => c.id === newComment.id);
  if (existingIdx >= 0) {
    post.comments[existingIdx] = newComment;
  } else {
    post.comments.push(newComment);
  }
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

export function getAllApplications(): ServerStudentApplication[] {
  const store = loadStore();
  return store.applications || [];
}

export function addStudentApplication(app: Partial<ServerStudentApplication>): ServerStudentApplication {
  const store = loadStore();
  store.applications = Array.isArray(store.applications) ? store.applications : [];
  const refId = app.refId || ('AU-' + Math.floor(100000 + Math.random() * 900000));
  const newApp: ServerStudentApplication = {
    id: app.id || ('app_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
    refId,
    studentName: app.studentName || 'AU Student',
    studentEmail: app.studentEmail || '',
    rollNo: app.rollNo || 'Pending',
    serviceTitle: app.serviceTitle || 'Certificate Application',
    purpose: app.purpose || 'Verification',
    department: app.department || 'AU Engineering',
    year: app.year || '4th Year',
    submittedAt: app.submittedAt || new Date().toISOString(),
    status: (app.status as any) || 'pending',
    documentUrl: app.documentUrl,
    documentName: app.documentName,
    letterContent: app.letterContent,
    appointmentDate: app.appointmentDate,
    appointmentTime: app.appointmentTime,
    appointmentVenue: app.appointmentVenue,
    requiredDocuments: app.requiredDocuments,
    verificationNote: app.verificationNote,
  };

  store.applications.unshift(newApp);
  store.applications = store.applications.slice(0, 100);
  saveStoreToFile(store);

  logServerActivity(
    'Student Application Submitted',
    newApp.studentEmail || newApp.studentName,
    newApp.serviceTitle + ' (Ref ID: ' + newApp.refId + ') - ' + (newApp.purpose || 'Academic Need')
  );

  return newApp;
}

export function getApplicationByRefId(refId: string): ServerStudentApplication | null {
  const store = loadStore();
  return (store.applications || []).find((a) => a.refId === refId || a.id === refId) || null;
}

/**
 * Number of applications in a department that the Head Administrator has
 * verified and are now waiting for the HOD's signature (status 'approved').
 */
export function countApprovedAwaitingHod(department: string | null | undefined): number {
  const store = loadStore();
  const key = normalizeDepartmentKey(department);
  return (store.applications || []).filter(
    (a) => a.status === 'approved' && normalizeDepartmentKey(a.department) === key
  ).length;
}

// Alias kept for readability at call sites that talk about the HOD queue.
export function getHodPendingCount(department: string | null | undefined): number {
  return countApprovedAwaitingHod(department);
}

export function updateApplicationStatus(
  refId: string,
  status: ApplicationStatus,
  details?: {
    appointmentDate?: string;
    appointmentTime?: string;
    appointmentVenue?: string;
    requiredDocuments?: string;
    verificationNote?: string;
  },
  actor?: { email?: string; role?: 'head_admin' | 'hod' | 'student' }
): { updated: boolean; hodPendingCount: number; hodBatchAlert: boolean } {
  const store = loadStore();
  store.applications = Array.isArray(store.applications) ? store.applications : [];
  const app = store.applications.find((a) => a.refId === refId || a.id === refId);
  if (!app) return { updated: false, hodPendingCount: 0, hodBatchAlert: false };
  const previousStatus = app.status;
  app.status = status;
  if (details) {
    if (details.appointmentDate) app.appointmentDate = details.appointmentDate;
    if (details.appointmentTime) app.appointmentTime = details.appointmentTime;
    if (details.appointmentVenue) app.appointmentVenue = details.appointmentVenue;
    if (details.requiredDocuments) app.requiredDocuments = details.requiredDocuments;
    if (details.verificationNote) {
      app.verificationNote = details.verificationNote;
    } else if (status === 'approved') {
      app.verificationNote = 'It is okay. You are verified. You can come to the Hachure manager for the sign.';
    }
  } else if (status === 'approved' && !app.verificationNote) {
    app.verificationNote = 'It is okay. You are verified. You can come to the Hachure manager for the sign.';
  }
  saveStoreToFile(store);

  const actorEmail = actor?.email || MAIN_ADMIN_EMAIL;
  const actionLabel =
    status === 'approved'
      ? 'Application Approved — HOD Notified'
      : status === 'time_posted'
        ? 'Signing Time Posted by HOD'
        : status === 'signed'
          ? 'Certificate Signed & Collected'
          : 'Application Status Updated';
  logServerActivity(
    actionLabel,
    actorEmail,
    app.serviceTitle + ' for ' + app.studentName + ' (' + app.refId + ') marked as ' + status
  );

  // On approval the HOD of the student's department is notified, and if
  // more than 10 students are now waiting for that HOD's signature, a
  // batch alert goes to the HOD and to the Head Administrator account.
  let hodPendingCount = countApprovedAwaitingHod(app.department);
  let hodBatchAlert = false;
  if (status === 'approved' && previousStatus !== 'approved') {
    const deptLabel = app.department || 'AU Engineering';
    const hodEmail = getHodEmailForDepartment(app.department);
    logServerActivity(
      'HOD Notified — Signature Requested',
      hodEmail || MAIN_ADMIN_EMAIL,
      app.serviceTitle + ' for ' + app.studentName + ' (' + app.refId + ') verified by the Head Administrator. ' +
        (hodEmail ? 'HOD ' + hodEmail : 'Head Administrator') + ' notified — ' +
        hodPendingCount + ' student' + (hodPendingCount === 1 ? '' : 's') + ' now waiting for the HOD signature in ' + deptLabel + '.'
    );
    if (hodPendingCount > 10) {
      hodBatchAlert = true;
      const alertDetails =
        hodPendingCount + ' students in ' + deptLabel + ' are waiting for the HOD signature. ' +
        'Please post a signing time so they can come and collect their signed documents.';
      logServerActivity('HOD Signing Queue Alert — More Than 10 Waiting', hodEmail || MAIN_ADMIN_EMAIL, alertDetails);
      logServerActivity('HOD Signing Queue Alert — More Than 10 Waiting', MAIN_ADMIN_EMAIL, alertDetails);
    }
  }
  return { updated: true, hodPendingCount, hodBatchAlert };
}
