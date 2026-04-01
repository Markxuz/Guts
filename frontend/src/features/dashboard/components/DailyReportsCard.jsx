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
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Session</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Instructor / Care Of</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row) => {

                // Prefer slotLabel (e.g. '08:00 AM - 12:00 PM') if available, else fallback
                let sessionLabel = row.slotLabel || "-";
                if (!row.slotLabel) {
                  if (row.slot === "morning") sessionLabel = "Morning";
                  else if (row.slot === "afternoon") sessionLabel = "Afternoon";
                  else if (row.slot === "whole_day" || row.sessionType === "whole_day") sessionLabel = "Whole Day";
                  else if (row.slot) sessionLabel = row.slot;
                }

                // Instructor/Care Of formatting
                let instructorCareOf = "-";
                if (row.instructor && row.careOf) {
                  instructorCareOf = `Instructor: ${row.instructor}\nCare of: ${row.careOf}`;
                } else if (row.instructor) {
                  instructorCareOf = `Instructor: ${row.instructor}`;
                } else if (row.careOf) {
                  instructorCareOf = `Care of: ${row.careOf}`;
                }

                return (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.studentName}</td>
                    <td className="px-4 py-3 text-slate-700">{row.course || row.transactionType || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{row.vehicleType || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{sessionLabel}</td>
                    <td className="px-4 py-3 whitespace-pre-line text-slate-700">{instructorCareOf}</td>
                    <td className="px-4 py-3 text-slate-600">{row.remarks || row.description || row.transactionType}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
