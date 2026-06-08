function PopularSearches({ searches, onSelectSearch }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-rose-500" />
        <h3 className="font-black text-slate-900">Trending</h3>
        <span className="ml-auto">🔥</span>
      </div>

      {searches.length === 0 ? (
        <p className="text-xs text-slate-400 leading-5">
          Popular keywords will appear here after searches are made.
        </p>
      ) : (
        <div className="space-y-1.5">
          {searches.map((item, index) => (
            <button
              key={`${item.query}-${index}`}
              id={`popular-search-${index}`}
              type="button"
              onClick={() => onSelectSearch?.(item.query)}
              className="
                group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left
                transition-all hover:bg-sky-50
              "
            >
              {/* Rank number */}
              <span className={`
                shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                text-xs font-black
                ${index === 0 ? "bg-amber-400 text-white" :
                  index === 1 ? "bg-slate-300 text-white" :
                  index === 2 ? "bg-orange-400 text-white" :
                  "bg-slate-100 text-slate-500"}
              `}>
                {index + 1}
              </span>

              <span className="flex-1 truncate text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">
                {item.query}
              </span>

              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                {item.count}×
              </span>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

export default PopularSearches;
