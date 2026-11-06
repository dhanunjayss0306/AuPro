import React from 'react';

// 1. Exact Instagram Home / Feed Icon
export function InstagramFeedIcon({ active = false, size = 24 }: { active?: boolean; size?: number }) {
  if (active) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 10.5V20a2 2 0 0 1-2 2h-5a1 1 0 0 1-1-1v-5h-4v5a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2v-9.5a1.5 1.5 0 0 1 .53-1.15l8.5-7.14a1.5 1.5 0 0 1 1.94 0l8.5 7.14c.33.28.53.7.53 1.15z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5l9-7 9 7V20a2 2 0 0 1-2 2h-4a1 1 0 0 1-1-1v-5H9v5a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2V9.5z" />
    </svg>
  );
}

// 2. Exact Instagram Like / Heart Icon
export function InstagramLikeIcon({ filled = false, size = 24 }: { filled?: boolean; size?: number }) {
  if (filled) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#ED4956">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// 3. Exact Instagram Comment Bubble Icon
export function InstagramCommentIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22z" />
    </svg>
  );
}

// 4. Exact Instagram Share / Paper Airplane Icon
export function InstagramShareIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// Repost icon for the AuPro feed
export function RepostIcon({ active = false, size = 24 }: { active?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3l4 4-4 4" />
      <path d="M3 7h14a4 4 0 0 1 4 4v1" />
      <path d="M7 21l-4-4 4-4" />
      <path d="M21 17H7a4 4 0 0 1-4-4v-1" />
    </svg>
  );
}

// 5. Exact Instagram Bookmark / Save Icon
export function InstagramSaveIcon({ filled = false, size = 24 }: { filled?: boolean; size?: number }) {
  if (filled) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// 6. Exact Instagram More / Options / Report (Three Dots)
export function InstagramMoreIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="2" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
    </svg>
  );
}

// 7. Instagram Location Pin Icon
export function InstagramLocationIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// 8. Modern Clean Applications Icon (replacing unicode ▣)
export function ApplicationsIcon({ active = false, size = 24 }: { active?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

// 9. Modern Chatbot Icon (replacing unicode ◌)
export function ChatbotIcon({ active = false, size = 24 }: { active?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.4" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="16" height="14" rx="4" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 2v4" />
      <path d="M9 16h6" />
    </svg>
  );
}

// 10. Darkened About Icon (solid, darkened #111827 / #1D1D1F high contrast, replacing ⓘ)
export function DarkenedAboutIcon({ active = false, size = 24 }: { active?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth={active ? "2.8" : "2.4"} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" stroke="#111827" strokeWidth="2.5" />
      <circle cx="12" cy="8" r="1.2" fill="#111827" stroke="none" />
    </svg>
  );
}

// 11. Big Plus Icon for new post creation
export function BigPlusIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
