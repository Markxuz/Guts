import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { FormField, SelectField } from "./FormField";

const paymentTermsOptions = [
  { value: "full", label: "Full Payment" },
  { value: "installment", label: "Installment" },
  { value: "downpayment", label: "Downpayment" },
  { value: "custom", label: "Custom" },
];

export default function PaymentDetailsModal({
  enrollment,
  promoOfferOptions = [],
  onSubmit,
  onCancel,
  isPending = false,
}) {
  const [form, setForm] = useState({
    promo_offer_id: enrollment?.promo_offer_id || "",
    fee_amount: enrollment?.fee_amount || "",
    discount_amount: enrollment?.discount_amount || "",
    payment_terms: enrollment?.payment_terms || "",
    payment_reference_number: enrollment?.payment_reference_number || "",
    payment_notes: enrollment?.payment_notes || "",
  });

  const [error, setError] = useState("");

  function handleFieldChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.payment_terms) {
      setError("Payment terms is required");
      return;
    }

    if (!form.fee_amount || parseFloat(form.fee_amount) < 0) {
      setError("Fee amount must be a valid positive number");
      return;
    }

    onSubmit(form);
  }

  const studentName = enrollment
    ? `${enrollment.student?.first_name || ""} ${enrollment.student?.last_name || ""}`.trim()
    : "Student";

  const enrollmentType = enrollment?.enrollment_type || "Unknown";

  return (
    <div
      style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
      className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#800000] px-6 py-4">
          <h2 className="text-base font-semibold text-white">Payment Details — {studentName}</h2>
          <button type="button" onClick={onCancel} className="text-white/70 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-3 text-sm text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Enrollment Details</p>
            <p className="mt-1 text-xs">
              Type: <span className="font-semibold">{enrollmentType}</span>
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <SelectField
              label="PROMO OFFER"
              name="promo_offer_id"
              value={form.promo_offer_id}
              onChange={(event) => handleFieldChange("promo_offer_id", event.target.value)}
              placeholder="Select promo offer"
              options={promoOfferOptions}
            />
            <FormField
              label="FEE AMOUNT"
              name="fee_amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={form.fee_amount}
              onChange={(event) => handleFieldChange("fee_amount", event.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <SelectField
              label="PAYMENT TERMS"
              name="payment_terms"
              value={form.payment_terms}
              onChange={(event) => handleFieldChange("payment_terms", event.target.value)}
              placeholder="Select payment terms"
              options={paymentTermsOptions}
              required
            />
            <FormField
              label="PAYMENT REFERENCE NUMBER"
              name="payment_reference_number"
              value={form.payment_reference_number}
              onChange={(event) => handleFieldChange("payment_reference_number", event.target.value)}
              placeholder="Reference / OR number"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-1">
            <FormField
              label="DISCOUNT AMOUNT (optional)"
              name="discount_amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={form.discount_amount}
              onChange={(event) => handleFieldChange("discount_amount", event.target.value)}
              placeholder="0.00"
            />
            <FormField
              label="PAYMENT NOTES"
              name="payment_notes"
              value={form.payment_notes}
              onChange={(event) => handleFieldChange("payment_notes", event.target.value)}
              placeholder="Additional financial notes"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
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
              {isPending ? "Saving..." : "Save & Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
