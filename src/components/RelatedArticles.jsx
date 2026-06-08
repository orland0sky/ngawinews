import { useNavigate } from "react-router-dom";
import { formatDate, getCategoryClass } from "./NewsItem";

function RelatedArticles({ articles = [], loading = false, category }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-emerald-500" />
          <h3 className="font-black text-slate-900 text-sm">Related Articles</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
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
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-emerald-500" />
        <h3 className="font-black text-slate-900 text-sm">Related Articles</h3>
        {category && (
          <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${getCategoryClass(category)}`}>
            {category}
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-50">
        {articles.map((article) => (
          <button
            key={article.id}
            type="button"
            onClick={() => navigate(`/news/${article.id}`)}
            className="
              w-full text-left px-5 py-4
              hover:bg-slate-50 transition-colors group
            "
          >
            <h4 className="text-sm font-semibold text-slate-800 group-hover:text-sky-700 transition-colors leading-snug mb-1 line-clamp-2">
              {article.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{formatDate(article.pubDate) ?? "—"}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RelatedArticles;
