/**
 * AuPro Server-Side Verified Account Registry
 * 
 * Rules:
 * 1. ONE email ID can create ONLY ONE account. Once verified, another account cannot be created.
 * 2. Main Admin ID: 325506402371@andhrauniversity.edu.in
 * 3. All previous accounts are purged.
 */

export const MAIN_ADMIN_EMAIL = '325506402371@andhrauniversity.edu.in';

// Global set of verified college student accounts (in-memory persistent across requests)
const globalAccounts = (globalThis as any).__AUPRO_REGISTERED_ACCOUNTS__ || new Set<string>();
(globalThis as any).__AUPRO_REGISTERED_ACCOUNTS__ = globalAccounts;

export function isAccountRegistered(email: string): boolean {
  if (!email) return false;
  return globalAccounts.has(email.toLowerCase().trim());
}

export function registerAccount(email: string): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  globalAccounts.add(clean);
  return true;
}

export function clearAllAccounts(): void {
  globalAccounts.clear();
}

export function getRegisteredCount(): number {
  return globalAccounts.size;
}

export function getRegisteredAccountsList(): string[] {
  return Array.from(globalAccounts);
}
