import { useMemo, useState } from "react";
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
  student,
  studentProfile,
  studentName: studentNameProp,
  studentEmail,
  studentPhone,
  enrollmentLabel,
  courseLabel,
  promoOfferLabel,
  promoOfferOptions = [],
  onSubmit,
  onCancel,
  isPending = false,
  userRole = null,
}) {
  const [form, setForm] = useState({
    promo_offer_id: enrollment?.promo_offer_id || "",
    fee_amount: enrollment?.fee_amount || "",
    additional_promo_id: Array.isArray(enrollment?.additional_promo_offer_ids) && enrollment.additional_promo_offer_ids.length > 0
      ? String(enrollment.additional_promo_offer_ids[0])
      : "",
    additional_promo_amount: enrollment?.additional_promos_amount || "",
    discount_amount: enrollment?.discount_amount || "",
    payment_terms: enrollment?.payment_terms || "",
    payment_reference_number: enrollment?.payment_reference_number || "",
    payment_notes: enrollment?.payment_notes || "",
  });

  const [error, setError] = useState("");

  const promoOfferCatalog = useMemo(
    () => (Array.isArray(promoOfferOptions) ? promoOfferOptions : []).map((option) => ({
      ...option,
      value: String(option.value),
    })),
    [promoOfferOptions]
  );

  function toPromoPrice(offer) {
    const discounted = Number(offer?.discounted_price);
    if (Number.isFinite(discounted) && discounted > 0) {
      return discounted;
    }

    const fixed = Number(offer?.fixed_price);
    if (Number.isFinite(fixed) && fixed > 0) {
      return fixed;
    }

    return 0;
  }

  function getOfferById(offerId) {
    return promoOfferCatalog.find((offer) => String(offer.value) === String(offerId)) || null;
  }

  const selectedPromoOffer = getOfferById(form.promo_offer_id);
  const selectedPromoPrice = toPromoPrice(selectedPromoOffer);
  const selectedAdditionalPromoOffer = getOfferById(form.additional_promo_id);
  const selectedAdditionalPromoPrice = toPromoPrice(selectedAdditionalPromoOffer);
  const totalAmount = Number((selectedPromoPrice + selectedAdditionalPromoPrice).toFixed(2));

  function handleFieldChange(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "promo_offer_id") {
        const nextOffer = getOfferById(value);
        const nextPromoPrice = toPromoPrice(nextOffer);
        const nextAdditionalPrice = toPromoPrice(getOfferById(next.additional_promo_id));
        next.fee_amount = Number((nextPromoPrice + nextAdditionalPrice).toFixed(2)).toFixed(2);
      }

      if (field === "additional_promo_id") {
        const nextAdditionalOffer = getOfferById(value);
        const nextAdditionalPrice = toPromoPrice(nextAdditionalOffer);
        next.additional_promo_amount = nextAdditionalPrice.toFixed(2);
        const nextPromoPrice = toPromoPrice(getOfferById(next.promo_offer_id));
        next.fee_amount = Number((nextPromoPrice + nextAdditionalPrice).toFixed(2)).toFixed(2);
      }

      return next;
    });
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.payment_terms) {
      setError("Payment terms is required");
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      setError("Total amount must be a valid positive number");
      return;
    }

    // Prepare payload
    const payload = {
      promo_offer_id: form.promo_offer_id || null,
      fee_amount: totalAmount,
      additional_promos_amount: form.additional_promo_id ? parseFloat(form.additional_promo_amount || 0) : 0,
      additional_promo_offer_ids: form.additional_promo_id ? [parseInt(form.additional_promo_id)] : [],
      discount_amount: parseFloat(form.discount_amount || 0),
      payment_terms: form.payment_terms,
      payment_reference_number: form.payment_reference_number || "",
      payment_notes: form.payment_notes || "",
    };

    onSubmit(payload);
  }

  const derivedStudent = student || enrollment?.student || enrollment?.Student || null;
  const derivedProfile = studentProfile || enrollment?.studentProfile || enrollment?.StudentProfile || null;

  const studentName =
    studentNameProp || (derivedStudent ? `${derivedStudent.first_name || ""} ${derivedStudent.last_name || ""}`.trim() : "Student");

  const studentEmailValue = studentEmail || derivedProfile?.gmail_account || derivedStudent?.email || "N/A";
  const studentPhoneValue = studentPhone || derivedStudent?.phone || derivedProfile?.emergency_contact_number || "N/A";
  const enrollmentIdLabel = enrollmentLabel || (enrollment?.id ? `Enrollment #${enrollment.id}` : "Enrollment");
  const courseLabelValue = courseLabel || enrollment?.DLCode?.code || enrollment?.DLCode?.description || enrollment?.enrolling_for || "N/A";
  const enrollmentTypeValue =
    enrollment?.enrollment_type || enrollment?.enrolling_for || enrollment?.DLCode?.code || enrollment?.DLCode?.description || courseLabelValue || "N/A";
  const birthdateValue = derivedProfile?.birthdate || "N/A";
  const rawAddressParts = [
    derivedProfile?.house_number,
    derivedProfile?.street,
    derivedProfile?.barangay,
    derivedProfile?.city,
    derivedProfile?.province,
  ].filter(Boolean).map((p) => String(p).trim());
  const addressParts = rawAddressParts.filter((p) => !/^\d{6,}$/.test(p));
  const addressValue = (addressParts.length ? addressParts.join(", ") : null) || "N/A";
  const emergencyContactValue = [
    derivedProfile?.emergency_contact_person,
    derivedProfile?.emergency_contact_number,
  ].filter(Boolean).join(" - ") || "N/A";
  const studentIdValue = derivedStudent?.id || enrollment?.student_id || "N/A";

  const promoOfferText =
    promoOfferLabel || enrollment?.promoOffer?.name || enrollment?.PromoOffer?.name || enrollment?.promo_offer_name || enrollment?.promo_offer_id || "None";

  return (
    <div
      style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
      className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md h-[90vh] rounded-xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between bg-[#800000] px-6 py-4">
          <h2 className="text-base font-semibold text-white">Payment Details — {studentName}</h2>
          <button type="button" onClick={onCancel} className="text-white/70 hover:text-white">
            <X size={18} />
          </button>
        </div>

    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-3 text-sm text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Enrollment Details</p>
          <p className="mt-1 text-xs">
            Type: <span className="font-semibold">{enrollmentTypeValue}</span>
          </p>
          <p className="mt-1 text-xs">
            Student: <span className="font-semibold">{studentName}</span>
          </p>
          <p className="mt-1 text-xs">
            Student ID: <span className="font-semibold">{studentIdValue}</span>
          </p>
          <p className="mt-1 text-xs">
            ACTIVE GMAIL/YMAIL ACCOUNT *: <span className="font-semibold break-all">{studentEmailValue}</span>
          </p>
          <p className="mt-1 text-xs">
            Contact: <span className="font-semibold">{studentPhoneValue}</span>
          </p>
          <p className="mt-1 text-xs">
            Birthdate: <span className="font-semibold">{birthdateValue}</span>
          </p>
          <p className="mt-1 text-xs">
            Address: <span className="font-semibold">{addressValue}</span>
          </p>
          <p className="mt-1 text-xs">
            Emergency Contact: <span className="font-semibold">{emergencyContactValue}</span>
          </p>
          <p className="mt-1 text-xs">
            {enrollmentIdLabel} | Course: <span className="font-semibold">{courseLabelValue}</span>
          </p>
          <p className="mt-1 text-xs">
            Promo Offer: <span className="font-semibold">{promoOfferText}</span>
          </p>
        </div>

        {/* PROMO OFFER and FEE AMOUNT */}
        <div className="grid gap-3 md:grid-cols-2">
          {promoOfferOptions.length > 0 ? (
            <SelectField
              label="PROMO OFFER"
              name="promo_offer_id"
              value={form.promo_offer_id}
              onChange={(event) => handleFieldChange("promo_offer_id", event.target.value)}
              placeholder="Select promo offer"
              options={promoOfferOptions}
            />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <p className="text-[10px] font-bold tracking-wide text-slate-500">PROMO OFFER</p>
              <p className="mt-1">{promoOfferText}</p>
            </div>
          )}
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <p className="text-[10px] font-bold tracking-wide text-slate-500">FEE AMOUNT *</p>
            <p className="mt-1 font-semibold text-slate-900">₱{selectedPromoPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* ADDITIONAL PROMO and FEE AMOUNT */}
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField
            label="ADDITIONAL PROMO"
            name="additional_promo_id"
            value={form.additional_promo_id}
            onChange={(event) => handleFieldChange("additional_promo_id", event.target.value)}
            placeholder="Select additional promo"
            options={[
              { value: "", label: "None" },
              ...promoOfferOptions,
            ]}
          />
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <p className="text-[10px] font-bold tracking-wide text-slate-500">FEE AMOUNT *</p>
            <p className="mt-1 font-semibold text-slate-900">₱{selectedAdditionalPromoPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* PAYMENT TERMS and TOTAL AMOUNT (manual input) */}
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField
            label="PAYMENT TERMS *"
            name="payment_terms"
            value={form.payment_terms}
            onChange={(event) => handleFieldChange("payment_terms", event.target.value)}
            placeholder="Select payment terms"
            options={paymentTermsOptions}
            required
          />
          <FormField
            label="TOTAL AMOUNT *"
            name="fee_amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={totalAmount.toFixed(2)}
            onChange={() => {}}
            placeholder="0.00"
            readOnly
            required
          />
        </div>

        {/* DISCOUNT and RECEIPT (admin only) */}
        {userRole !== "staff" && (
          <div className="grid gap-3 md:grid-cols-2">
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
              label="RECEIPT / OR NUMBER"
              name="payment_reference_number"
              value={form.payment_reference_number}
              onChange={(event) => handleFieldChange("payment_reference_number", event.target.value)}
              placeholder="Manual receipt number"
            />
          </div>
        )}

        {/* PAYMENT NOTES (admin only) */}
        {userRole !== "staff" && (
          <FormField
            label="PAYMENT NOTES"
            name="payment_notes"
            value={form.payment_notes}
            onChange={(event) => handleFieldChange("payment_notes", event.target.value)}
            placeholder="Additional financial notes"
          />
        )}

        {/* TOTAL AMOUNT SUMMARY */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <p className="text-[10px] font-bold tracking-wide text-emerald-700">TOTAL AMOUNT SUMMARY</p>
          <p className="mt-1 font-semibold text-emerald-900">₱{totalAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="border-t border-slate-200 flex justify-end gap-2 p-6 bg-white">
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
