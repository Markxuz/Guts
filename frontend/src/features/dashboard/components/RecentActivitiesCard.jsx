import { useState } from "react";

export default function RecentActivitiesCard({ rows, loading, error }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-900">Recent Activities</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsMinimized(true);
              setIsMaximized(false);
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
            title="Minimize recent activities"
          >
            Minimize
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMinimized(false);
              setIsMaximized((current) => !current);
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
            title="Maximize recent activities"
          >
            {isMaximized ? "Normal" : "Maximize"}
          </button>
        </div>
      </div>
      {isMinimized ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Recent activities card is minimized.
        </div>
      ) : (
      <div className={`thin-scrollbar scrollbar-thin overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 ${isMaximized ? "max-h-[70vh]" : "max-h-[500px]"}`}>
        {loading ? <p className="text-sm text-slate-500">Loading activities...</p> : null}
        {error ? <p className="text-sm text-red-500">Failed to load activities.</p> : null}
        {!loading && !error && rows.length === 0 ? <p className="text-sm text-slate-500">No recent activity for this period.</p> : null}
        {!loading && !error && rows.length > 0 ? (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{row.userName}</span> {row.action}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      )}
    </div>
  );
}
