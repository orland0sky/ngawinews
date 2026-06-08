import { useNavigate } from "react-router-dom";
import { getCategoryClass } from "./NewsItem";

function SimilarArticles({ articles = [], loading = false, sourceQuery }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-violet-500" />
          <h3 className="font-black text-slate-900 text-sm">Similar Articles</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="flex gap-2">
                <div className="skeleton h-3 w-16 rounded-full" />
                <div className="skeleton h-3 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!articles.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 rounded-full bg-violet-500" />
          <h3 className="font-black text-slate-900 text-sm">Similar Articles</h3>
          <span className="ml-auto text-xs text-slate-400 font-semibold">Fuse.js</span>
        </div>
        {sourceQuery && (
          <p className="text-xs text-slate-400 pl-3">
            Based on: <span className="font-semibold text-violet-600 italic">"{sourceQuery}"</span>
          </p>
        )}
      </div>

      <div className="divide-y divide-slate-50">
        {articles.map((article, index) => {
          const catClass = getCategoryClass(article.category);
          return (
            <button
              key={article.id}
              type="button"
              onClick={() => navigate(`/news/${article.id}`)}
              className="
                w-full text-left px-5 py-4
                hover:bg-violet-50/50 transition-colors group
              "
            >
              {/* Rank + score row */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0
                  ${index === 0 ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}
                `}>
                  {index + 1}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${catClass}`}>
                  {article.category}
                </span>
                {article.score != null && (
                  <span className="ml-auto text-xs font-mono text-slate-400">
                    {Math.abs(article.score).toFixed(3)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors leading-snug line-clamp-2">
                {article.title}
              </h4>
            </button>
          );
        })}
      </div>

      <div className="px-5 py-3 bg-violet-50/50 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-1.5">
        <span>🔬</span>
        <span>Ranked by Fuse.js similarity score (lower = more similar)</span>
      </div>

    </div>
  );
}

export default SimilarArticles;
