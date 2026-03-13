export default function RecentActivitiesCard({ rows, loading, error }) {
  return (
    <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-slate-900">Recent Activities</p>
      <div className="thin-scrollbar scrollbar-thin max-h-[500px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
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
    </div>
  );
}
