const CATEGORY_COLORS = {
  Business:      "badge-business",
  Politics:      "badge-politics",
  Technology:    "badge-technology",
  Sport:         "badge-sport",
  Entertainment: "badge-entertainment",
};

export function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day:   "numeric",
      month: "short",
      year:  "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getCategoryClass(category) {
  return CATEGORY_COLORS[category] ?? "badge-all";
}

function NewsItem({ article, showScore = false, onClick }) {
  const categoryClass = getCategoryClass(article.category);
  const formattedDate = formatDate(article.pubDate);

  return (
    <article
      className="news-card bg-white border border-slate-200 rounded-xl p-5 cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      {/* Meta row */}
      <div className="mb-3 flex flex-wrap items-center gap-2">

        {/* Source */}
        <span className="text-xs font-bold text-sky-700 tracking-wide">
          BBC News
        </span>

        <span className="text-slate-300 text-xs">•</span>

        {/* Category badge */}
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${categoryClass}`}>
          {article.category}
        </span>

        {/* Date */}
        {formattedDate && (
          <>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs text-slate-400">{formattedDate}</span>
          </>
        )}

        {/* BM25 score — only in search mode */}
        {showScore && article.score != null && (
          <>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs font-mono text-slate-400">
              BM25&nbsp;{Math.abs(article.score).toFixed(3)}
            </span>
          </>
        )}

      </div>

      {/* Title */}
      <h2
        className="
          mb-2 text-base sm:text-lg font-bold leading-snug text-slate-900
          group-hover:text-sky-700 transition-colors
          [&_mark]:rounded [&_mark]:bg-amber-200 [&_mark]:px-0.5 [&_mark]:text-amber-900
        "
        dangerouslySetInnerHTML={{ __html: article.title }}
      />

      {/* Snippet / description */}
      <p
        className="
          text-sm leading-6 text-slate-600
          line-clamp-3
          [&_mark]:rounded [&_mark]:bg-amber-100 [&_mark]:px-0.5 [&_mark]:text-amber-900
        "
        dangerouslySetInnerHTML={{ __html: article.description }}
      />

    </article>
  );
}

export default NewsItem;
