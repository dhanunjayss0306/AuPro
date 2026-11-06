import './globals.css';

export const metadata = {
  title: 'AuPro',
  description: 'Andhra University student app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
