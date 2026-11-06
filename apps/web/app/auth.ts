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
 * Cloudflare R2 Config for Post Attachments (Images, PDFs)
 */
export const cloudflareR2Config = {
  publicBaseUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || '',
};
