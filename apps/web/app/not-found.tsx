import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        background: 'var(--bg, #faf8f5)',
        color: 'var(--ink, #1f2937)',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '40px 24px',
          background: 'var(--surface, #ffffff)',
          border: '1px solid var(--border, #e6e1db)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--primary, #701d32)', marginBottom: '8px' }}>
          404
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' }}>
          Campus Page Not Found
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted, #667085)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
          The requested Andhra University resource or link could not be located.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'var(--primary, #701d32)',
            color: '#ffffff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          Return to AuPro Portal
        </Link>
      </div>
    </main>
  );
}
