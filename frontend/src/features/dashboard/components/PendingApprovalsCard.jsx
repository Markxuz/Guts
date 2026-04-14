import { useMemo, useState } from "react";

export default function PendingApprovalsCard({
  scheduleRows,
  enrollmentRows,
  loading,
  approveMutation,
  rejectMutation,
  approveEnrollmentMutation,
  rejectEnrollmentMutation,
  onOpenEnrollment,
  onApproved,
  onRejected,
  onBulkCompleted,
}) {
  const [decisionTarget, setDecisionTarget] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [bulkConfirmAction, setBulkConfirmAction] = useState(null);

  const totalPending = (scheduleRows?.length || 0) + (enrollmentRows?.length || 0);
  const hasPending = totalPending > 0;

  const isAnyMutationPending =
    approveMutation?.isPending ||
    rejectMutation?.isPending ||
    approveEnrollmentMutation?.isPending ||
    rejectEnrollmentMutation?.isPending;

  const pendingSummary = useMemo(
    () => ({
      enrollments: enrollmentRows?.length || 0,
      schedules: scheduleRows?.length || 0,
    }),
    [enrollmentRows, scheduleRows]
  );

  async function handleEnrollmentDecision(row, action) {
    if (!row?.id) return { ok: false };

    try {
      if (action === "accept") {
        await approveEnrollmentMutation?.mutateAsync(row);
        return { ok: true };
      }

      await rejectEnrollmentMutation?.mutateAsync(row);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }

  async function handleScheduleDecision(row, action, options = {}) {
    if (!row?.id) return { ok: false };

    try {
      if (action === "accept") {
        await approveMutation?.mutateAsync(row.id);
        if (!options.silent) onApproved?.(row);
        return { ok: true };
      }

      await rejectMutation?.mutateAsync({ id: row.id });
      if (!options.silent) onRejected?.(row);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  }

  async function confirmDecision(action) {
    if (!decisionTarget) return;

    const row = decisionTarget.row;
    const type = decisionTarget.type;
    if (type === "enrollment") {
      await handleEnrollmentDecision(row, action);
    } else {
      await handleScheduleDecision(row, action);
    }

    setDecisionTarget(null);
  }

  async function runBulkDecision(action) {
    setBulkAction(action);

    const enrollmentResults = await Promise.allSettled(
      (enrollmentRows || []).map((row) => handleEnrollmentDecision(row, action))
    );
    const scheduleResults = await Promise.allSettled(
      (scheduleRows || []).map((row) => handleScheduleDecision(row, action, { silent: true }))
    );

    const successCount = [...enrollmentResults, ...scheduleResults].filter(
      (item) => item.status === "fulfilled" && item.value?.ok
    ).length;

    const failedCount = (enrollmentRows?.length || 0) + (scheduleRows?.length || 0) - successCount;

    onBulkCompleted?.({ action, successCount, failedCount });
    setBulkAction(null);
  }

  async function confirmBulkDecision() {
    if (!bulkConfirmAction) return;
    await runBulkDecision(bulkConfirmAction);
    setBulkConfirmAction(null);
  }

  const isBulkPending = Boolean(bulkAction);

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

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!hasPending || isAnyMutationPending || isBulkPending}
          onClick={() => setBulkConfirmAction("accept")}
          className="rounded-lg bg-[#800000] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#680000] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bulkAction === "accept" ? "Bulk Accepting..." : `Bulk Accept (${pendingSummary.enrollments + pendingSummary.schedules})`}
        </button>
        <button
          type="button"
          disabled={!hasPending || isAnyMutationPending || isBulkPending}
          onClick={() => setBulkConfirmAction("reject")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bulkAction === "reject" ? "Bulk Rejecting..." : `Bulk Reject (${pendingSummary.enrollments + pendingSummary.schedules})`}
        </button>
      </div>

      <div className="thin-scrollbar scrollbar-thin max-h-[500px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3">
        {loading ? <p className="text-sm text-slate-500">Loading approval requests...</p> : null}
        {!loading && totalPending === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">No pending approvals.</p>
        ) : null}

        <div className="space-y-3">
          {(enrollmentRows || []).map((row) => (
            <div
              key={`enrollment-${row.id}`}
              onDoubleClick={() => onOpenEnrollment?.(row)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
              title="Double-click to open this student in Student Database"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{row.studentName}</p>
                  <p className="mt-1 text-xs text-slate-500">{row.courseLabel}</p>
                  <p className="mt-1 text-xs text-slate-600">Enrollment #{row.enrollmentId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDecisionTarget({ type: "enrollment", row })}
                  disabled={isAnyMutationPending || isBulkPending}
                  className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800 hover:bg-amber-200 disabled:opacity-60"
                  title="Click to review approval decision"
                >
                  Pending
                </button>
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
                  onClick={() => setDecisionTarget({ type: "schedule", row })}
                  disabled={isAnyMutationPending || isBulkPending}
                  className="rounded-lg bg-[#800000] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#680000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Decide
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionTarget({ type: "schedule", row })}
                  disabled={isAnyMutationPending || isBulkPending}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {decisionTarget ? (
        <div
          style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
          className="fixed inset-y-0 right-0 z-[130] flex items-center justify-center bg-black/45 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">Review Pending Request</h3>
            <p className="mt-2 text-sm text-slate-600">
              {decisionTarget.type === "enrollment"
                ? `Do you want to accept or reject enrollment for ${decisionTarget.row?.studentName || "this student"}?`
                : `Do you want to approve or reject schedule change for ${decisionTarget.row?.currentSchedule?.studentName || "this student"}?`}
            </p>
            {decisionTarget.type === "enrollment" ? (
              <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                Rejecting a pending enrollment will permanently remove this pending application.
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDecisionTarget(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDecision("reject")}
                disabled={isAnyMutationPending || isBulkPending}
                className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
              >
                {decisionTarget.type === "schedule" ? "Reject" : "Reject Enrollment"}
              </button>
              <button
                type="button"
                onClick={() => confirmDecision("accept")}
                disabled={isAnyMutationPending || isBulkPending}
                className="rounded-lg bg-[#800000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#680000] disabled:opacity-60"
              >
                {decisionTarget.type === "schedule" ? "Approve" : "Accept Enrollment"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {bulkConfirmAction ? (
        <div
          style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
          className="fixed inset-y-0 right-0 z-[130] flex items-center justify-center bg-black/45 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900">Confirm Bulk Action</h3>
            <p className="mt-2 text-sm text-slate-600">
              {bulkConfirmAction === "accept"
                ? `Accept/approve all pending requests (${pendingSummary.enrollments + pendingSummary.schedules})?`
                : `Reject all pending requests (${pendingSummary.enrollments + pendingSummary.schedules})?`}
            </p>
            {bulkConfirmAction === "reject" ? (
              <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                This includes rejecting pending enrollments, which permanently removes those pending applications.
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBulkConfirmAction(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBulkDecision}
                disabled={isAnyMutationPending || isBulkPending}
                className="rounded-lg bg-[#800000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#680000] disabled:opacity-60"
              >
                {bulkConfirmAction === "accept" ? "Proceed Accept" : "Proceed Reject"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}