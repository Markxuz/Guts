import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Plus, Search, Trash2, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import NotificationBell from "../../notifications/components/NotificationBell";
import { resourceServices } from "../../../services/resources";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const APPLIES_TO_OPTIONS = [
  { value: "ALL", label: "All Enrollment Forms" },
  { value: "TDC", label: "TDC Enrollment Form" },
  { value: "PDC", label: "PDC Enrollment Form" },
  { value: "PROMO", label: "TDC + PDC Promo Enrollment Form" },
];

const APPLIES_TO_LABEL = {
  ALL: "All Enrollment Forms",
  TDC: "TDC Enrollment Form",
  PDC: "PDC Enrollment Form",
  PROMO: "TDC + PDC Promo Enrollment Form",
};

function emptyForm() {
  return {
    name: "",
    description: "",
    status: "active",
    applies_to: "ALL",
    fixed_price: "",
    discounted_price: "",
    notes: "",
  };
}

export default function PromoOffersPage() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  async function loadOffers() {
    setLoading(true);
    setError("");

    try {
      const offers = await resourceServices.promoOffers.list();
      setRows(Array.isArray(offers) ? offers : offers?.data || []);
    } catch (loadError) {
      setError(loadError?.message || "Failed to load promo offers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      void loadOffers();
    });
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (!keyword) return true;
      return [row.name, row.description, row.status, row.applies_to, row.fixed_price, row.discounted_price, row.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [rows, search]);

  function openNewModal() {
    setEditingId(null);
    setForm(emptyForm());
    setIsModalOpen(true);
  }

  function openEditModal(row) {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      description: row.description || "",
      status: row.status || "active",
      applies_to: row.applies_to || "ALL",
      fixed_price: row.fixed_price ?? "",
      discounted_price: row.discounted_price ?? "",
      notes: row.notes || "",
    });
    setIsModalOpen(true);
  }

  function formatMoney(value) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return String(value);
    }

    return parsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        status: form.status,
        applies_to: form.applies_to || "ALL",
        fixed_price: form.fixed_price === "" ? null : Number(form.fixed_price),
        discounted_price: form.discounted_price === "" ? null : Number(form.discounted_price),
        notes: form.notes.trim() || null,
      };

      if (editingId) {
        await resourceServices.promoOffers.update(editingId, payload);
      } else {
        await resourceServices.promoOffers.create(payload);
      }

      setIsModalOpen(false);
      await loadOffers();
    } catch (saveError) {
      setError(saveError?.message || "Failed to save promo offer.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this promo offer?")) {
      return;
    }

    setIsDeletingId(id);
    try {
      await resourceServices.promoOffers.remove(id);
      await loadOffers();
    } catch (deleteError) {
      setError(deleteError?.message || "Failed to delete promo offer.");
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <div className="min-h-full bg-slate-200 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#800000] px-4 py-4 text-white shadow-lg sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#f4d37d]">Settings</p>
            <h1 className="text-xl font-semibold">Promo Offers</h1>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={openNewModal} className="inline-flex items-center gap-2 rounded-lg bg-[#f4d37d] px-4 py-2 text-sm font-semibold text-[#800000]">
              <Plus size={16} />
              New Offer
            </button>
            <NotificationBell />
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((current) => !current)}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f4d37d] font-bold text-[#800000]">
                  {(auth?.user?.name || "U")[0].toUpperCase()}
                </span>
                <span className="hidden sm:inline">{auth?.user?.name || "User"}</span>
              </button>

              {userMenuOpen ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl">
                  <button type="button" onClick={() => navigate("/")} className="block w-full px-4 py-3 text-left text-sm hover:bg-slate-50">
                    Dashboard
                  </button>
                  <button type="button" onClick={logout} className="block w-full px-4 py-3 text-left text-sm hover:bg-slate-50">
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Search promo offers"
            />
          </label>
        </div>

        {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 sm:px-6">
            {filteredRows.length} promo offer{filteredRows.length === 1 ? "" : "s"}
          </div>

          {loading ? (
            <div className="px-4 py-12 text-sm text-slate-500 sm:px-6">Loading promo offers...</div>
          ) : filteredRows.length === 0 ? (
            <div className="px-4 py-12 text-sm text-slate-500 sm:px-6">No promo offers found.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredRows.map((row) => (
                <div key={row.id} className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-[#800000]" />
                      <h2 className="truncate text-base font-semibold text-slate-900">{row.name}</h2>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${row.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {row.status || "inactive"}
                      </span>
                    </div>
                    {row.description ? <p className="mt-2 text-sm text-slate-600">{row.description}</p> : null}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>Applies to: <strong className="text-slate-800">{APPLIES_TO_LABEL[row.applies_to] || APPLIES_TO_LABEL.ALL}</strong></span>
                      <span>Fixed price: <strong className="text-slate-800">{formatMoney(row.fixed_price)}</strong></span>
                      <span>Discounted price: <strong className="text-slate-800">{formatMoney(row.discounted_price)}</strong></span>
                    </div>
                    {row.notes ? <p className="mt-1 text-xs text-slate-400">{row.notes}</p> : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button type="button" onClick={() => openEditModal(row)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(row.id)} disabled={isDeletingId === row.id} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60">
                      <Trash2 size={14} />
                      {isDeletingId === row.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8">
          <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit Offer" : "New Offer"}</h2>
                <p className="text-sm text-slate-500">Manage the promo catalog shown in the enrollment form.</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full px-2 py-1 text-slate-500 hover:bg-slate-100">×</button>
            </div>

            <div className="grid gap-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Name</span>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#800000]" required />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Description</span>
                <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#800000]" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Status</span>
                  <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#800000]">
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Applies To</span>
                  <select value={form.applies_to} onChange={(event) => setForm((current) => ({ ...current, applies_to: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#800000]">
                    {APPLIES_TO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Fixed Price</span>
                  <input
                    value={form.fixed_price}
                    onChange={(event) => setForm((current) => ({ ...current, fixed_price: event.target.value }))}
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#800000]"
                    placeholder="0.00"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Discounted Price</span>
                  <input
                    value={form.discounted_price}
                    onChange={(event) => setForm((current) => ({ ...current, discounted_price: event.target.value }))}
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#800000]"
                    placeholder="0.00"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Notes</span>
                  <input value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#800000]" />
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700">Cancel</button>
              <button type="submit" disabled={isSaving} className="rounded-lg bg-[#800000] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {isSaving ? "Saving..." : "Save Offer"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}