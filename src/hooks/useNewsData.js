/**
 * useNewsData.js
 * Singleton loader hook — fetches /data/news.json exactly once,
 * stores it in module-level cache, and exposes derived metadata.
 */

import { useState, useEffect, useMemo } from "react";

// Module-level cache so the JSON is fetched only once per page lifetime,
// even if multiple components call useNewsData().
let _cache = null;          // raw array once loaded
let _promise = null;        // in-flight promise

async function loadArticles() {
  if (_cache) return _cache;
  if (!_promise) {
    _promise = fetch("/data/news-demo.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: failed to load news-demo.json`);
        return r.json();
      })
      .then((data) => {
        _cache = data;
        return data;
      });
  }
  return _promise;
}

/**
 * @returns {{
 *   allArticles: Array,
 *   categories: string[],
 *   categoryIcons: Object,
 *   loading: boolean,
 *   error: string|null,
 * }}
 */
export function useNewsData() {
  const [allArticles, setAllArticles] = useState(_cache ?? []);
  const [loading, setLoading]         = useState(!_cache);
  const [error, setError]             = useState(null);

  useEffect(() => {
    if (_cache) return; // already loaded
    let cancelled = false;

    loadArticles()
      .then((data) => {
        if (!cancelled) {
          setAllArticles(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // Derive categories dynamically from dataset (sorted by frequency)
  const categories = useMemo(() => {
    if (!allArticles.length) return ["All"];
    const counts = {};
    for (const a of allArticles) {
      if (a.category) counts[a.category] = (counts[a.category] || 0) + 1;
    }
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return ["All", ...sorted];
  }, [allArticles]);

  const categoryIcons = useMemo(() => ({
    All:           "🌐",
    Business:      "💼",
    Politics:      "🏛️",
    Technology:    "💻",
    Sport:         "⚽",
    Entertainment: "🎬",
    Health:        "🏥",
    Science:       "🔬",
  }), []);

  return { allArticles, categories, categoryIcons, loading, error };
}
