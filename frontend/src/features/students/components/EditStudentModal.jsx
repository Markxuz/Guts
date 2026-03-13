import { LoaderCircle, X } from "lucide-react";

export default function EditStudentModal({ student, form, onChange, onClose, onSubmit, isPending }) {
  if (!student) return null;

  const handleFieldChange = (section, field, value) => {
    onChange((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const sectionHeadingClass = "mb-2 text-xs font-bold uppercase tracking-wide text-[#800000]";
  const inputClass =
    "rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-500 outline-none transition focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#800000] px-5 py-4 text-white">
          <div>
            <h3 className="text-lg font-semibold">Edit Student</h3>
            <p className="text-xs text-white/80">Update student and profile details</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-white/70 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="thin-scrollbar max-h-[75vh] overflow-y-auto px-5 py-4">
          <h4 className={sectionHeadingClass}>Personal Information</h4>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={form.student.first_name}
              onChange={(event) => handleFieldChange("student", "first_name", event.target.value)}
              placeholder="First Name"
              required
              className={inputClass}
            />
            <input
              value={form.student.middle_name}
              onChange={(event) => handleFieldChange("student", "middle_name", event.target.value)}
              placeholder="Middle Name"
              className={inputClass}
            />
            <input
              value={form.student.last_name}
              onChange={(event) => handleFieldChange("student", "last_name", event.target.value)}
              placeholder="Last Name"
              required
              className={inputClass}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={form.student.email}
              onChange={(event) => handleFieldChange("student", "email", event.target.value)}
              placeholder="Email"
              type="email"
              className={inputClass}
            />
            <input
              value={form.student.phone}
              onChange={(event) => handleFieldChange("student", "phone", event.target.value)}
              placeholder="Contact Number"
              className={inputClass}
            />
          </div>

          <h4 className={`${sectionHeadingClass} mt-5`}>Profile</h4>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={form.profile.birthdate}
              onChange={(event) => handleFieldChange("profile", "birthdate", event.target.value)}
              type="date"
              className={inputClass}
            />
            <input
              value={form.profile.age}
              onChange={(event) => handleFieldChange("profile", "age", event.target.value)}
              placeholder="Age"
              type="number"
              className={inputClass}
            />
            <input
              value={form.profile.gender}
              onChange={(event) => handleFieldChange("profile", "gender", event.target.value)}
              placeholder="Gender"
              className={inputClass}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <input
              value={form.profile.civil_status}
              onChange={(event) => handleFieldChange("profile", "civil_status", event.target.value)}
              placeholder="Civil Status"
              className={inputClass}
            />
            <input
              value={form.profile.nationality}
              onChange={(event) => handleFieldChange("profile", "nationality", event.target.value)}
              placeholder="Nationality"
              className={inputClass}
            />
            <input
              value={form.profile.region}
              onChange={(event) => handleFieldChange("profile", "region", event.target.value)}
              placeholder="Region"
              className={inputClass}
            />
          </div>

          <h4 className={`${sectionHeadingClass} mt-5`}>Address</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.profile.house_number}
              onChange={(event) => handleFieldChange("profile", "house_number", event.target.value)}
              placeholder="House Number / Bldg"
              className={inputClass}
            />
            <input
              value={form.profile.street}
              onChange={(event) => handleFieldChange("profile", "street", event.target.value)}
              placeholder="Street"
              className={inputClass}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <input
              value={form.profile.barangay}
              onChange={(event) => handleFieldChange("profile", "barangay", event.target.value)}
              placeholder="Barangay"
              className={inputClass}
            />
            <input
              value={form.profile.city}
              onChange={(event) => handleFieldChange("profile", "city", event.target.value)}
              placeholder="City"
              className={inputClass}
            />
            <input
              value={form.profile.province}
              onChange={(event) => handleFieldChange("profile", "province", event.target.value)}
              placeholder="Province"
              className={inputClass}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={form.profile.zip_code}
              onChange={(event) => handleFieldChange("profile", "zip_code", event.target.value)}
              placeholder="Zip Code"
              className={inputClass}
            />
            <input
              value={form.profile.educational_attainment}
              onChange={(event) => handleFieldChange("profile", "educational_attainment", event.target.value)}
              placeholder="Educational Attainment"
              className={inputClass}
            />
          </div>

          <h4 className={`${sectionHeadingClass} mt-5`}>Contacts and Accounts</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.profile.emergency_contact_person}
              onChange={(event) => handleFieldChange("profile", "emergency_contact_person", event.target.value)}
              placeholder="Emergency Contact Person"
              className={inputClass}
            />
            <input
              value={form.profile.emergency_contact_number}
              onChange={(event) => handleFieldChange("profile", "emergency_contact_number", event.target.value)}
              placeholder="Emergency Contact Number"
              className={inputClass}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={form.profile.fb_link}
              onChange={(event) => handleFieldChange("profile", "fb_link", event.target.value)}
              placeholder="FB Link"
              className={inputClass}
            />
            <input
              value={form.profile.gmail_account}
              onChange={(event) => handleFieldChange("profile", "gmail_account", event.target.value)}
              placeholder="Gmail Account"
              className={inputClass}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-1">
            <input
              value={form.profile.lto_portal_account}
              onChange={(event) => handleFieldChange("profile", "lto_portal_account", event.target.value)}
              placeholder="LTO Portal Account"
              className={inputClass}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#800000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#690000] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
