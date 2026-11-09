'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * AuPro Lenis Smooth Scrolling Engine
 * Gives the entire feed, modals, and profile views a buttery 60fps native feel.
 */
export function SmoothScroll() {
  useEffect(() => {
    // Only enable if browser supports smooth scrolling and not reduced-motion
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let lenis: Lenis | null = null;
    let rafId: number;

    try {
      lenis = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 1.8,
        infinite: false,
      });

      function raf(time: number) {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    } catch (e) {
      console.warn('Lenis smooth scrolling disabled:', e);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  return null;
}
