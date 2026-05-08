import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, ReceiptText } from "lucide-react";
import { resourceServices } from "../services/resources";

function money(value) {
  const numeric = Number(value || 0);
  return `PHP ${numeric.toFixed(2)}`;
}

export default function QREnrollmentPaymentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ amount: "", payment_method: "cash", reference_number: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEnrollment() {
      try {
        const response = await fetch(`/api/enrollments/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load enrollment.");
        }

        if (!cancelled) {
          setEnrollment(data);
          const remaining = Number(data?.payment_summary?.remaining_balance ?? data?.fee_amount ?? 0);
          setForm((current) => ({ ...current, amount: String(remaining || "") }));
        }
      } catch (loadError) {
        if (!cancelled) {
          setStatus(loadError?.message || "Failed to load enrollment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEnrollment();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const summary = useMemo(() => {
    if (!enrollment) {
      return { totalDue: 0, totalPaid: 0, remainingBalance: 0 };
    }

    return {
      totalDue: Number(enrollment.payment_summary?.total_due ?? enrollment.fee_amount ?? 0),
      totalPaid: Number(enrollment.payment_summary?.total_paid ?? 0),
      remainingBalance: Number(enrollment.payment_summary?.remaining_balance ?? enrollment.fee_amount ?? 0),
    };
  }, [enrollment]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!enrollment) return;

    setSaving(true);
    setStatus("");

    try {
      const payment = await resourceServices.payments.create({
        enrollment_id: enrollment.id,
        amount: form.amount,
        payment_method: form.payment_method,
        payment_status: "paid",
        reference_number: form.reference_number || null,
        notes: form.notes || null,
      });

      const remainingAfter = Math.max(Number(summary.remainingBalance) - Number(form.amount || 0), 0);
      const nextStatus = remainingAfter <= 0 ? "completed" : "confirmed";
      await resourceServices.enrollments.update(enrollment.id, { status: nextStatus });

      setStatus(`Payment saved. Transaction #${payment?.id || "new"} recorded.`);
      navigate("/enrollments/qr-pending", { replace: true });
    } catch (submitError) {
      setStatus(submitError?.message || "Failed to save payment.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm card-light">
          <Loader2 size={16} className="animate-spin" />
          Loading QR payment page...
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4">
        <div className="w-full rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-center card-light">
          <h1 className="text-2xl font-bold text-slate-950">Enrollment not found</h1>
          <p className="mt-2 text-sm text-slate-600">The QR approval page could not load the requested enrollment.</p>
        </div>
      </div>
    );
  }

  const isCompleted = enrollment.status === "completed";
  const isReady = enrollment.status === "confirmed" || isCompleted;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(128,0,0,0.08),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_55%,_#faf5f3_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] card-light">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[#800000]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#800000]">
                <ReceiptText size={14} />
                QR Payment Handoff
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Enrollment #{enrollment.id}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Approved QR submissions continue here for the first payment transaction.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/enrollments/qr-pending")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back to queue
            </button>
          </div>
        </header>

        {status ? (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${status.includes("saved") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"} card-light`}>
            {status.includes("saved") ? <CheckCircle2 size={16} className="mr-2 inline-block" /> : null}
            {status}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm card-light">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
                <p className="mt-2 text-lg font-bold text-slate-950">{enrollment.status}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total Due</p>
                <p className="mt-2 text-lg font-bold text-slate-950">{money(summary.totalDue)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Remaining</p>
                <p className="mt-2 text-lg font-bold text-slate-950">{money(summary.remainingBalance)}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Student</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {enrollment.student?.first_name || ""} {enrollment.student?.last_name || ""}
                  </p>
                  <p className="text-sm text-slate-600">{enrollment.student?.email || enrollment.profile?.gmail_account || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">QR Source</p>
                  <p className="mt-1 font-semibold text-slate-950">{enrollment.qrCode?.name || "-"}</p>
                  <p className="text-sm text-slate-600">{enrollment.qrCode?.token || "-"}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm card-light">
            <h2 className="text-xl font-bold text-slate-950">Record payment</h2>
            <p className="mt-2 text-sm text-slate-600">This records the first transaction and updates the enrollment status to completed when the balance reaches zero.</p>

            {isReady ? (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Amount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Payment method</span>
                  <select
                    value={form.payment_method}
                    onChange={(event) => setForm((current) => ({ ...current, payment_method: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10"
                  >
                    <option value="cash">Cash</option>
                    <option value="gcash">GCash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Card</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Reference number</span>
                  <input
                    type="text"
                    value={form.reference_number}
                    onChange={(event) => setForm((current) => ({ ...current, reference_number: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10"
                    placeholder="Optional"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Notes</span>
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10"
                    placeholder="Optional payment notes"
                  />
                </label>

                {isCompleted ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    This enrollment is already fully paid. You can still record an audit payment if needed, but the remaining balance is already zero.
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">Recording this payment will return you to the QR queue.</div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#800000] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(128,0,0,0.22)] transition hover:bg-[#680000] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {saving ? "Saving..." : "Save payment"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                This enrollment is not ready for payment yet.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
