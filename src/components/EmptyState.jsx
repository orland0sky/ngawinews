function EmptyState({ query, onClear }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">

      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl border border-slate-200">
        🔍
      </div>

      <h3 className="text-lg font-black text-slate-900 mb-2">
        No results found
      </h3>

      {query ? (
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
          No articles matched <strong className="text-slate-700">"{query}"</strong>.
          Try a different keyword, remove filters, or check the spelling.
        </p>
      ) : (
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
          No articles found for the current filters.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="bg-sky-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-sky-700 transition active:scale-95"
          >
            ← Back to Latest News
          </button>
        )}
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Try searching: <span className="font-semibold text-slate-500">economy · technology · football · climate</span>
      </p>

    </div>
  );
}

export default EmptyState;
