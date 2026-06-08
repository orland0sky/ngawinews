import { useNavigate } from "react-router-dom";
import { formatDate, getCategoryClass } from "./NewsItem";

function RecommendedReading({ articles = [], loading = false }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">✨</span>
          <h3 className="font-black text-slate-900 text-sm">Recommended Reading</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3.5 w-full rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
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
      <div
        className="px-5 py-4 border-b border-slate-100 flex items-center gap-2"
        style={{ background: "linear-gradient(135deg,#f8fafc,#e0f2fe)" }}
      >
        <span className="text-lg">✨</span>
        <h3 className="font-black text-slate-800 text-sm">Recommended Reading</h3>
        <span className="ml-auto text-xs text-slate-400">Personalized</span>
      </div>

      <div className="divide-y divide-slate-50">
        {articles.map((article, index) => {
          const catClass = getCategoryClass(article.category);
          const date = formatDate(article.pubDate);

          return (
            <button
              key={article.id}
              type="button"
              onClick={() => navigate(`/news/${article.id}`)}
              className="
                w-full text-left px-4 py-3.5
                hover:bg-sky-50/50 transition-colors group
                flex items-start gap-3
              "
            >
              {/* Rank circle */}
              <div
                className={`
                  shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black
                  ${index < 2 ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"}
                `}
              >
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-slate-800 group-hover:text-sky-700 leading-snug mb-1 line-clamp-2 transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${catClass}`}>
                    {article.category}
                  </span>
                  {date && <span className="text-xs text-slate-400">{date}</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RecommendedReading;
