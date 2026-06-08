const BROWSE_SORT_OPTIONS = [
  { label: "Newest First",   value: "newest"     },
  { label: "Oldest First",   value: "oldest"     },
  { label: "Title A → Z",   value: "title_asc"  },
  { label: "Title Z → A",   value: "title_desc" },
];

const SEARCH_SORT_OPTIONS = [
  { label: "Relevance (Fuse.js)", value: "newest"     },
  { label: "Newest First",        value: "newest"     },
  { label: "Title A → Z",        value: "title_asc"  },
  { label: "Title Z → A",        value: "title_desc" },
];

const LIMIT_OPTIONS = [20, 50, 100];

function FilterSidebar({ mode, sort, setSort, limit, setLimit }) {

  const sortOptions = mode === "browse" ? BROWSE_SORT_OPTIONS : SEARCH_SORT_OPTIONS;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 rounded-full bg-sky-500" />
        <h3 className="font-black text-slate-900">Filters</h3>
        <span className="ml-auto text-xs text-slate-400 font-semibold uppercase tracking-wider">
          {mode === "browse" ? "Browse" : "Search"} Mode
        </span>
      </div>

      <div className="space-y-6 text-sm">

        {/* Sort */}
        <section>
          <h4 className="mb-3 font-bold text-slate-700 text-xs uppercase tracking-wider">
            Sort By
          </h4>
          <div className="space-y-1">
            {sortOptions.map((option) => (
              <label
                key={option.value}
                className={`
                  flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all
                  ${sort === option.value
                    ? "bg-sky-50 text-sky-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"}
                `}
              >
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={sort === option.value}
                  onChange={(e) => setSort(e.target.value)}
                  className="accent-sky-600 shrink-0"
                />
                {option.label}
                {sort === option.value && (
                  <span className="ml-auto text-sky-500">✓</span>
                )}
              </label>
            ))}
          </div>
        </section>

        {/* Per page */}
        <section>
          <h4 className="mb-3 font-bold text-slate-700 text-xs uppercase tracking-wider">
            Results Per Page
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {LIMIT_OPTIONS.map((option) => (
              <button
                key={option}
                id={`limit-${option}-btn`}
                type="button"
                onClick={() => setLimit(option)}
                className={`
                  rounded-xl border py-2.5 font-bold text-sm transition-all
                  ${limit === option
                    ? "border-sky-500 bg-sky-600 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"}
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        {/* Info chip */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-3 text-xs text-slate-500">
          <div className="font-semibold text-slate-700 mb-1">Category filter</div>
          Use the category tabs at the top to filter by topic.
        </div>

      </div>
    </div>
  );
}

export default FilterSidebar;
