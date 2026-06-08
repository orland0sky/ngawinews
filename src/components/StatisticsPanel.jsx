import { useMemo } from "react";

const DB_TAGS = [
  { label: "BBC News", icon: "📰" },
  { label: "Fuse.js",  icon: "🔍" },
  { label: "JSON",     icon: "📦" },
  { label: "Static",   icon: "⚡" },
];

function StatRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={`text-xs font-bold ${accent ?? "text-slate-800"} text-right max-w-[55%] truncate`}>
        {value}
      </span>
    </div>
  );
}

function StatisticsPanel({
  mode,
  total,
  elapsed,
  query,
  page,
  totalPages,
  category,
  allArticles = [],
}) {
  const stats = useMemo(() => {
    if (!allArticles || !allArticles.length) {
      return {
        totalArticles: 0,
        totalCategories: 0,
        articlesPerCategory: {},
        mostCommonCategory: "—",
      };
    }

    const counts = {};
    for (const a of allArticles) {
      if (a.category) {
        counts[a.category] = (counts[a.category] || 0) + 1;
      }
    }

    const totalArticles = allArticles.length;
    const totalCategories = Object.keys(counts).length;

    let mostCommonCategory = "—";
    let maxCount = -1;
    for (const [cat, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonCategory = cat;
      }
    }

    return {
      totalArticles,
      totalCategories,
      articlesPerCategory: counts,
      mostCommonCategory,
    };
  }, [allArticles]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-emerald-500" />
        <h3 className="font-black text-slate-900">Statistics</h3>
      </div>

      {/* Mode badge */}
      <div className="mb-4">
        <span className={`
          inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full
          ${mode === "search"
            ? "bg-amber-100 text-amber-700"
            : "bg-sky-100 text-sky-700"}
        `}>
          <span>{mode === "search" ? "🔍" : "📰"}</span>
          {mode === "search" ? "Search Mode" : "Browse Mode"}
        </span>
      </div>

      {/* Stats rows */}
      <div className="divide-y divide-slate-100">
        <StatRow label="Results"   value={total > 0 ? total.toLocaleString() : "—"} accent="text-sky-700" />
        <StatRow label="Time"      value={total > 0 ? `${elapsed} ms` : "—"} />
        <StatRow label="Category"  value={category} />
        {mode === "search" && (
          <StatRow label="Query" value={query || "—"} accent="text-amber-700" />
        )}
        <StatRow
          label="Page"
          value={totalPages > 0 ? `${page} / ${totalPages}` : "—"}
        />
      </div>

      {/* Dataset info */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
          Dataset
        </h4>

        <div className="mb-3 rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-100 px-4 py-3 text-center">
          <div className="text-2xl font-black text-sky-700">
            {stats.totalArticles.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">
            BBC News Articles
          </div>
        </div>

        {/* Dynamic Dataset Stats */}
        <div className="divide-y divide-slate-100 mb-4">
          <StatRow label="Total Categories" value={stats.totalCategories} />
          <StatRow label="Most Common" value={stats.mostCommonCategory} accent="text-emerald-700" />
        </div>

        {/* Articles Per Category */}
        <div className="mb-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Articles Per Category
          </span>
          <div className="mt-2 space-y-1.5">
            {Object.entries(stats.articlesPerCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat} className="flex justify-between text-xs text-slate-600">
                  <span className="font-semibold">{cat}</span>
                  <span className="font-bold text-slate-800">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {DB_TAGS.map(({ label, icon }) => (
            <div key={label} className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 font-medium">
              <span>{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default StatisticsPanel;
