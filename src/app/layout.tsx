import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TubeSignal — Decode Any YouTube Creator’s Content Strategy with AI',
  description:
    'AI-powered YouTube creator analytics tool built with SerpApi. Analyze content themes, title patterns, publishing cadence, and channel performance insights in seconds.',
  keywords: [
    'YouTube analytics',
    'creator intelligence',
    'SerpApi',
    'AI research brief',
    'content strategy',
    'YouTube SEO',
  ],
  authors: [{ name: 'Anil' }],
  openGraph: {
    title: 'TubeSignal — AI-Powered YouTube Creator Analytics',
    description: 'Find the signal in any YouTube channel with SerpApi and Gemini AI.',
    type: 'website',
    url: 'https://tubesignal.vercel.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
