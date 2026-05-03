import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { FormField, SelectField } from "../../enrollments/components/FormField";

const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "ewallet", label: "E-Wallet" },
];

export default function RecordPaymentModal({
  studentName,
  remainingBalance,
  onSubmit,
  onCancel,
  isPending = false,
}) {
  const [form, setForm] = useState({
    amount: "",
    reference_number: "",
    payment_method: "cash",
  });
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Payment amount must be a valid positive number.");
      return;
    }

    if (Number.isFinite(Number(remainingBalance)) && amount > Number(remainingBalance)) {
      setError("Payment amount cannot be greater than the remaining balance.");
      return;
    }

    onSubmit?.({
      amount,
      reference_number: form.reference_number.trim(),
      payment_method: form.payment_method,
    });
  }

  return (
    <div
      style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
      className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#800000] px-6 py-4">
          <h2 className="text-base font-semibold text-white">Record Payment — {studentName || "Student"}</h2>
          <button type="button" onClick={onCancel} className="text-white/70 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error ? (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-3 text-sm text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Payment Balance</p>
            <p className="mt-1 text-xs">
              Remaining balance: <span className="font-semibold">PHP {Number(remainingBalance || 0).toFixed(2)}</span>
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              label="PAYMENT AMOUNT"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              placeholder="0.00"
              required
            />
            <SelectField
              label="PAYMENT METHOD"
              name="payment_method"
              value={form.payment_method}
              onChange={(event) => updateField("payment_method", event.target.value)}
              placeholder="Select payment method"
              options={paymentMethodOptions}
              required
            />
          </div>

          <FormField
            label="RECEIPT / OR NUMBER"
            name="reference_number"
            value={form.reference_number}
            onChange={(event) => updateField("reference_number", event.target.value)}
            placeholder="Manual receipt number"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#800000] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#6d1224] disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}