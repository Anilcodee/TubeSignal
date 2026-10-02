import React, { useState, FormEvent } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  initialValue?: string;
  placeholder?: string;
}

export const SearchBar = ({
  onSearch,
  isLoading = false,
  initialValue = '',
  placeholder = 'Search creator name or @handle (e.g. mkbhd, fireship)...',
}: SearchBarProps) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  const handleQuickSelect = (handle: string) => {
    setQuery(handle);
    onSearch(handle);
  };

  return (
    <div className={styles.searchWrapper}>
      <form className={styles.searchForm} onSubmit={handleSubmit}>
        <div className={styles.searchIcon}>
          <Search size={16} />
        </div>
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          autoFocus
        />
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analyzing</span>
            </>
          ) : (
            <>
              <span>Inspect</span>
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </form>

      <div className={styles.suggestions}>
        <span className={styles.suggestLabel}>Presets:</span>
        <button
          type="button"
          className={styles.suggestBtn}
          onClick={() => handleQuickSelect('@mkbhd')}
        >
          @mkbhd
        </button>
        <button
          type="button"
          className={styles.suggestBtn}
          onClick={() => handleQuickSelect('@fireship')}
        >
          @fireship
        </button>
        <button
          type="button"
          className={styles.suggestBtn}
          onClick={() => handleQuickSelect('@veritasium')}
        >
          @veritasium
        </button>
      </div>
    </div>
  );
};
