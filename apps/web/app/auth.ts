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
 */
export async function sendUniversityOtp(email: string, fullName: string, rollNo: string) {
  const cleanEmail = email.toLowerCase().trim();
  if (!isValidCollegeEmail(cleanEmail)) {
    throw new Error('Only official @andhrauniversity.edu.in emails are permitted.');
  }

  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, fullName, rollNo }),
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

/**
 * Client Registry of Verified Students (Local + Supabase sync)
 */
export function getRegisteredUsers(): Record<string, StudentProfile> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('aupro_registered_users');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRegisteredUser(profile: StudentProfile) {
  if (typeof window === 'undefined') return;
  try {
    const users = getRegisteredUsers();
    users[profile.email.toLowerCase().trim()] = {
      ...profile,
      isVerified: true,
      verifiedAt: profile.verifiedAt || new Date().toISOString(),
    };
    localStorage.setItem('aupro_registered_users', JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save registered user:', e);
  }
}

export function findRegisteredUser(email: string): StudentProfile | null {
  const users = getRegisteredUsers();
  return users[email.toLowerCase().trim()] || null;
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
