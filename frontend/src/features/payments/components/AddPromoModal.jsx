import { useMemo, useState } from "react";
import { AlertCircle, X } from "lucide-react";

function getPromoPrice(offer) {
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

export default function AddPromoModal({
  studentName,
  promoOffers = [],
  onSubmit,
  onCancel,
  isPending = false,
}) {
  const [selectedPromoId, setSelectedPromoId] = useState("");
  const [error, setError] = useState("");

  const activePromos = useMemo(() => {
    return (Array.isArray(promoOffers) ? promoOffers : []).filter((offer) => offer?.status !== "inactive");
  }, [promoOffers]);

  const selectedPromo = activePromos.find((offer) => String(offer.id) === String(selectedPromoId)) || null;
  const selectedPrice = selectedPromo ? getPromoPrice(selectedPromo) : 0;

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!selectedPromo) {
      setError("Please select a promo to add.");
      return;
    }

    onSubmit?.({
      promoOffer: selectedPromo,
      promoOfferId: selectedPromo.id,
      promoPrice: selectedPrice,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#800000] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">Add Promo — {studentName || "Student"}</h2>
            <p className="mt-0.5 text-xs text-white/80">Select one promo, then continue to payment.</p>
          </div>
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
            <p className="font-semibold text-slate-900">Available Promos</p>
            <p className="mt-1 text-xs">Choose the promo to add to this enrollment.</p>
          </div>

          <div className="max-h-[50vh] space-y-2 overflow-auto pr-1">
            {activePromos.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-4 text-center text-sm text-slate-500">
                No active promo offers available.
              </div>
            ) : (
              activePromos.map((offer) => {
                const offerId = String(offer.id);
                const isSelected = String(selectedPromoId) === offerId;
                const price = getPromoPrice(offer);
                const applicability = offer?.is_applicable ? "Selectable" : "Selectable as additional promo";

                return (
                  <button
                    key={offerId}
                    type="button"
                    onClick={() => setSelectedPromoId(offerId)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${isSelected ? "border-[#800000] bg-[#800000]/5" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {offer.name}
                        <span className="ml-2 text-xs font-medium text-slate-500">{price > 0 ? `- PHP ${price.toFixed(2)}` : ""}</span>
                      </div>
                      <div className="text-xs text-slate-500">{applicability}</div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isSelected ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-700"}`}>
                      {isSelected ? "Selected" : "Choose"}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedPromo ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Selected promo amount: <span className="font-semibold">PHP {selectedPrice.toFixed(2)}</span>
            </div>
          ) : null}

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
              disabled={isPending || !activePromos.length}
              className="rounded-lg bg-[#800000] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#6d1224] disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Continue to Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
