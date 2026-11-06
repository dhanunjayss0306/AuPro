import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AuPro · Andhra University',
  description: 'Andhra University College of Engineering student app for campus moments, applications, and verified updates.',
  icons: {
    icon: '/icon.svg',
  },
  metadataBase: new URL('https://web-rust-one-pk6jjs5pbw.vercel.app'),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
