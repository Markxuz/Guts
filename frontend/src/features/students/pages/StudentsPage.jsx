import { Search } from "lucide-react";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import EditStudentModal from "../components/EditStudentModal";
import StatusUpdateModal from "../components/StatusUpdateModal";
import StudentDetailsModal from "../components/StudentDetailsModal";
import StudentTable from "../components/StudentTable";
import SummaryCards from "../components/SummaryCards";
import BulkStatusUpdateModal from "../components/BulkStatusUpdateModal";
import ToastStack from "../../../shared/utils/ToastStack";
import { useStudentsPageLogic } from "../hooks/useStudentsPageLogic";
import { useAuth } from "../../auth/hooks/useAuth";

function StudentsPage() {
  const { role } = useAuth();

  const {
    search,
    courseFilter,
    statusFilter,
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
    setStatusFilter,
    setSortBy,
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
    confirmDelete,
  } = useStudentsPageLogic();

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
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#800000]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Active</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-10 w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#800000]"
            >
              <option value="name_asc">Sort: Name A-Z</option>
              <option value="name_desc">Sort: Name Z-A</option>
              <option value="id_desc">Sort: Newest First</option>
              <option value="id_asc">Sort: Oldest First</option>
              <option value="status">Sort: Status</option>
            </select>

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
        selectedStudentIds={selectedStudentIds}
        allVisibleSelected={allVisibleSelected}
        onToggleSelectStudent={toggleSelectStudent}
        onToggleSelectAllVisible={toggleSelectAllVisible}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
      />

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
        form={bulkStatusForm}
        onChange={setBulkStatusForm}
        onClose={closeBulkStatusModal}
        onSubmit={submitBulkStatusUpdate}
        isPending={isBulkUpdatingStatus}
      />
    </section>
  );
}

export default StudentsPage;