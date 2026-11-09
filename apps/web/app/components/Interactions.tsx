'use client';
import { useEffect } from 'react';

// Flat, functional press feedback: a solid circle that expands from the touch point.
const TARGETS = '.primary-button, .secondary-button, .service-card, .chatbot-chip, .gmaps-chip, .icon-button, .head-action-btn, .bottom-nav button, .big-plus-bubble';

export function Interactions() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(TARGETS);
      if (!el || (el as HTMLButtonElement).disabled) return;
      if (typeof navigator.vibrate === 'function') navigator.vibrate(8);
      if (reduce.matches) return;
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 1.6;
      const dot = document.createElement('span');
      dot.className = 'press-ripple';
      dot.style.width = dot.style.height = `${size}px`;
      dot.style.left = `${e.clientX - r.left - size / 2}px`;
      dot.style.top = `${e.clientY - r.top - size / 2}px`;
      el.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);
  return null;
}
