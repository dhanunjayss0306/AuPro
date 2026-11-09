import React from 'react';

/**
 * Mobile-Optimized Skeleton Post Card
 * Displays an immediate pulsing placeholder matching the Threads/Instagram layout
 * on slow phones (3G/4G) while initial feed data loads, preventing layout shifts.
 */
export function SkeletonFeedCard() {
  return (
    <article
      className="insta-card threads-post-card skeleton-post-card"
      aria-hidden="true"
      style={{
        opacity: 0.9,
        marginBottom: 12,
        borderRadius: 12,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div className="threads-post-layout">
        {/* Left Column: Pulsing circular avatar + vertical connector line */}
        <div className="threads-post-left">
          <div
            className="skeleton"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--chip-bg, #2a2f37)',
            }}
          />
          <div
            style={{
              width: 2,
              height: 64,
              background: 'var(--border-light, rgba(255,255,255,0.06))',
              margin: '8px auto',
            }}
          />
          <div
            className="skeleton"
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'var(--chip-bg, #2a2f37)',
              margin: '0 auto',
            }}
          />
        </div>

        {/* Right Column: Name bar, time, 2 text lines, and action button placeholders */}
        <div className="threads-post-right" style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              className="skeleton"
              style={{
                width: 120,
                height: 14,
                borderRadius: 4,
                background: 'var(--chip-bg, #2a2f37)',
              }}
            />
            <div
              className="skeleton"
              style={{
                width: 44,
                height: 12,
                borderRadius: 4,
                background: 'var(--border-light, rgba(255,255,255,0.08))',
              }}
            />
          </div>

          <div
            className="skeleton"
            style={{
              width: '92%',
              height: 13,
              borderRadius: 4,
              background: 'var(--border-light, rgba(255,255,255,0.08))',
            }}
          />
          <div
            className="skeleton"
            style={{
              width: '68%',
              height: 13,
              borderRadius: 4,
              background: 'var(--border-light, rgba(255,255,255,0.08))',
            }}
          />

          <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
            <div
              className="skeleton"
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--chip-bg, #2a2f37)',
              }}
            />
            <div
              className="skeleton"
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--chip-bg, #2a2f37)',
              }}
            />
            <div
              className="skeleton"
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--chip-bg, #2a2f37)',
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
