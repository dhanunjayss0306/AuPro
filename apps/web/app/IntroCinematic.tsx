'use client';

import React, { useEffect, useState } from 'react';

interface IntroCinematicProps {
  onComplete: () => void;
}

export function IntroCinematic({ onComplete }: IntroCinematicProps) {
  const [phase, setPhase] = useState<'converging' | 'reveal' | 'bloom' | 'fade-out'>('converging');

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        onComplete();
        return;
      }
    }

    // Sequence timeline:
    // 0.0s - 0.7s: Prisms converge
    // 0.7s - 1.8s: Reveal AuPro lettermark
    // 1.8s - 2.5s: Cinematic zoom & bloom
    // 2.5s - 2.9s: Smooth dissolve
    const t1 = setTimeout(() => setPhase('reveal'), 700);
    const t2 = setTimeout(() => setPhase('bloom'), 1800);
    const t3 = setTimeout(() => setPhase('fade-out'), 2500);
    const t4 = setTimeout(() => {
      try {
        sessionStorage.setItem('aupro_intro_seen', 'true');
      } catch {}
      onComplete();
    }, 2900);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        try {
          sessionStorage.setItem('aupro_intro_seen', 'true');
        } catch {}
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  const handleSkip = () => {
    try {
      sessionStorage.setItem('aupro_intro_seen', 'true');
    } catch {}
    onComplete();
  };

  return (
    <div
      className={`intro-cinematic-backdrop ${phase === 'fade-out' ? 'intro-fade-out' : ''}`}
      role="dialog"
      aria-label="AuPro cinematic intro"
      aria-live="polite"
    >
      {/* Accessible Skip Button */}
      <button
        onClick={handleSkip}
        className="intro-skip-button"
        aria-label="Skip introductory animation"
      >
        Skip ➔
      </button>

      {/* Atmospheric Vignette & Subtle Light Beams */}
      <div className="intro-vignette" />

      {/* Center Cinematic Container */}
      <div className={`intro-center-stage intro-stage-${phase}`}>
        {/* Converging Prisms (Streaming-service intro light sweeps) */}
        <div className="intro-prisms-wrapper" aria-hidden="true">
          <div className="intro-prism prism-1" />
          <div className="intro-prism prism-2" />
          <div className="intro-prism prism-3" />
          <div className="intro-prism prism-4" />
          <div className="intro-prism prism-5" />
          <div className="intro-prism prism-6" />
        </div>

        {/* Sculpted AuPro Lettermark */}
        <div className="intro-logo-container">
          <div className="intro-wordmark-wrap">
            <span className="intro-letter intro-letter-a">A</span>
            <span className="intro-letter intro-letter-u">u</span>
            <span className="intro-letter intro-letter-p">P</span>
            <span className="intro-letter intro-letter-r">r</span>
            <span className="intro-letter intro-letter-o">o</span>
          </div>

          {/* Dynamic Light Sweep Bar */}
          <div className="intro-light-sweep" aria-hidden="true" />

          {/* Subtitle Banner */}
          <div className="intro-subtitle">
            <span className="intro-sub-line">ANDHRA UNIVERSITY COLLEGE OF ENGINEERING</span>
            <span className="intro-sub-tag">AUTONOMOUS · VISAKHAPATNAM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
