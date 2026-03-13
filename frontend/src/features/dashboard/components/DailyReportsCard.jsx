export default function DailyReportsCard({ rows, total, loading, error, title, subtitle, emptyMessage }) {
  const entryCount = total ?? rows.length;

  return (
    <div className="rounded-xl border-t-2 border-t-[#800000] border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-xs font-semibold text-[#800000]">
          {entryCount} entries
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? <p className="p-4 text-sm text-slate-500">Loading daily reports...</p> : null}
        {error ? <p className="p-4 text-sm text-red-500">Failed to load daily reports.</p> : null}
        {!loading && !error && entryCount === 0 ? (
          <p className="p-4 text-sm text-slate-500">{emptyMessage}</p>
        ) : null}
        {!loading && !error && entryCount > 0 ? (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Student Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Course</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Vehicle Type</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Instructor</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.studentName}</td>
                  <td className="px-4 py-3 text-slate-700">{row.course || row.transactionType || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{row.vehicleType || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{row.instructor || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{row.remarks || row.description || row.transactionType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
