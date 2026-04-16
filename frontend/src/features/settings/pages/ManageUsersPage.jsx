import { useEffect, useState } from "react";
import { Database, Trash2, UserCog, X } from "lucide-react";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "../../users/hooks/useUsers";
import { useAuth } from "../../auth/hooks/useAuth";
import { api } from "../../../services/api";

const ROLES = [
  { value: "admin", label: "Main Admin", color: "bg-[#800000]/10 text-[#800000] border-[#800000]/30" },
  { value: "sub_admin", label: "Sub Admin", color: "bg-[#D4AF37]/10 text-amber-700 border-amber-300" },
  { value: "staff", label: "Staff", color: "bg-slate-100 text-slate-600 border-slate-300" },
];

function RoleBadge({ role }) {
  const r = ROLES.find((x) => x.value === role) || ROLES[2];
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${r.color}`}>
      {r.label}
    </span>
  );
}

const EMPTY_FORM = { name: "", email: "", password: "", role: "staff" };
const EMPTY_EDIT_FORM = {
  name: "",
  email: "",
  role: "staff",
  newPassword: "",
  mustChangePassword: true,
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/20";

export default function ManageUsersPage() {
  const { auth } = useAuth();
  const currentUserId = auth?.user?.id;
  const { data: users = [], isLoading } = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editError, setEditError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [backupStatus, setBackupStatus] = useState(null);

  function toast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }

  async function loadBackupStatus() {
    try {
      const payload = await api.get("/backups/status");
      setBackupStatus(payload);
    } catch {
      setBackupStatus(null);
    }
  }

  useEffect(() => {
    void loadBackupStatus();
  }, []);

  const createUser = useCreateUser({
    onSuccess: () => { setShowModal(false); setForm(EMPTY_FORM); toast("User created successfully."); },
    onError: (e) => setFormError(e.message),
  });

  const updateUser = useUpdateUser({
    onSuccess: () => {
      setEditUser(null);
      setEditForm(EMPTY_EDIT_FORM);
      setEditError("");
      toast("User updated successfully.");
    },
    onError: (e) => {
      setEditError(e.message || "Failed to update user.");
      toast(`Error: ${e.message}`);
    },
  });

  const deleteUser = useDeleteUser({
    onSuccess: () => toast("User deleted."),
    onError: (e) => toast(`Error: ${e.message}`),
  });

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!form.name || !form.email || !form.password) {
      setFormError("All fields are required.");
      return;
    }
    createUser.mutate(form);
  }

  function openEditModal(user) {
    setEditError("");
    setEditUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "staff",
      newPassword: "",
      mustChangePassword: true,
    });
  }

  function handleEditSave() {
    if (!editUser) return;

    const payload = {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
    };

    if (editForm.newPassword.trim()) {
      payload.newPassword = editForm.newPassword;
      payload.mustChangePassword = Boolean(editForm.mustChangePassword);
    }

    setEditError("");
    updateUser.mutate({ id: editUser.id, data: payload });
  }

  async function handleRunBackup() {
    try {
      setIsBackupRunning(true);
      const payload = await api.post("/backups/run", {});
      toast(`Backup complete: ${payload.backupFileName || "database backup created"}`);
      await loadBackupStatus();
    } catch (error) {
      toast(`Backup failed: ${error.message}`);
    } finally {
      setIsBackupRunning(false);
    }
  }

  function formatTimestamp(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return "-";
    return date.toLocaleString();
  }

  return (
    <section className="space-y-4">
      {toastMsg && (
        <div className="rounded-lg bg-[#800000] px-4 py-3 text-sm font-medium text-white shadow">
          {toastMsg}
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Management</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage admin and staff accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleRunBackup()}
            disabled={isBackupRunning}
            className="inline-flex items-center gap-2 rounded-lg border border-[#800000]/30 bg-white px-4 py-2 text-sm font-semibold text-[#800000] transition hover:bg-[#800000]/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Database size={14} />
            {isBackupRunning ? "Running Backup..." : "Backup Now"}
          </button>

          <button
            type="button"
            onClick={() => { setShowModal(true); setForm(EMPTY_FORM); setFormError(""); }}
            className="rounded-lg bg-[#800000] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6d1224]"
          >
            + Add User
          </button>
        </div>
      </div>

      {backupStatus ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm text-slate-700 shadow-sm">
          <p className="font-semibold text-slate-900">Database Backup Status</p>
          <p className="mt-1">
            Last Result: {String(backupStatus?.status?.status || "unknown").toUpperCase()} |
            Last Run: {formatTimestamp(backupStatus?.status?.timestamp)}
          </p>
          <p className="text-xs text-slate-500">
            Latest File: {backupStatus?.latestBackup?.name || backupStatus?.status?.backupFileName || "No backup file found"}
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">Loading…</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-5 py-3 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        title="Edit user"
                        onClick={() => openEditModal(u)}
                        className="rounded-md p-1.5 text-slate-500 transition hover:bg-amber-50 hover:text-amber-700"
                      >
                        <UserCog size={15} />
                      </button>
                      {u.id !== currentUserId && (
                        <button
                          type="button"
                          title="Delete user"
                          onClick={() => { if (window.confirm(`Delete user "${u.name}"?`)) deleteUser.mutate(u.id); }}
                          className="rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div
          style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
          className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#800000] px-6 py-4">
              <h2 className="text-base font-semibold text-white">Add New User</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {formError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
              )}
              {[
                { label: "Full Name", field: "name", type: "text", placeholder: "e.g. Juan dela Cruz" },
                { label: "Email Address", field: "email", type: "email", placeholder: "email@example.com" },
                { label: "Password", field: "password", type: "password", placeholder: "Min. 6 characters" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className={inputClass}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={createUser.isPending} className="rounded-lg bg-[#800000] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#6d1224] disabled:opacity-60">
                  {createUser.isPending ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div
          style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
          className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#800000] px-6 py-4">
              <h2 className="text-base font-semibold text-white">Edit User — {editUser.name}</h2>
              <button
                type="button"
                onClick={() => {
                  setEditUser(null);
                  setEditError("");
                }}
                className="text-white/70 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              {editError ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{editError}</p>
              ) : null}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                  className={inputClass}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">New Password (optional)</label>
                <input
                  type="password"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Leave blank to keep current password"
                  className={inputClass}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(editForm.mustChangePassword)}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, mustChangePassword: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-[#800000] focus:ring-[#800000]"
                  disabled={!editForm.newPassword.trim()}
                />
                Force password change on next login
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditUser(null);
                    setEditError("");
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updateUser.isPending}
                  onClick={handleEditSave}
                  className="rounded-lg bg-[#800000] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#6d1224] disabled:opacity-60"
                >
                  {updateUser.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
