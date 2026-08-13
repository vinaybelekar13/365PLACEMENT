'use client';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatTooltipDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * GitHub-style contribution heatmap over the active challenge's days.
 * Purely presentational — `cells` comes from lib/stats.getHeatmapData(days)
 * and works for a challenge of any duration, not just a fixed length.
 */
export default function Heatmap({ cells, onSelectDay, title = 'Challenge Activity' }) {
  if (!cells.length) return null;

  const startWeekday = new Date(cells[0].date + 'T00:00:00').getDay();

  const weeks = [];
  let week = new Array(startWeekday).fill(null);
  for (const cell of cells) {
    week.push(cell);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  // Month label placed above the first week column that contains the 1st
  // (or the earliest visible day) of a new month.
  let lastMonth = null;
  const monthLabels = weeks.map(w => {
    const firstCell = w.find(Boolean);
    if (!firstCell) return null;
    const month = new Date(firstCell.date + 'T00:00:00').getMonth();
    if (month !== lastMonth) {
      lastMonth = month;
      return MONTHS[month];
    }
    return null;
  });

  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-[var(--text-primary)] tracking-wide">
          {title}
        </h2>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-faint)]">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <span key={level} className="heatmap-cell heatmap-legend" data-level={level} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="inline-flex gap-[3px]" style={{ minWidth: 'max-content' }}>
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-[3px] mr-1 pt-[15px] shrink-0">
            {DAY_LABELS.map((label, i) => (
              <span
                key={i}
                className="h-[11px] leading-[11px] text-[9px] text-[var(--text-faint)]"
              >
                {label}
              </span>
            ))}
          </div>

          {weeks.map((w, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              <span className="h-[12px] leading-[12px] text-[9px] text-[var(--text-faint)] whitespace-nowrap">
                {monthLabels[wi] || ''}
              </span>
              {w.map((cell, di) =>
                cell ? (
                  <button
                    key={`${cell.id}-${wi}-${di}`}
                    type="button"
                    onClick={() => onSelectDay(cell.id)}
                    data-level={cell.isFuture ? 'future' : cell.level}
                    className={`group relative heatmap-cell ${cell.isToday ? 'heatmap-cell-today' : ''}`}
                    aria-label={`Day ${cell.dayNumber}, ${formatTooltipDate(cell.date)}`}
                  >
                    <span className="heatmap-tooltip">
                      <span className="font-semibold text-[var(--text-primary)]">
                        Day {cell.dayNumber} · {formatTooltipDate(cell.date)}
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {cell.total > 0
                          ? `${cell.done}/${cell.total} completed · ${cell.pct}%`
                          : cell.isFuture
                          ? 'Not started yet'
                          : 'No tasks logged'}
                      </span>
                    </span>
                  </button>
                ) : (
                  <span key={di} className="heatmap-cell heatmap-cell-empty" />
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
