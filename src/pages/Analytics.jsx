import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

import { useNewsData } from "../hooks/useNewsData";

// ── colour palette ────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Business:      "#3b82f6",
  Politics:      "#ec4899",
  Technology:    "#10b981",
  Sport:         "#f97316",
  Entertainment: "#8b5cf6",
  Health:        "#14b8a6",
  Science:       "#6366f1",
};

const DEFAULT_COLOR = "#64748b";

function getCatColor(cat) {
  return CATEGORY_COLORS[cat] ?? DEFAULT_COLOR;
}

// ── skeleton ──────────────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="skeleton rounded-2xl" style={{ height: 280 }} />
  );
}

// ── stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent = "text-sky-700" }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
      <div className="text-4xl">{icon}</div>
      <div>
        <div className={`text-3xl font-black ${accent}`}>{value}</div>
        <div className="text-xs text-slate-500 font-semibold mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ── custom pie label ──────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.04) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ── main analytics page ───────────────────────────────────────────────────────
function Analytics() {
  const { allArticles, loading } = useNewsData();

  // Category distribution
  const categoryData = useMemo(() => {
    const counts = {};
    for (const a of allArticles) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, fill: getCatColor(name) }));
  }, [allArticles]);

  // Articles by year
  const yearData = useMemo(() => {
    const counts = {};
    for (const a of allArticles) {
      if (!a.pubDate) continue;
      const year = new Date(a.pubDate).getFullYear();
      if (isNaN(year) || year < 2000 || year > 2030) continue;
      counts[year] = (counts[year] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([year, count]) => ({ year, count }));
  }, [allArticles]);

  // Top 5 categories
  const topCategories = useMemo(
    () => categoryData.slice(0, 5),
    [categoryData]
  );

  // Summary stats
  const totalArticles  = allArticles.length;
  const totalCategories = categoryData.length;
  const mostPopular    = categoryData[0]?.name ?? "—";
  const mostPopularCount = categoryData[0]?.count ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#0f172a 0px,#0f172a 200px,#f1f5f9 200px)" }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0c4a6e 100%)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-600 bg-slate-700/50 text-slate-200 text-sm font-semibold hover:bg-slate-600/50 hover:border-slate-500 transition-all shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 4.158a.75.75 0 11-1.06 1.06l-5.5-5.5a.75.75 0 010-1.06l5.5-5.5a.75.75 0 011.06 1.06L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Back
          </Link>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="live-dot" />
              <span className="text-sky-400 text-xs font-semibold tracking-widest uppercase">Analytics</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
              Dataset Analytics
            </h1>
          </div>

          <Link to="/" className="hidden sm:block text-white font-black text-lg tracking-tight shrink-0 hover:text-sky-300 transition-colors">
            NGAWI NEWS
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Articles"    value={totalArticles.toLocaleString()}     icon="📰" accent="text-sky-700" />
          <StatCard label="Total Categories"  value={totalCategories}                    icon="🏷️" accent="text-indigo-700" />
          <StatCard label="Most Popular"      value={mostPopular}                        icon="🔥" accent="text-orange-600" />
          <StatCard label="Top Cat. Articles" value={mostPopularCount.toLocaleString()}  icon="📊" accent="text-emerald-700" />
        </div>

        {/* Row 1: Category distribution (pie + bar) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pie chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full bg-indigo-500" />
              <h2 className="font-black text-slate-900">Category Distribution</h2>
            </div>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="count"
                    labelLine={false}
                    label={PieLabel}
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [v.toLocaleString(), "Articles"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top categories horizontal bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full bg-emerald-500" />
              <h2 className="font-black text-slate-900">Top Categories</h2>
            </div>
            {loading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topCategories} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} width={100} />
                  <Tooltip
                    formatter={(v) => [v.toLocaleString(), "Articles"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {topCategories.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* Row 2: Articles by year */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full bg-sky-500" />
            <h2 className="font-black text-slate-900">Articles by Year</h2>
          </div>
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yearData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip
                  formatter={(v) => [v.toLocaleString(), "Articles"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Row 3: Per-category breakdown table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2"
               style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}>
            <span className="text-lg">📋</span>
            <h2 className="font-black text-white text-sm tracking-wide">Articles Per Category</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="skeleton h-8 rounded-lg" />
                ))}
              </div>
            ) : categoryData.map((row, idx) => {
              const pct = totalArticles > 0 ? (row.count / totalArticles) * 100 : 0;
              return (
                <div key={row.name} className="px-6 py-3 flex items-center gap-4">
                  <span className="text-xs font-black text-slate-400 w-5 text-right shrink-0">{idx + 1}</span>
                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: row.fill }} />
                    <span className="text-sm font-bold text-slate-800 truncate">{row.name}</span>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: row.fill }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 w-16 text-right shrink-0">
                    {row.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 w-12 text-right shrink-0">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;
