export default function PendingApprovalsCard({
  scheduleRows,
  enrollmentRows,
  loading,
  approveMutation,
  rejectMutation,
  onApproved,
  onRejected,
}) {
  const totalPending = (scheduleRows?.length || 0) + (enrollmentRows?.length || 0);

  return (
    <div className="rounded-xl border-t-2 border-t-[#800000] border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Pending Approvals</p>
          <p className="text-xs text-slate-500">Pending enrollments and schedule change requests</p>
        </div>
        <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-xs font-semibold text-[#800000]">
          {totalPending} pending
        </span>
      </div>

      <div className="thin-scrollbar scrollbar-thin max-h-[500px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
        {loading ? <p className="text-sm text-slate-500">Loading approval requests...</p> : null}
        {!loading && totalPending === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">No pending approvals.</p>
        ) : null}

        <div className="space-y-3">
          {(enrollmentRows || []).map((row) => (
            <div key={`enrollment-${row.id}`} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{row.studentName}</p>
                  <p className="mt-1 text-xs text-slate-500">{row.courseLabel}</p>
                  <p className="mt-1 text-xs text-slate-600">Enrollment #{row.enrollmentId}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                  Pending
                </span>
              </div>
            </div>
          ))}

          {(scheduleRows || []).map((row) => (
            <div key={row.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{row.currentSchedule?.studentName || "Student"}</p>
                  <p className="mt-1 text-xs text-slate-500">{row.currentSchedule?.course || "Course"}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Current: {row.currentSchedule?.scheduleDate} ({row.currentSchedule?.slot})
                  </p>
                  <p className="text-xs text-slate-600">
                    Requested: {row.requestedScheduleDate} ({row.requestedSlot})
                  </p>
                  <p className="mt-2 text-xs text-slate-700">Reason: {row.reason}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Requested by {row.requester?.name || "Staff"}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                  Pending
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => approveMutation.mutate(row.id, { onSuccess: () => onApproved?.(row) })}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="rounded-lg bg-[#800000] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#680000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {approveMutation.isPending ? "Approving..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => rejectMutation.mutate({ id: row.id }, { onSuccess: () => onRejected?.(row) })}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}