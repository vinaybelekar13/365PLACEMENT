'use client';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function TasksLeftPanel({ tasks, onJump }) {
  return (
    <div className="border border-[var(--border-strong)] rounded-lg bg-[var(--bg-surface)] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-[var(--text-primary)] tracking-wide">Tasks Left</h2>
        <span className="text-xs text-[var(--text-faint)] tabular-nums">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-xs text-[var(--text-faint)] italic">Nothing pending — you&apos;re all caught up.</p>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {tasks.map(task => (
            <button
              key={task.id}
              onClick={() => onJump(task.dayId)}
              className="w-full flex items-center gap-2 text-left rounded px-2 py-1.5 hover:bg-[var(--bg-elevated)] transition-colors group"
            >
              <span className="w-4 h-4 rounded border border-[var(--border-default)] shrink-0" />
              <span className="flex-1 text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--text-primary)]">{task.text}</span>
              <span className="text-[10px] text-[var(--text-faint)] shrink-0 tabular-nums">Day {task.dayNumber} · {formatShort(task.date)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
