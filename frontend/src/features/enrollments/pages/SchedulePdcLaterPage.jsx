import { ArrowLeft, Clock, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ToastStack from "../../../shared/utils/ToastStack";
import { useSchedulePdcLaterEnrollments } from "../hooks/useSchedulePdcLaterEnrollments";
import SchedulePdcLaterTable from "../components/SchedulePdcLaterTable";
import SchedulePdcLaterModal from "../components/SchedulePdcLaterModal";

export default function SchedulePdcLaterPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const { data: enrollments = [], isLoading, isError, error } = useSchedulePdcLaterEnrollments();

  const filteredEnrollments = useMemo(() => {
    if (!search.trim()) return enrollments;

    const lowerSearch = search.toLowerCase();
    return enrollments.filter(
      (enrollment) =>
        enrollment?.Student?.first_name?.toLowerCase().includes(lowerSearch) ||
        enrollment?.Student?.last_name?.toLowerCase().includes(lowerSearch) ||
        enrollment?.Student?.email?.toLowerCase().includes(lowerSearch)
    );
  }, [enrollments, search]);

  function handleAddSchedule(enrollment) {
    setSelectedEnrollment(enrollment);
    setIsAddScheduleModalOpen(true);
  }

  function handleScheduleAdded(message) {
    setToasts((current) => [
      ...current,
      {
        id: Date.now(),
        message,
        type: "success",
      },
    ]);
    setIsAddScheduleModalOpen(false);
    setSelectedEnrollment(null);
  }

  function removeToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={removeToast} />

      <section className="min-w-0 space-y-4">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md p-1 text-slate-700 hover:bg-slate-300"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Clock size={16} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Schedule PDC Later</h1>
            <p className="text-xs text-slate-500">Manage PROMO enrollments pending PDC schedule</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-5 shadow-sm">
          <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? "s" : ""} pending PDC schedule
              </p>
              <p className="text-xs text-slate-500">TDC completed, waiting for PDC setup</p>
            </div>
            <label className="relative w-full md:w-64">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email..."
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </label>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-slate-600">
              Loading enrollments...
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center text-red-700">
              {error?.message || "Failed to load enrollments"}
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-slate-600">
              <Clock size={24} className="mx-auto mb-2 opacity-50" />
              <p>No enrollments found matching your search.</p>
            </div>
          ) : (
            <SchedulePdcLaterTable enrollments={filteredEnrollments} onAddSchedule={handleAddSchedule} />
          )}
        </div>
      </section>

      {isAddScheduleModalOpen && selectedEnrollment && (
        <SchedulePdcLaterModal
          isOpen={isAddScheduleModalOpen}
          enrollment={selectedEnrollment}
          onClose={() => {
            setIsAddScheduleModalOpen(false);
            setSelectedEnrollment(null);
          }}
          onScheduleAdded={handleScheduleAdded}
        />
      )}
    </>
  );
}
