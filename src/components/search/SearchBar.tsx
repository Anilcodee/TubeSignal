import React, { useState, FormEvent } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
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
  placeholder = 'Search creator name or @handle (e.g. mkbhd)...',
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
          <Search size={20} />
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
              <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Analyze</span>
            </>
          )}
        </button>
      </form>

      <div className={styles.suggestions}>
        <span className={styles.suggestLabel}>Try:</span>
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
