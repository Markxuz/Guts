import { Clock, Plus } from "lucide-react";

function formatDate(value) {
  if (!value) return "Pending";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Pending";
  return parsed.toLocaleDateString();
}

export default function SchedulePdcLaterTable({ enrollments, onAddSchedule }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 text-left text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">TDC Schedule</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment, index) => {
              const student = enrollment?.Student;
              if (!student) return null;

              const scheduleDate = enrollment?.promo_schedule_tdc?.schedule_date || new Date().toISOString().split("T")[0];
              const studentName = [student.first_name, student.last_name].filter(Boolean).join(" ") || "N/A";

              return (
                <tr
                  key={enrollment.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-slate-900">{studentName}</p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      TDC Pro
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-700">{student.email || "-"}</td>
                  <td className="px-4 py-3 align-top text-slate-700">{student.phone || "-"}</td>
                  <td className="px-4 py-3 align-top text-slate-700">{formatDate(enrollment?.promo_schedule_tdc?.schedule_date)}</td>
                  <td className="px-4 py-3 align-top text-right">
                    <button
                      type="button"
                      onClick={() => onAddSchedule(enrollment, scheduleDate)}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-600"
                    >
                      <Plus size={14} />
                      Add PDC Schedule
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-3 md:hidden">
        {enrollments.map((enrollment) => {
          const student = enrollment?.Student;
          if (!student) return null;

          const scheduleDate = enrollment?.promo_schedule_tdc?.schedule_date || new Date().toISOString().split("T")[0];
          const studentName = [student.first_name, student.last_name].filter(Boolean).join(" ") || "N/A";

          return (
            <article key={enrollment.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{studentName}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  TDC Pro
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <p>Email: <span className="text-slate-700">{student.email || "-"}</span></p>
                <p>Contact: <span className="text-slate-700">{student.phone || "-"}</span></p>
                <p className="inline-flex items-center gap-1">
                  <Clock size={12} />
                  TDC Schedule: <span className="text-slate-700">{formatDate(enrollment?.promo_schedule_tdc?.schedule_date)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAddSchedule(enrollment, scheduleDate)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-600"
              >
                <Plus size={14} />
                Add PDC Schedule
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
