/**
 * useSearch.js
 * Client-side search engine built on Fuse.js.
 * Replaces the Express/SQLite BM25/FTS5 backend.
 *
 * Fuse.js config:
 *   - title weight 0.7, description weight 0.3
 *   - threshold 0.4  → fuzzy/typo-tolerant
 *   - ignoreLocation → partial matching anywhere in text
 *   - includeScore   → relevance ranking
 */

import { useMemo } from "react";
import Fuse from "fuse.js";

const FUSE_OPTIONS = {
  keys: [
    { name: "title",       weight: 0.7 },
    { name: "description", weight: 0.3 },
  ],
  includeScore:   true,
  threshold:      0.35,
  ignoreLocation: true,
  findAllMatches: true,
};

/**
 * @param {Array} allArticles - full dataset array
 * @returns {{
 *   search: (query: string) => Array,
 *   getById: (id: number|string) => object|null,
 *   getSimilar: (article: object, limit?: number) => Array,
 *   getSuggestions: (query: string, limit?: number) => string[],
 * }}
 */
export function useSearch(allArticles) {
  // Build Fuse index only when data changes (singleton via useMemo)
  const fuse = useMemo(() => {
    if (!allArticles.length) return null;
    return new Fuse(allArticles, FUSE_OPTIONS);
  }, [allArticles]);

  // Build a quick id→article map for O(1) lookups
  const byId = useMemo(() => {
    const map = new Map();
    for (const a of allArticles) map.set(String(a.id), a);
    return map;
  }, [allArticles]);

  /**
   * Full-text search using Fuse.js.
   * Returns articles with a `score` field (0 = perfect, 1 = no match).
   */
  function search(query) {
    if (!fuse || !query.trim()) return [];
    const results = fuse.search(query.trim());
    return results.map((r) => ({
      ...r.item,
      score: r.score ?? 1,
    }));
  }

  /**
   * Lookup a single article by id.
   */
  function getById(id) {
    return byId.get(String(id)) ?? null;
  }

  /**
   * Find articles similar to a given article using its title as query.
   * Excludes the source article itself.
   */
  function getSimilar(article, limit = 5) {
    if (!fuse || !article?.title) return [];
    const results = fuse.search(article.title);
    return results
      .filter((r) => String(r.item.id) !== String(article.id))
      .slice(0, limit)
      .map((r) => ({ ...r.item, score: r.score ?? 1 }));
  }

  /**
   * Autocomplete suggestions — substring match on titles, up to `limit`.
   */
  function getSuggestions(query, limit = 10) {
    if (!allArticles.length || !query || query.trim().length < 2) return [];
    const q = query.trim().toLowerCase();

    const seen = new Set();
    const suggestions = [];

    for (const article of allArticles) {
      if (suggestions.length >= limit) break;
      const title = (article.title || "").toLowerCase();
      const idx   = title.indexOf(q);
      if (idx < 0) continue;

      // Extract a 5-word snippet starting at the match position
      const words    = article.title.slice(idx).split(/\s+/).slice(0, 5).join(" ");
      const cleaned  = words.replace(/<[^>]*>/g, "").trim();
      const key      = cleaned.toLowerCase();

      if (cleaned && !seen.has(key)) {
        seen.add(key);
        suggestions.push(cleaned);
      }
    }

    return suggestions;
  }

  return { search, getById, getSimilar, getSuggestions, fuse };
}
