import { lazy, Suspense } from "react";
import { Search } from "lucide-react";
import StudentTable from "../components/StudentTable";
import SummaryCards from "../components/SummaryCards";
import ToastStack from "../../../shared/utils/ToastStack";
import { useStudentsPageLogic } from "../hooks/useStudentsPageLogic";
import { useAuth } from "../../auth/hooks/useAuth";
import { useSearchParams } from "react-router-dom";

const StudentDetailsModal = lazy(() => import("../components/StudentDetailsModal"));
const EditStudentModal = lazy(() => import("../components/EditStudentModal"));
const DeleteConfirmationDialog = lazy(() => import("../components/DeleteConfirmationDialog"));
const StatusUpdateModal = lazy(() => import("../components/StatusUpdateModal"));
const BulkStatusUpdateModal = lazy(() => import("../components/BulkStatusUpdateModal"));

function StudentsPage() {
  const { role } = useAuth();
  const [searchParams] = useSearchParams();
  const focusedStudentId = searchParams.get("focusStudentId");

  const {
    search,
    courseFilter,
    paymentFilter,
    sortBy,
    selectedStudent,
    editingStudent,
    editForm,
    deletingStudent,
    updatingStatusStudent,
    statusForm,
    selectedStudentIds,
    isBulkStatusModalOpen,
    bulkStatusForm,
    bulkSelectionMeta,
    allVisibleSelected,
    toasts,
    students,
    summary,
    pagination,
    isLoading,
    isError,
    error,
    isUpdatingStudent,
    isDeletingStudent,
    isUpdatingStatus,
    isBulkUpdatingStatus,
    setEditForm,
    setStatusForm,
    setBulkStatusForm,
    setSelectedStudent,
    setDeletingStudent,
    removeToast,
    setSearch,
    setCourseFilter,
    setPaymentFilter,
    toggleSelectStudent,
    toggleSelectAllVisible,
    openBulkStatusModal,
    closeBulkStatusModal,
    submitBulkStatusUpdate,
    goToPreviousPage,
    goToNextPage,
    openEditModal,
    closeEditModal,
    submitEdit,
    openStatusUpdateModal,
    closeStatusUpdateModal,
    submitStatusUpdate,
    quickApprovePendingStudent,
    confirmDelete,
    toggleTableSort,
  } = useStudentsPageLogic({ focusedStudentId });

  return (
    <section className="min-w-0 space-y-4">
      <ToastStack toasts={toasts} onDismiss={removeToast} />

      <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-white to-slate-100 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Database</h1>
            <p className="text-sm text-slate-600">Admin and Staff view of enrolled students</p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
            <label className="relative w-full sm:w-auto">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student..."
                className="h-10 w-full sm:w-64 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none ring-[#800000]/20 placeholder:text-slate-400 focus:border-[#800000] focus:ring-2"
              />
            </label>
            <div className="flex flex-wrap gap-2 md:ml-2">
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  courseFilter === "all" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setCourseFilter("all")}
              >
                Overall
              </button>
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  courseFilter === "TDC" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setCourseFilter("TDC")}
              >
                TDC
              </button>
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  courseFilter === "PDC" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setCourseFilter("PDC")}
              >
                PDC
              </button>
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  courseFilter === "passed" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setCourseFilter("passed")}
              >
                Completed / Passed
              </button>
            </div>
            <div className="flex flex-wrap gap-2 md:ml-2">
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  paymentFilter === "all" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setPaymentFilter("all")}
              >
                All Payments
              </button>
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  paymentFilter === "with_balance" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setPaymentFilter("with_balance")}
              >
                With Balance
              </button>
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  paymentFilter === "completed_payment" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setPaymentFilter("completed_payment")}
              >
                Completed Payments
              </button>
            </div>
            <button
              type="button"
              onClick={openBulkStatusModal}
              disabled={selectedStudentIds.length === 0}
              className="h-10 rounded-lg bg-[#800000] px-3 text-xs font-semibold text-white transition hover:bg-[#690000] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Bulk Update Status ({selectedStudentIds.length})
            </button>
          </div>
        </div>
      </div>

      <SummaryCards summary={summary} courseFilter={courseFilter} />

      <StudentTable
        students={students}
        isLoading={isLoading}
        isError={isError}
        error={error}
        pagination={pagination}
        onView={setSelectedStudent}
        onEdit={openEditModal}
        onUpdateStatus={openStatusUpdateModal}
        onDelete={setDeletingStudent}
        canDelete={role === "admin"}
        onClickPendingBadge={quickApprovePendingStudent}
        selectedStudentIds={selectedStudentIds}
        allVisibleSelected={allVisibleSelected}
        onToggleSelectStudent={toggleSelectStudent}
        onToggleSelectAllVisible={toggleSelectAllVisible}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        sortBy={sortBy}
        onToggleSort={toggleTableSort}
      />

      <Suspense fallback={null}>
        <StudentDetailsModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />

        <EditStudentModal
          student={editingStudent}
          form={editForm}
          onChange={setEditForm}
          onClose={closeEditModal}
          onSubmit={submitEdit}
          isPending={isUpdatingStudent}
        />

        <DeleteConfirmationDialog
          student={deletingStudent}
          onCancel={() => setDeletingStudent(null)}
          onConfirm={confirmDelete}
          isPending={isDeletingStudent}
        />

        <StatusUpdateModal
          student={updatingStatusStudent}
          form={statusForm}
          onChange={setStatusForm}
          onClose={closeStatusUpdateModal}
          onSubmit={submitStatusUpdate}
          isPending={isUpdatingStatus}
        />

        <BulkStatusUpdateModal
          isOpen={isBulkStatusModalOpen}
          selectedCount={selectedStudentIds.length}
          selectionMeta={bulkSelectionMeta}
          form={bulkStatusForm}
          onChange={setBulkStatusForm}
          onClose={closeBulkStatusModal}
          onSubmit={submitBulkStatusUpdate}
          isPending={isBulkUpdatingStatus}
        />
      </Suspense>
    </section>
  );
}

export default StudentsPage;