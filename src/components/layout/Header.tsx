'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpRight, AudioLines, Search } from 'lucide-react';
import { CommandBar } from '@/components/search/CommandBar';
import styles from './Header.module.css';

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isCompare = pathname === '/compare';
  return (
    <header className={`${styles.header} no-print`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} aria-label="TubeSignal home">
          <span className={styles.logoMark}><AudioLines size={21} aria-hidden="true" /></span>
          <span>TubeSignal<span className={styles.logoPeriod}>.</span></span>
        </Link>
        {!isHome && <div className={styles.searchSlot}><CommandBar onSearch={(id) => router.push(`/analyze/${encodeURIComponent(id)}`)} /></div>}
        <nav className={styles.navigation} aria-label="Main navigation">
          <Link href="/compare" className={styles.sampleNav} style={isCompare ? { color: 'var(--accent)' } : undefined}>
            Compare
          </Link>
          {isHome ? (
            <>
              <a href="#sample-reports" className={styles.sampleNav}>Sample reports</a>
              <Link href="/analyze/mkbhd?demo=true" className={styles.demoLink}>Explore report <ArrowUpRight size={14} /></Link>
            </>
          ) : (
            <Link href="/" className={styles.sampleNav}><Search size={13} /> New search</Link>
          )}
        </nav>
      </div>
    </header>
  );
};
