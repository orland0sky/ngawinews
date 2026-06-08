import { useRef, useState } from "react";

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" />
  </svg>
);

function SearchBar({
  query,
  setQuery,
  onSearch,
  onClear,
  showFilters,
  toggleFilters,
  suggestions = [],
  onSelectSuggestion,
  mode,
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch();
    if (e.key === "Escape") { onClear?.(); }
  };

  const showDropdown = focused && suggestions.length > 0;

  return (
    <div
      className={`
        rounded-2xl border transition-all duration-200
        ${focused
          ? "border-sky-400 shadow-lg shadow-sky-100"
          : "border-slate-200 shadow-sm"
        }
        bg-white p-2
      `}
    >
      <div className="flex flex-col gap-2 sm:flex-row">

        {/* Filters toggle */}
        <button
          id="filters-toggle-btn"
          type="button"
          onClick={toggleFilters}
          aria-pressed={showFilters}
          className={`
            inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3
            text-sm font-bold whitespace-nowrap transition-all duration-200
            ${showFilters
              ? "border-sky-200 bg-sky-50 text-sky-700"
              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"}
          `}
        >
          <FilterIcon />
          Filters
          {showFilters && (
            <span className="ml-0.5 bg-sky-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">✓</span>
          )}
        </button>

        {/* Search input */}
        <div className="relative flex-1">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <SearchIcon />
            </span>

            <input
              id="search-input"
              ref={inputRef}
              type="text"
              placeholder="Search news, topics, keywords… (press Enter)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              className="
                w-full pl-10 pr-10 py-3 rounded-xl
                border border-slate-200 bg-slate-50
                text-sm text-slate-900 placeholder:text-slate-400
                outline-none transition-all duration-150
                focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100
              "
            />

            {query && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-100">
                Suggestions
              </div>
              {suggestions.map((s, i) => (
                <button
                  key={`${s}-${i}`}
                  type="button"
                  onMouseDown={() => onSelectSuggestion?.(s)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                >
                  <span className="text-slate-400 shrink-0"><SearchIcon /></span>
                  <span className="truncate">{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          id="search-submit-btn"
          type="button"
          onClick={onSearch}
          className="
            inline-flex items-center justify-center gap-2
            rounded-xl border border-sky-600 bg-sky-600
            px-6 py-3 text-sm font-bold text-white
            whitespace-nowrap shadow-sm transition-all duration-200
            hover:bg-sky-700 hover:border-sky-700 hover:shadow-md
            active:scale-95
          "
        >
          <SearchIcon />
          Search
        </button>

      </div>

      {/* Mode indicator */}
      {mode === "search" && query && (
        <div className="mt-2 px-2 pb-1 flex items-center gap-2 text-xs text-slate-500">
          <span className="bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
            Search Mode
          </span>
          <span>Showing Fuse.js results for "<strong>{query}</strong>"</span>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
