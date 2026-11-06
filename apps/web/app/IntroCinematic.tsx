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

    // Sequence timeline (runs on every reload/open without skip button):
    // 0.0s - 0.5s: Prisms converge
    // 0.5s - 1.5s: Reveal AuPro lettermark
    // 1.5s - 2.0s: Cinematic zoom & light bloom
    // 2.0s - 2.3s: Smooth dissolve into sign-in
    const t1 = setTimeout(() => setPhase('reveal'), 500);
    const t2 = setTimeout(() => setPhase('bloom'), 1500);
    const t3 = setTimeout(() => setPhase('fade-out'), 2000);
    const t4 = setTimeout(() => {
      onComplete();
    }, 2300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      className={`intro-cinematic-backdrop ${phase === 'fade-out' ? 'intro-fade-out' : ''}`}
      role="dialog"
      aria-label="AuPro cinematic intro"
      aria-live="polite"
    >
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
            <span className="intro-sub-line">ANDHRA UNIVERSITY</span>
            <span className="intro-sub-tag">COLLEGE OF ENGINEERING · VISAKHAPATNAM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
