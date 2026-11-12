import { lookupCseStudentByEmail } from './cse-students';

/**
 * AuPro Authentication & Cloudflare Integration Service
 * 
 * Supports:
 * 1. Firebase / Supabase Authentication (Google Sign-In + Email/Password)
 * 2. Andhra University Domain Restriction (@andhrauniversity.edu.in)
 * 3. Cryptographic One-Time OTP Verification (/api/auth/send-otp & /api/auth/verify-otp)
 * 4. Role-based Announcement Authorizations
 * 5. Cloudflare R2 Media Storage Uploads
 */

export interface AuUser {
  uid: string;
  name: string;
  email: string;
  handle: string;
  avatarText: string;
  role: 'student' | 'faculty' | 'admin' | 'office';
  isOfficialAnnouncementAuthorized: boolean;
}

// Configurable list of official Andhra University emails authorized to publish Announcements.
export const AUTHORIZED_ANNOUNCEMENT_EMAILS = [
  'admin@andhrauniversity.edu.in',
  'office@andhrauniversity.edu.in',
  'principal.aucoe@andhrauniversity.edu.in',
  'dean.academic@andhrauniversity.edu.in',
  'dean_student_affairs@andhrauniversity.edu.in',
  'hod.cse@andhrauniversity.edu.in',
  'hod.ece@andhrauniversity.edu.in',
  'hod.civil@andhrauniversity.edu.in',
  'hod.mech@andhrauniversity.edu.in',
  'examcell@andhrauniversity.edu.in',
  'library@andhrauniversity.edu.in',
];

export function isAnnouncementAuthorized(email: string): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  if (AUTHORIZED_ANNOUNCEMENT_EMAILS.includes(clean)) return true;
  if (clean.startsWith('admin') || clean.startsWith('dean') || clean.startsWith('hod') || clean.startsWith('office')) {
    return true;
  }
  return false;
}

export function isValidCollegeEmail(email: string): boolean {
  if (!email) return false;
  return email.toLowerCase().trim().endsWith('@andhrauniversity.edu.in');
}

/**
 * Supabase Config
 */
export const supabaseClientConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mxcspycyejbexzifrauw.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

/**
 * Storage Config
 */
export const storageConfig = {
  provider: (process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'supabase') as 'supabase' | 'r2',
  supabaseBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'media',
  r2PublicBaseUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || '',
};

export interface StudentProfile {
  name: string;
  username: string;
  email: string;
  rollNo: string;
  department: string;
  year: string;
  section?: string;
  phone: string;
  bio?: string;
  isVerified?: boolean;
  verifiedAt?: string;
  password?: string;
}

export function getGoogleOAuthUrl(redirectTo?: string): string {
  const baseUrl = supabaseClientConfig.url || 'https://mxcspycyejbexzifrauw.supabase.co';
  const target = redirectTo || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${baseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(target)}&prompt=select_account`;
}

/**
 * Request a 6-digit cryptographic OTP code to verify official college email.
 * Name, roll number, department and year are NOT sent: the server resolves
 * them from the second-year CSE directory by the email's roll number.
 */
export async function sendUniversityOtp(email: string, isSignup = false) {
  const cleanEmail = email.toLowerCase().trim();
  if (!isValidCollegeEmail(cleanEmail)) {
    throw new Error('Only official @andhrauniversity.edu.in emails are permitted.');
  }

  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, isSignup }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to dispatch verification code.');
  }
  return data;
}

/**
 * Verify 6-digit OTP code against server cryptographic token.
 */
export async function verifyUniversityOtp(email: string, otp: string, token: string) {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.toLowerCase().trim(), otp: otp.trim(), token }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid verification code.');
  }
  return data;
}

export const HEAD_ACCOUNT_EMAIL = '325506402371@andhrauniversity.edu.in';

export function isHeadAccount(email?: string): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return clean === HEAD_ACCOUNT_EMAIL || clean.startsWith('325506402371');
}

// HOD (Head of Department) accounts: hod.<dept>@andhrauniversity.edu.in.
// Mirrors the server-side HOD role in app/api/auth/security.ts.
export function isHodAccount(email?: string): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return clean.startsWith('hod') && clean.endsWith('@andhrauniversity.edu.in');
}

// Department key for an HOD mailbox: hod.cse -> 'cse', hod.ece -> 'ece',
// hod.civil -> 'civil', hod.mech -> 'mech', generic hod.<x> -> 'x'.
export function getHodDepartment(email?: string): string {
  if (!email || !isHodAccount(email)) return 'other';
  const local = email.toLowerCase().trim().split('@')[0];
  if (!local.startsWith('hod.')) return 'other';
  const key = local.slice(4).split('.')[0];
  return key || 'other';
}

// Normalizes a free-text department string (as stored on applications)
// to a department key: computer science / cse / cs -> 'cse',
// electronics / ece -> 'ece', civil -> 'civil', mechanical / mech -> 'mech'.
export function normalizeDepartmentKey(department?: string | null): string {
  if (!department) return 'other';
  const d = department.toLowerCase();
  if (d.includes('computer') || d.includes('cse') || /(^|[^a-z])cs([^a-z]|$)/.test(d)) return 'cse';
  if (d.includes('electronics') || d.includes('ece') || /(^|[^a-z])ec([^a-z]|$)/.test(d)) return 'ece';
  if (d.includes('civil')) return 'civil';
  if (d.includes('mechanical') || d.includes('mech')) return 'mech';
  return 'other';
}

// Display name for each HOD department key.
export const HOD_DEPARTMENT_NAMES: Record<string, string> = {
  cse: 'Computer Science & Systems Engineering',
  ece: 'Electronics & Communication Engineering',
  civil: 'Civil Engineering',
  mech: 'Mechanical Engineering',
  other: 'Andhra University College of Engineering',
};

// Only the Head Administrator is seeded here. Every other account must
// come from the second-year CSE directory via OTP verification — the demo
// students were removed 2026-11-12.
export const DEFAULT_INITIAL_ACCOUNTS: Record<string, StudentProfile> = {
  [HEAD_ACCOUNT_EMAIL]: {
    email: HEAD_ACCOUNT_EMAIL,
    name: 'P V N Dhanunjay Reddy',
    username: 'p_v_n_dhanunajay_reedy',
    rollNo: '325506402371',
    department: 'Computer Science & Systems Engineering',
    year: '4th Year',
    phone: '+91 9876543210',
    bio: 'Head Administrator & Engineering Student @ Andhra University College of Engineering.',
    isVerified: true,
    verifiedAt: '2026-11-06T10:00:00.000Z',
  },
};

export const DEFAULT_INITIAL_ACTIVITIES: PlatformActivity[] = [
  {
    id: 'act_init_1',
    action: 'User Signed In',
    actor: HEAD_ACCOUNT_EMAIL,
    details: 'Head Administrator authenticated into AuPro portal',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
];

/**
 * Client Registry of Verified Students (Local + Server API sync)
 */
export function getRegisteredUsers(): Record<string, StudentProfile> {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_ACCOUNTS;
  try {
    const raw = localStorage.getItem('aupro_registered_users');
    let users: Record<string, StudentProfile> = raw ? JSON.parse(raw) : {};

    // If local registry has less than 2 accounts, seed with default initial accounts
    if (Object.keys(users).length < 2) {
      users = { ...DEFAULT_INITIAL_ACCOUNTS, ...users };
      localStorage.setItem('aupro_registered_users', JSON.stringify(users));
    }

    // Ensure the Head Account always exists in registry
    if (!users[HEAD_ACCOUNT_EMAIL]) {
      users[HEAD_ACCOUNT_EMAIL] = DEFAULT_INITIAL_ACCOUNTS[HEAD_ACCOUNT_EMAIL];
      localStorage.setItem('aupro_registered_users', JSON.stringify(users));
    }

    // Drop any account that is neither the Head Administrator, nor an
    // HOD, nor a student in the second-year CSE directory (self-cleans
    // local registries written before the directory rule).
    let pruned = false;
    for (const email of Object.keys(users)) {
      const clean = email.toLowerCase().trim();
      if (isHeadAccount(clean) || isHodAccount(clean)) continue;
      if (lookupCseStudentByEmail(clean)) continue;
      delete users[clean];
      pruned = true;
    }
    if (pruned) {
      localStorage.setItem('aupro_registered_users', JSON.stringify(users));
    }
    return users;
  } catch {
    return DEFAULT_INITIAL_ACCOUNTS;
  }
}

export async function fetchRegisteredUsersServer(): Promise<Record<string, StudentProfile>> {
  try {
    const res = await fetch('/api/accounts');
    if (res.ok) {
      const data = await res.json();
      if (data?.accounts && Object.keys(data.accounts).length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('aupro_registered_users', JSON.stringify(data.accounts));
        }
        return data.accounts;
      }
    }
  } catch (err) {
    console.warn('Could not sync accounts from server API:', err);
  }
  return getRegisteredUsers();
}

export function saveRegisteredUser(profile: StudentProfile) {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredUsers();
    const updatedProfile = {
      ...profile,
      isVerified: true,
      verifiedAt: profile.verifiedAt || new Date().toISOString(),
    };
    users[profile.email.toLowerCase().trim()] = updatedProfile;
    localStorage.setItem('aupro_registered_users', JSON.stringify(users));

    // Asynchronously synchronize with central server
    fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProfile),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save registered user:', e);
  }
}

export function deleteRegisteredUser(email: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const clean = email.toLowerCase().trim();
    if (isHeadAccount(clean)) {
      console.warn('Cannot delete Head Account');
      return false;
    }
    const users = getRegisteredUsers();
    delete users[clean];
    localStorage.setItem('aupro_registered_users', JSON.stringify(users));

    // Asynchronously synchronize deletion with central server
    fetch('/api/accounts?email=' + encodeURIComponent(clean), {
      method: 'DELETE',
    }).catch(() => {});

    return true;
  } catch (e) {
    console.error('Failed to delete registered user:', e);
    return false;
  }
}

export function purgeAllExceptHeadAccount(): void {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredUsers();
    const headProfile = users[HEAD_ACCOUNT_EMAIL] || DEFAULT_INITIAL_ACCOUNTS[HEAD_ACCOUNT_EMAIL];
    const purged: Record<string, StudentProfile> = {
      [HEAD_ACCOUNT_EMAIL]: headProfile,
    };
    localStorage.setItem('aupro_registered_users', JSON.stringify(purged));

    // Asynchronously synchronize purge with central server
    fetch('/api/accounts?purgeAll=true', {
      method: 'DELETE',
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to purge accounts:', e);
  }
}

export function findRegisteredUser(email: string): StudentProfile | null {
  const users = getRegisteredUsers();
  return users[email.toLowerCase().trim()] || null;
}

export interface PlatformActivity {
  id: string;
  action: string;
  actor: string;
  details?: string;
  timestamp: string;
}

export function logPlatformActivity(action: string, actor: string, details?: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('aupro_platform_activities');
    const list: PlatformActivity[] = raw ? JSON.parse(raw) : [...DEFAULT_INITIAL_ACTIVITIES];
    const newEntry: PlatformActivity = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action,
      actor: actor || 'AU User',
      details,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newEntry);
    localStorage.setItem('aupro_platform_activities', JSON.stringify(list.slice(0, 100)));

    // Asynchronously synchronize activity event to central server
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, actor, details }),
    }).catch(() => {});
  } catch {}
}

export function getPlatformActivities(): PlatformActivity[] {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_ACTIVITIES;
  try {
    const raw = localStorage.getItem('aupro_platform_activities');
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list) || list.length === 0) {
      localStorage.setItem('aupro_platform_activities', JSON.stringify(DEFAULT_INITIAL_ACTIVITIES));
      return DEFAULT_INITIAL_ACTIVITIES;
    }
    return list;
  } catch {
    return DEFAULT_INITIAL_ACTIVITIES;
  }
}

export async function fetchPlatformActivitiesServer(): Promise<PlatformActivity[]> {
  try {
    const res = await fetch('/api/activity');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.activities)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('aupro_platform_activities', JSON.stringify(data.activities));
        }
        return data.activities;
      }
    }
  } catch (err) {
    console.warn('Could not sync activities from server API:', err);
  }
  return getPlatformActivities();
}

export function clearPlatformActivities(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('aupro_platform_activities');
    fetch('/api/activity', {
      method: 'DELETE',
    }).catch(() => {});
  } catch {}
}

export async function supabaseSignUp(data: {
  email: string;
  password: string;
  fullName: string;
  username: string;
  rollNo: string;
  department: string;
  year: string;
  phone: string;
}) {
  const baseUrl = supabaseClientConfig.url || 'https://mxcspycyejbexzifrauw.supabase.co';
  const apikey = supabaseClientConfig.anonKey;

  if (!apikey) {
    return { success: true, user: { email: data.email, full_name: data.fullName } };
  }

  const res = await fetch(`${baseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': apikey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      data: {
        full_name: data.fullName,
        username: data.username,
        roll_no: data.rollNo,
        department: data.department,
        year: data.year,
        phone: data.phone,
      },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.msg || json.error_description || json.message || 'Signup failed');
  }
  return { success: true, user: json.user || json };
}

export async function supabaseSignIn(email: string, password: string) {
  const baseUrl = supabaseClientConfig.url || 'https://mxcspycyejbexzifrauw.supabase.co';
  const apikey = supabaseClientConfig.anonKey;

  if (!apikey) {
    return { success: true, session: null };
  }

  const res = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': apikey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error_description || json.message || 'Invalid credentials');
  }
  return { success: true, session: json };
}
