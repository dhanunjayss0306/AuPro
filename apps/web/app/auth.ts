/**
 * AuPro Authentication & Cloudflare Integration Service
 * 
 * Supports:
 * 1. Firebase Authentication (Google Sign-In + Email/Password)
 * 2. Andhra University Domain Restriction (@andhrauniversity.edu.in)
 * 3. Role-based Announcement Authorizations
 * 4. Cloudflare R2 Media Storage Uploads
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
// Additional authorized emails can be configured here or in environment variables.
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
 * Supabase Config (Recommended Backend)
 * Add these values in your Vercel Project Settings > Environment Variables
 * or in .env.local for local development.
 */
export const supabaseClientConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

/**
 * Firebase Config
 * Add these values in your Vercel Project Settings > Environment Variables
 * or in .env.local for local development.
 */
export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

/**
 * Storage Config (100% Free - No Credit Card Needed)
 * Default: Supabase Storage (1 GB free built directly into your Supabase project)
 * Optional: Cloudflare R2 (only if you ever want to add a card later)
 */
export const storageConfig = {
  provider: (process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'supabase') as 'supabase' | 'r2',
  supabaseBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'media',
  r2PublicBaseUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || '',
};

/**
 * Cloudflare R2 Config (Optional - Requires card verification on Cloudflare)
 */
export const cloudflareR2Config = {
  publicBaseUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || '',
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
}

export function getGoogleOAuthUrl(redirectTo?: string): string {
  const baseUrl = supabaseClientConfig.url || 'https://mxcspycyejbexzifrauw.supabase.co';
  const target = redirectTo || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${baseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(target)}&hd=andhrauniversity.edu.in`;
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
