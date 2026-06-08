import { formatDate } from "./NewsItem";

function MetadataPanel({ article, searchContext, similarArticles = [] }) {
  const data = article || {};
  const pubDateFormatted = formatDate(data.pubDate);

  // Extract BM25 search score if available
  const bm25Score = searchContext?.score != null ? Math.abs(searchContext.score) : null;

  // Extract top similar article score as the "Similarity Score"
  const similarityScore = similarArticles.length > 0 && similarArticles[0].score != null
    ? Math.abs(similarArticles[0].score)
    : null;

  return (
    <div className="space-y-5">
      {/* ── SOURCE INFORMATION PANEL ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div
          className="px-5 py-4 border-b border-slate-100 flex items-center gap-2"
          style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}
        >
          <span className="text-lg">📰</span>
          <h3 className="font-black text-white text-sm tracking-wide">Source Information</h3>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <div className="space-y-3">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-semibold">Source</span>
              <span className="font-bold text-sky-700">BBC News</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-semibold">Document ID</span>
              <span className="font-mono font-bold text-slate-800">#{data.id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-semibold">Category</span>
              <span className="font-bold text-slate-800">{data.category || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-semibold">Publish Date</span>
              <span className="font-semibold text-slate-600">{pubDateFormatted || "—"}</span>
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-slate-400 font-semibold">Original URL</span>
              <a
                href={data.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-600 hover:text-sky-700 font-medium break-all underline"
              >
                {data.link || "—"}
              </a>
            </div>
          </div>

          {data.link && (
            <a
              href={data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="
                mt-4 block w-full text-center py-2.5 px-4 rounded-xl
                bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs
                transition-all shadow-sm hover:shadow-sky-100
              "
            >
              Open Original BBC Article
            </a>
          )}
        </div>
      </div>

      {/* ── INFORMATION RETRIEVAL PANEL ── */}
      <div className="rounded-2xl border border-indigo-200 bg-white shadow-sm overflow-hidden">
        <div
          className="px-5 py-4 border-b border-indigo-100 flex items-center gap-2"
          style={{ background: "linear-gradient(135deg,#eef2ff,#e0f2fe)" }}
        >
          <span className="text-lg">🎯</span>
          <h3 className="font-black text-slate-800 text-sm tracking-wide">Retrieval Information</h3>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <div className="space-y-3">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">Fuse.js Score</span>
              <span className="font-mono font-bold text-emerald-600">
                {bm25Score != null ? bm25Score.toFixed(4) : "—"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">Similarity Score</span>
              <span className="font-mono font-bold text-indigo-600">
                {similarityScore != null ? similarityScore.toFixed(4) : "—"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">Ranking Method</span>
              <span className="font-semibold text-slate-700">Fuse.js</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-500 font-medium">Current Category</span>
              <span className="font-bold text-slate-800">{data.category || "—"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {["Fuse.js", "Fuzzy Search", "JSON", "BBC News"].map((tag) => (
              <span key={tag} className="text-[10px] font-extrabold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetadataPanel;
