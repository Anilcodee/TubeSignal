import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Header />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
