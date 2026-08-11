"use client";

export default function Filters({ title, options, selected, setSelected }) {
  const groupId = `filter-${title.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <div className="flex flex-col gap-3" role="group" aria-labelledby={groupId}>
      <div className="flex items-center justify-between gap-3">
        <p id={groupId} className="text-sm font-medium text-[var(--text-primary)]">
          {title}
        </p>
        {selected && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-primary)]">
            Selected
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const isSelected = selected === item;

          return (
            <button
              key={item}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(isSelected ? null : item)}
              className={`rounded-full px-4 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                isSelected
                  ? "bg-[var(--accent-primary)] text-black shadow-[0_10px_30px_rgba(184,199,217,0.2)] hover:bg-[var(--accent-hover)]"
                  : "border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-primary)] hover:-translate-y-0.5 hover:border-[rgba(184,199,217,0.28)] hover:bg-[var(--glass-hover)]"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
