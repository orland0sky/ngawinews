import { useCallback, useMemo, useRef, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import SearchBar        from "./components/SearchBar";
import NewsItem         from "./components/NewsItem";
import EmptyState       from "./components/EmptyState";
import FilterSidebar    from "./components/FilterSidebar";
import StatisticsPanel  from "./components/StatisticsPanel";
import PopularSearches  from "./components/PopularSearches";
import ArticleDetail    from "./pages/ArticleDetail";
import Analytics        from "./pages/Analytics";

import { useNewsData }  from "./hooks/useNewsData";
import { useSearch }    from "./hooks/useSearch";

// ── skeleton loader cards ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
      <div className="flex gap-2">
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="skeleton h-4 w-16 rounded-full" />
      </div>
      <div className="skeleton h-5 w-full rounded" />
      <div className="skeleton h-5 w-4/5 rounded" />
      <div className="skeleton h-3.5 w-full rounded" />
      <div className="skeleton h-3.5 w-3/4 rounded" />
    </div>
  );
}

function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ── popular searches via localStorage ────────────────────────────────────────
const POPULAR_KEY = "ngawi_popular_searches";

function getPopularSearches() {
  try {
    const raw = localStorage.getItem(POPULAR_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function recordSearch(query) {
  if (!query.trim()) return;
  const q = query.trim().toLowerCase();
  try {
    const existing = getPopularSearches();
    const idx = existing.findIndex((item) => item.query === q);
    if (idx >= 0) {
      existing[idx].count += 1;
    } else {
      existing.push({ query: q, count: 1 });
    }
    // Keep top 20 by count, show top 10 in UI
    existing.sort((a, b) => b.count - a.count);
    localStorage.setItem(POPULAR_KEY, JSON.stringify(existing.slice(0, 20)));
  } catch { /* ignore */ }
}

// ── apply filters + sort to an article list ───────────────────────────────────
function applyFiltersAndSort(articles, { category, sort }) {
  let result = category === "All"
    ? articles
    : articles.filter((a) => a.category === category);

  switch (sort) {
    case "oldest":
      result = [...result].sort((a, b) =>
        (a.pubDate || "") < (b.pubDate || "") ? -1 : 1
      );
      break;
    case "title_asc":
      result = [...result].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
      break;
    case "title_desc":
      result = [...result].sort((a, b) =>
        (b.title || "").localeCompare(a.title || "")
      );
      break;
    case "newest":
    default:
      result = [...result].sort((a, b) =>
        (a.pubDate || "") > (b.pubDate || "") ? -1 : 1
      );
      break;
  }
  return result;
}

// ── main home page ────────────────────────────────────────────────────────────
function HomePage() {
  const navigate = useNavigate();

  // ── data ─────────────────────────────────────────────────────────────────
  const { allArticles, categories, categoryIcons, loading: dataLoading, error: dataError } = useNewsData();
  const { search, getSuggestions } = useSearch(allArticles);

  // ── mode: "browse" | "search" ─────────────────────────────────────────────
  const [mode, setMode]       = useState("browse");
  const [query, setQuery]     = useState("");
  const [sort, setSort]       = useState("newest");
  const [category, setCategory] = useState("All");
  const [limit, setLimit]     = useState(20);
  const [page, setPage]       = useState(1);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // ── search results cache ──────────────────────────────────────────────────
  const [searchResults, setSearchResults]   = useState([]);
  const [searchQuery,   setSearchQuery]     = useState("");
  const [searchElapsed, setSearchElapsed]   = useState(0);
  const [popularSearches, setPopularSearches] = useState(() => getPopularSearches());

  // column classes
  const resultColClass = showFilters
    ? "md:col-span-8 lg:col-span-6"
    : "md:col-span-8 lg:col-span-9";
  const statsColClass = showFilters
    ? "md:col-span-12 lg:col-span-3"
    : "md:col-span-4 lg:col-span-3";

  // ── derived browse list ───────────────────────────────────────────────────
  const browseList = useMemo(() => {
    if (!allArticles.length) return [];
    return applyFiltersAndSort(allArticles, { category, sort });
  }, [allArticles, category, sort]);

  // ── active list (browse or search) ───────────────────────────────────────
  const activeList = useMemo(() => {
    if (mode === "search") {
      // In search mode, apply category filter + sort to search results
      return applyFiltersAndSort(searchResults, { category, sort: sort === "newest" ? "newest" : sort });
    }
    return browseList;
  }, [mode, searchResults, browseList, category, sort]);

  // ── pagination ────────────────────────────────────────────────────────────
  const total      = activeList.length;
  const totalPages = Math.ceil(total / limit);
  const elapsed    = mode === "search" ? searchElapsed : 0;

  const paginatedArticles = useMemo(() => {
    const start = (page - 1) * limit;
    return activeList.slice(start, start + limit);
  }, [activeList, page, limit]);

  const getPaginationPages = () => {
    const pages = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      pages.push(i);
    }
    return pages;
  };

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    const t0 = performance.now();
    const results = search(q);
    const t1 = performance.now();
    setSearchResults(results);
    setSearchQuery(q);
    setSearchElapsed((t1 - t0).toFixed(1));
    setMode("search");
    setPage(1);
    setSuggestions([]);
    recordSearch(q);
    setPopularSearches(getPopularSearches());
  }, [query, search]);

  const handleClearSearch = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setSort("newest");
    setPage(1);
    setMode("browse");
    setSearchResults([]);
    setSearchQuery("");
  }, []);

  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion);
    const t0 = performance.now();
    const results = search(suggestion);
    const t1 = performance.now();
    setSearchResults(results);
    setSearchQuery(suggestion);
    setSearchElapsed((t1 - t0).toFixed(1));
    setMode("search");
    setPage(1);
    setSuggestions([]);
    recordSearch(suggestion);
    setPopularSearches(getPopularSearches());
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const goToPage = (targetPage) => {
    setPage(targetPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePopularSearch = (q) => {
    setQuery(q);
    const t0 = performance.now();
    const results = search(q);
    const t1 = performance.now();
    setSearchResults(results);
    setSearchQuery(q);
    setSearchElapsed((t1 - t0).toFixed(1));
    setMode("search");
    setPage(1);
    recordSearch(q);
    setPopularSearches(getPopularSearches());
  };

  // Autocomplete — debounced substring match
  const suggestTimerRef = useRef(null);
  const handleQueryChange = (val) => {
    setQuery(val);
    clearTimeout(suggestTimerRef.current);
    if (val.trim().length < 2) { setSuggestions([]); return; }
    suggestTimerRef.current = setTimeout(() => {
      setSuggestions(getSuggestions(val));
    }, 150);
  };

  // ── render ────────────────────────────────────────────────────────────────
  const loading = dataLoading;
  const error   = dataError;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0f172a 0px, #0f172a 180px, #f1f5f9 180px)" }}>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0c4a6e 100%)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          {/* Top bar: logo + meta */}
          <div className="flex items-end justify-between py-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="live-dot" />
                <span className="text-sky-400 text-xs font-semibold tracking-widest uppercase">
                  LiPe
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">
                NGAWI NEWS
              </h1>
              <p className="text-sky-300 text-xs font-medium mt-1 tracking-wide">
                Info PerNGawian Terkini · Aktual · Terpercaya · Akurat
              </p>
            </div>

            {/* Dataset badge */}
            <div className="hidden sm:flex flex-col items-end gap-1 text-right shrink-0">
              <div className="bg-sky-500/20 border border-sky-400/30 rounded-lg px-3 py-1.5 text-xs text-sky-200 font-semibold">
                {allArticles.length > 0 ? `${allArticles.length.toLocaleString()} articles` : "42,000+ articles"}
              </div>
              <div className="text-slate-500 text-xs">Fuse.js · JSON · Static</div>
            </div>
          </div>

          {/* Category tab bar + Analytics link */}
          <div className="flex gap-1 overflow-x-auto pb-0 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`
                  flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold whitespace-nowrap
                  border-b-2 transition-all duration-150
                  ${category === cat
                    ? "border-sky-400 text-sky-300"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500"}
                `}
              >
                <span>{categoryIcons[cat] ?? "📄"}</span>
                {cat}
              </button>
            ))}
            {/* Analytics nav link */}
            <a
              href="/analytics"
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 border-transparent text-slate-400 hover:text-emerald-300 hover:border-emerald-400 transition-all duration-150 ml-auto"
            >
              <span>📊</span>
              Analytics
            </a>
          </div>

        </div>
      </header>

      {/* ── SEARCH BAR ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5">
        <SearchBar
          query={query}
          setQuery={handleQueryChange}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          showFilters={showFilters}
          toggleFilters={() => setShowFilters((v) => !v)}
          suggestions={query.trim().length >= 2 ? suggestions : []}
          onSelectSuggestion={handleSuggestionSelect}
          mode={mode}
        />
      </div>

      {/* ── STATUS BAR ────────────────────────────────────────────────────── */}
      {!loading && !error && paginatedArticles.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>
              {mode === "search"
                ? <><strong className="text-slate-700">Search:</strong> "{searchQuery}"</>
                : <><strong className="text-slate-700">{category === "All" ? "Latest News" : category}</strong></>
              }
            </span>
            <span className="text-slate-300">·</span>
            <span><strong className="text-slate-700">{total.toLocaleString()}</strong> results</span>
            {mode === "search" && (
              <>
                <span className="text-slate-300">·</span>
                <span>{searchElapsed} ms</span>
              </>
            )}
            {mode === "search" && (
              <>
                <span className="text-slate-300">·</span>
                <button
                  onClick={handleClearSearch}
                  className="text-sky-600 hover:text-sky-700 font-semibold"
                >
                  ← Back to browse
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-12">

          {/* Filter Sidebar */}
          {showFilters && (
            <aside className="transition-all duration-300 ease-in-out md:col-span-4 lg:col-span-3">
              <FilterSidebar
                mode={mode}
                sort={sort}
                setSort={handleSortChange}
                limit={limit}
                setLimit={handleLimitChange}
              />
            </aside>
          )}

          {/* Results */}
          <main className={`transition-all duration-300 ease-in-out ${resultColClass}`}>

            {loading ? (
              <SkeletonList count={6} />

            ) : error ? (
              <div className="bg-white border border-red-200 rounded-xl p-10 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="font-bold text-slate-900 mb-2">Failed to Load Data</h3>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-sky-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-sky-700 transition"
                >
                  Retry
                </button>
              </div>

            ) : paginatedArticles.length === 0 && mode === "search" ? (
              <EmptyState query={searchQuery} onClear={handleClearSearch} />

            ) : paginatedArticles.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
                No articles found in this category yet.
              </div>

            ) : (
              <>
                <div className="space-y-3">
                  {paginatedArticles.map((article, idx) => (
                    <div key={article.id} className="fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                      <NewsItem
                        article={article}
                        showScore={mode === "search"}
                        onClick={() => {
                          const navState = mode === "search" && searchQuery
                            ? {
                              searchContext: {
                                query: searchQuery,
                                score: article.score ?? null,
                                rank: idx + 1 + (page - 1) * limit,
                              },
                            }
                            : undefined;
                          navigate(`/news/${article.id}`, { state: navState });
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-2">

                    <button
                      type="button"
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-700 disabled:opacity-40 transition"
                    >
                      ← Prev
                    </button>

                    {page > 3 && (
                      <>
                        <button onClick={() => goToPage(1)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-700 transition">1</button>
                        {page > 4 && <span className="text-slate-400 text-sm px-1">…</span>}
                      </>
                    )}

                    {getPaginationPages().map((p) => (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`px-3 py-2 rounded-lg border text-sm font-bold transition ${p === page
                          ? "border-sky-500 bg-sky-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
                          }`}
                      >
                        {p}
                      </button>
                    ))}

                    {page < totalPages - 2 && (
                      <>
                        {page < totalPages - 3 && <span className="text-slate-400 text-sm px-1">…</span>}
                        <button onClick={() => goToPage(totalPages)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-700 transition">{totalPages}</button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-700 disabled:opacity-40 transition"
                    >
                      Next →
                    </button>

                  </div>
                )}
              </>
            )}

          </main>

          {/* Right sidebar */}
          <aside className={`transition-all duration-300 ease-in-out ${statsColClass}`}>
            <div className="space-y-4 lg:sticky lg:top-28">

              <StatisticsPanel
                mode={mode}
                total={total}
                elapsed={elapsed}
                query={searchQuery}
                page={page}
                totalPages={totalPages}
                category={category}
                allArticles={allArticles}
              />

              <PopularSearches
                searches={popularSearches.slice(0, 10)}
                onSelectSearch={handlePopularSearch}
              />

            </div>
          </aside>

        </div>
      </div>

    </div>
  );
}

// ── root app with routing ─────────────────────────────────────────────────────
function App() {
  return (
    <Routes>
      <Route path="/"          element={<HomePage />} />
      <Route path="/news/:id"  element={<ArticleDetail />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
}

export default App;
