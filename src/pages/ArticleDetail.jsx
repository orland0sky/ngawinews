import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";

import { formatDate, getCategoryClass } from "../components/NewsItem";
import MetadataPanel       from "../components/MetadataPanel";
import RelatedArticles     from "../components/RelatedArticles";
import SimilarArticles     from "../components/SimilarArticles";
import RecommendedReading  from "../components/RecommendedReading";

import { useNewsData } from "../hooks/useNewsData";
import { useSearch }   from "../hooks/useSearch";

const CATEGORY_ICONS = {
  All:           "🌐",
  Business:      "💼",
  Politics:      "🏛️",
  Technology:    "💻",
  Sport:         "⚽",
  Entertainment: "🎬",
};

// ── skeleton for article body ─────────────────────────────────────────────────
function ArticleSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-24 rounded-full" />
        </div>
        <div className="skeleton h-10 w-full rounded" />
        <div className="skeleton h-10 w-4/5 rounded" />
        <div className="skeleton h-4 w-40 rounded" />
      </div>
      <div className="border-t border-slate-200 pt-5 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-4 rounded" style={{ width: `${75 + (i * 4 % 25)}%` }} />
        ))}
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
function ArticleDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Retrieve any search context passed via location state
  const searchContext = location.state?.searchContext ?? null;

  // ── data ─────────────────────────────────────────────────────────────────
  const { allArticles, loading: dataLoading } = useNewsData();
  const { getById, getSimilar }               = useSearch(allArticles);

  // ── derived state (fully synchronous once data is loaded) ─────────────────
  const article = useMemo(() => getById(id), [getById, id]);

  const related = useMemo(() => {
    if (!article) return [];
    return allArticles
      .filter((a) => a.category === article.category && String(a.id) !== String(article.id))
      .sort((a, b) => (a.pubDate || "") > (b.pubDate || "") ? -1 : 1)
      .slice(0, 5);
  }, [allArticles, article]);

  const similar = useMemo(() => {
    if (!article) return [];
    return getSimilar(article, 5);
  }, [article, getSimilar]);

  const similarQ = article?.title ?? "";

  const recommendations = useMemo(() => {
    if (!article) return [];
    const seen = new Set([String(article.id)]);
    const result = [];

    // 1. Similar articles (highest relevance)
    for (const a of similar) {
      if (!seen.has(String(a.id))) {
        seen.add(String(a.id));
        result.push(a);
      }
    }
    // 2. Related (same category)
    for (const a of related) {
      if (!seen.has(String(a.id))) {
        seen.add(String(a.id));
        result.push(a);
      }
    }
    // 3. Random fallback articles
    if (result.length < 5) {
      const pool = allArticles.filter((a) => !seen.has(String(a.id)));
      // pick pseudo-random using article.id as seed offset
      const offset = (Number(article.id) % Math.max(pool.length - 10, 1));
      for (let i = 0; i < pool.length && result.length < 5; i++) {
        const a = pool[(offset + i) % pool.length];
        if (!seen.has(String(a.id))) {
          seen.add(String(a.id));
          result.push(a);
        }
      }
    }

    return result.slice(0, 5);
  }, [article, similar, related, allArticles]);

  // ── error state ───────────────────────────────────────────────────────────
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  useEffect(() => {
    // Once data is loaded, check if article exists
    if (!dataLoading && allArticles.length > 0 && !article) {
      setNotFound(true);
    } else {
      setNotFound(false);
    }
  }, [dataLoading, allArticles, article]);

  // ── loading / not-found states ────────────────────────────────────────────
  const loadingArticle         = dataLoading || (!article && !notFound);
  const loadingRelated         = dataLoading;
  const loadingSimilar         = dataLoading;
  const loadingRecommendations = dataLoading;

  const catClass = getCategoryClass(article?.category);
  const pubDate  = formatDate(article?.pubDate);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#0f172a 0px,#0f172a 200px,#f1f5f9 200px)" }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0c4a6e 100%)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center gap-4">

          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              flex items-center gap-2 px-3 py-2 rounded-xl
              border border-slate-600 bg-slate-700/50 text-slate-200
              text-sm font-semibold hover:bg-slate-600/50 hover:border-slate-500
              transition-all shrink-0
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 4.158a.75.75 0 11-1.06 1.06l-5.5-5.5a.75.75 0 010-1.06l5.5-5.5a.75.75 0 011.06 1.06L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Back
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 min-w-0 flex-1">
            <Link to="/" className="hover:text-sky-300 transition-colors font-semibold shrink-0">
              NGAWI NEWS
            </Link>
            <span className="text-slate-600">›</span>
            {article?.category && (
              <>
                <span className="font-semibold text-slate-300 shrink-0">
                  {CATEGORY_ICONS[article.category]} {article.category}
                </span>
                <span className="text-slate-600">›</span>
              </>
            )}
            <span className="truncate text-slate-400">
              {article?.title?.replace(/<[^>]*>/g, "").slice(0, 60) ?? "Article"}
            </span>
          </nav>

          {/* Logo */}
          <Link to="/" className="hidden sm:block text-white font-black text-lg tracking-tight shrink-0 hover:text-sky-300 transition-colors">
            NGAWI NEWS
          </Link>

        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT: main content area ────────────────────────────────────────── */}
          <main className="col-span-12 lg:col-span-8 space-y-6">

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Category color bar */}
              {article?.category && (
                <div className={`h-1.5 ${
                  article.category === "Business"      ? "bg-blue-500" :
                  article.category === "Politics"      ? "bg-pink-500" :
                  article.category === "Technology"    ? "bg-emerald-500" :
                  article.category === "Sport"         ? "bg-orange-500" :
                  article.category === "Entertainment" ? "bg-violet-500" :
                  "bg-sky-500"
                }`} />
              )}

              <div className="p-6 sm:p-8">
                {loadingArticle ? (
                  <ArticleSkeleton />
                ) : notFound ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">⚠️</div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Article Not Found</h2>
                    <p className="text-sm text-slate-500 mb-5">No article with ID #{id} exists in the dataset.</p>
                    <button
                      onClick={() => navigate("/")}
                      className="bg-sky-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-sky-700 transition"
                    >
                      Go to Homepage
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Header fields */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${catClass}`}>
                        {CATEGORY_ICONS[article.category] ?? ""} {article.category}
                      </span>
                      {pubDate && (
                        <>
                          <span className="text-slate-200 text-xs">•</span>
                          <time className="text-xs text-slate-500 font-semibold">{pubDate}</time>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
                      {article.title}
                    </h1>

                    {/* Divider */}
                    <div className="border-t border-slate-100 mb-6" />

                    {/* Description */}
                    <div
                      className="
                        prose prose-slate max-w-none
                        text-base leading-8 text-slate-700
                        prose-p:mb-4 prose-p:mt-0
                        [&_mark]:rounded [&_mark]:bg-amber-200 [&_mark]:px-0.5 [&_mark]:text-amber-900
                      "
                      dangerouslySetInnerHTML={{ __html: article.description }}
                    />

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                      <div className="text-xs text-slate-400">
                        Source: <span className="font-bold text-slate-600">BBC News</span> · ID #{article.id}
                      </div>
                      <button
                        onClick={() => navigate(-1)}
                        className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 transition"
                      >
                        ← Back to results
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Metadata (includes Source Info and Retrieval Info) */}
            {!loadingArticle && article && (
              <MetadataPanel
                article={article}
                searchContext={searchContext}
                similarArticles={similar}
              />
            )}

          </main>

          {/* ── RIGHT: sidebar ── */}
          <aside className="col-span-12 lg:col-span-4 space-y-5 lg:sticky lg:top-24">

            <RelatedArticles
              articles={related}
              loading={loadingRelated}
              category={article?.category}
            />

            <SimilarArticles
              articles={similar}
              loading={loadingSimilar}
              sourceQuery={similarQ}
            />

            <RecommendedReading
              articles={recommendations}
              loading={loadingRecommendations}
            />

          </aside>

        </div>
      </div>

    </div>
  );
}

export default ArticleDetail;
