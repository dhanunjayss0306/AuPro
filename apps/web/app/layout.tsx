import './globals.css';
import './styles/theme.css';
import type { Metadata } from 'next';
import { SmoothScroll } from './components/SmoothScroll';
import { Interactions } from './components/Interactions';

export const metadata: Metadata = {
  title: 'AuPro · Andhra University',
  description: 'Andhra University College of Engineering student app for campus moments, applications, and verified updates.',
  icons: {
    icon: '/icon.svg',
  },
  metadataBase: new URL('https://aupro1.vercel.app'),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll />
        <Interactions />
        {children}
      </body>
    </html>
  );
}
