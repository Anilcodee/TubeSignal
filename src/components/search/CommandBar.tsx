'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LoaderCircle, Search } from 'lucide-react';
import { normalizeChannelInput } from '@/utils/channel-input';
import styles from './CommandBar.module.css';

interface ChannelResult { name: string; channelId: string; handle: string; subscribers: string; }
interface SearchState { results: ChannelResult[]; loading: boolean; message: string; open: boolean; selected: number; }
const EMPTY: SearchState = { results: [], loading: false, message: '', open: false, selected: -1 };

interface CommandBarProps {
  onSearch: (channel: string) => void;
  isHero?: boolean;
  placeholder?: string;
}

export const CommandBar = ({ onSearch, isHero = false, placeholder = 'Creator name, @handle, or channel URL' }: CommandBarProps) => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>(EMPTY);
  const controller = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const id = useId();
  const dismiss = useCallback(() => {
    const pending = controller.current;
    controller.current = null;
    pending?.abort();
    setState((s) => ({ ...s, loading: false, open: false, selected: -1 }));
  }, []);

  useEffect(() => {
    const outside = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) dismiss();
    };
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); input.current?.focus();
      }
    };
    document.addEventListener('mousedown', outside);
    window.addEventListener('keydown', shortcut);
    return () => { const pending = controller.current; controller.current = null; pending?.abort(); document.removeEventListener('mousedown', outside); window.removeEventListener('keydown', shortcut); };
  }, [dismiss]);

  const select = (channelId: string) => {
    const pending = controller.current; controller.current = null; pending?.abort(); setState(EMPTY); onSearch(channelId);
  };

  const search = async () => {
    const value = query.trim();
    if (!value || state.loading) return;
    const direct = normalizeChannelInput(value);
    if (direct) { select(direct); return; }
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setState({ ...EMPTY, loading: true, open: true });
    const timeout = setTimeout(() => request.abort(), 25000);
    try {
      const response = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: value }), signal: request.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Search is unavailable. Please try again.');
      if (controller.current !== request || request.signal.aborted) return;
      const results: ChannelResult[] = result.channels || [];
      setState({ results, loading: false, open: true, selected: -1, message: results.length ? '' : 'No channels found. Try an exact @handle or channel URL.' });
    } catch (error) {
      if (controller.current !== request) return;
      setState({ ...EMPTY, open: true, message: request.signal.aborted ? 'Search timed out. Please try again.' : error instanceof Error ? error.message : 'Unable to search. Please try again.' });
    } finally { clearTimeout(timeout); }
  };

  return (
    <div ref={wrapper} className={`${styles.wrapper} ${isHero ? styles.hero : ''}`}>
      <form className={styles.form} role="search" onSubmit={(event) => { event.preventDefault(); void search(); }}>
        <Search size={17} className={styles.searchIcon} aria-hidden="true" />
        <label className="sr-only" htmlFor={id}>Search YouTube channels</label>
        <input ref={input} id={id} role="combobox" aria-autocomplete="list" aria-expanded={state.open && state.results.length > 0} aria-controls={state.open ? `${id}-results` : undefined} aria-activedescendant={state.open && state.selected >= 0 ? `${id}-option-${state.selected}` : undefined}
          value={query} placeholder={placeholder} maxLength={200} autoComplete="off" spellCheck={false}
          onChange={(event) => { const previous = controller.current; controller.current = null; previous?.abort(); setQuery(event.target.value); setState(EMPTY); }}
          onFocus={() => { if (state.results.length || state.message) setState((s) => ({ ...s, open: true })); }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') dismiss();
            if (!state.open || !state.results.length) return;
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setState((s) => ({ ...s, selected: s.selected < 0 ? (event.key === 'ArrowDown' ? 0 : s.results.length - 1) : (s.selected + (event.key === 'ArrowDown' ? 1 : -1) + s.results.length) % s.results.length })); }
            if (event.key === 'Enter' && state.selected >= 0) { event.preventDefault(); select(state.results[state.selected].channelId); }
          }} />
        <button type="submit" disabled={!query.trim() || state.loading}>
          {state.loading ? <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" /> : <><span>Analyze</span><ArrowRight size={15} aria-hidden="true" /></>}
          {state.loading && <span className="sr-only">Searching</span>}
        </button>
      </form>
      <div className="sr-only" role="status">{state.loading ? 'Searching channels…' : state.message || (state.results.length ? `${state.results.length} channels found. Choose a channel.` : '')}</div>
      {state.open && (state.loading || state.results.length > 0 || state.message) && (
        <div className={styles.popover}>
          <p className={styles.popoverHeading}>{state.loading ? 'Searching YouTube…' : state.results.length ? 'Choose the channel to analyze' : state.message}</p>
          <ul id={`${id}-results`} role="listbox" aria-label="Channel results">
            {state.results.map((channel, index) => (
              <li key={channel.channelId} role="none"><button id={`${id}-option-${index}`} type="button" role="option" aria-selected={state.selected === index} className={styles.result} onClick={() => select(channel.channelId)}>
                <span className={styles.resultAvatar} aria-hidden="true">{channel.name.slice(0, 2).toUpperCase()}</span>
                <span className={styles.resultInfo}><strong>{channel.name}</strong><span>{channel.handle || channel.channelId} {channel.subscribers && `· ${channel.subscribers}`}</span></span><ArrowRight size={14} />
              </button></li>
            ))}
          </ul>
          {state.message && <Link href="/analyze/mkbhd?demo=true" className={styles.sampleLink} onClick={() => setState(EMPTY)}>Explore a sample report instead <ArrowRight size={13} /></Link>}
        </div>
      )}
    </div>
  );
};
