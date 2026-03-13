import { Clock, Eye, Pencil, Trash2 } from "lucide-react";
import { buildAddress, getCourseCode, getLatestEnrollment, toTitleCase } from "../utils/studentsPageUtils";

function Badge({ label, tone }) {
  const styles = {
    green: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    red: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    amber: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    maroon: "bg-[#800000]/10 text-[#800000] ring-1 ring-[#800000]/20",
    slate: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tone] || styles.slate}`}>
      {label}
    </span>
  );
}

export default function StudentTable({
  students,
  isLoading,
  isError,
  error,
  pagination,
  onView,
  onEdit,
  onUpdateStatus,
  onDelete,
  onPreviousPage,
  onNextPage,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#800000] text-left text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Address</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Loading students...
                </td>
              </tr>
            ) : null}

            {!isLoading && isError ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-rose-700">
                  {error?.message || "Failed to load students"}
                </td>
              </tr>
            ) : null}

            {!isLoading && !isError && students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No students found for the selected filters.
                </td>
              </tr>
            ) : null}

            {!isLoading && !isError
              ? students.map((student, index) => {
                  const enrollmentStatus = getLatestEnrollment(student)?.status || "pending";
                  const course = getCourseCode(student);
                  const isPromo = course === "PROMO";
                  const fullName = [student.first_name, student.middle_name, student.last_name]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr
                      key={student.id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} transition-colors hover:bg-[#D4AF37]/10`}
                    >
                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-slate-900">
                          {fullName || "N/A"}
                          {isPromo ? <span className="ml-2 rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[10px] font-bold text-[#800000]">Promo</span> : null}
                        </p>
                        <p className="text-xs text-slate-500">ID #{student.id}</p>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-700">
                        <p>{student.email || "N/A"}</p>
                        <p className="text-xs text-slate-500">{student.phone || "No phone"}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Badge label={course} tone="maroon" />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Badge
                          label={toTitleCase(enrollmentStatus)}
                          tone={enrollmentStatus === "completed" ? "green" : enrollmentStatus === "pending" ? "amber" : "maroon"}
                        />
                      </td>
                      <td className="max-w-xs px-4 py-3 align-top text-slate-700">
                        <p className="truncate" title={buildAddress(student.StudentProfile)}>
                          {buildAddress(student.StudentProfile)}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2 text-slate-700">
                          <button
                            type="button"
                            onClick={() => onView(student)}
                            className="rounded-md p-2 hover:bg-slate-100"
                            title="View"
                          >
                            <Eye size={16} className="text-[#800000]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(student)}
                            className="rounded-md p-2 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Pencil size={16} className="text-[#8d6f12]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(student)}
                            className="rounded-md p-2 hover:bg-slate-100"
                            title="Update Status"
                          >
                            <Clock size={16} className="text-[#800000]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(student)}
                            className="rounded-md p-2 hover:bg-slate-100"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center">
        <p>
          Showing {pagination.fromEntry} to {pagination.toEntry} of {pagination.totalEntries} entries
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={pagination.currentPage <= 1}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
