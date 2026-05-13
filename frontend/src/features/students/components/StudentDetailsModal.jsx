import {
  buildAddress,
  getCourseCode,
  getImportedTdcDates,
  getLatestEnrollment,
  getLatestScheduleForEnrollment,
  getStudentScheduleRemarks,
  getStudentSourceLabel,
  toTitleCase,
} from "../utils/studentsPageUtils";
import { getRegionLabel } from "../../enrollments/utils/phLocations";

export default function StudentDetailsModal({ student, onClose }) {
  if (!student) return null;

  const modalViewportStyle = {
    left: "var(--app-sidebar-width, 0px)",
    width: "calc(100vw - var(--app-sidebar-width, 0px))",
  };

  const profile = student.StudentProfile || {};
  const enrollment = getLatestEnrollment(student);
  const latestSchedule = getLatestScheduleForEnrollment(enrollment);
  const importedDates = getImportedTdcDates(student);
  const isImported = getStudentSourceLabel(student) !== "Walk-in";

  return (
    <div style={modalViewportStyle} className="fixed inset-y-0 right-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#800000] px-5 py-4 text-white">
          <div>
            <h3 className="text-lg font-semibold">Student Profile</h3>
            <p className="text-xs text-white/80">Detailed student information</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm font-semibold hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="thin-scrollbar max-h-[75vh] overflow-y-auto px-5 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Full Name</p>
              <p className="mt-1 text-sm text-slate-900">
                {[student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ") || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Email</p>
              <p className="mt-1 text-sm text-slate-900">{student.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Contact Number</p>
              <p className="mt-1 text-sm text-slate-900">{student.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Course</p>
              <p className="mt-1 text-sm text-slate-900">{getCourseCode(student)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Source</p>
              <p className="mt-1 text-sm text-slate-900">{getStudentSourceLabel(student)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Enrollment Status</p>
              <p className="mt-1 text-sm text-slate-900">{toTitleCase(enrollment?.status || (getStudentSourceLabel(student) === "Walk-in" ? "" : "imported"))}</p>
            </div>
            {isImported ? (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">TDC Start Date</p>
                  <p className="mt-1 text-sm text-slate-900">{importedDates.startedAt || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">TDC Completion Date</p>
                  <p className="mt-1 text-sm text-slate-900">{importedDates.completedAt || "N/A"}</p>
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Address</p>
            <p className="mt-1 text-sm text-slate-900">{buildAddress(profile)}</p>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Instructor Remarks</p>
            <p className="mt-1 text-sm text-slate-900">{latestSchedule?.instructor_remarks || "-"}</p>

            <p className="mt-3 text-xs font-semibold uppercase text-slate-500">Student Remarks</p>
            <p className="mt-1 text-sm text-slate-900">{getStudentScheduleRemarks(latestSchedule)}</p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Gender</p>
              <p className="mt-1 text-sm text-slate-900">{toTitleCase(profile.gender)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Civil Status</p>
              <p className="mt-1 text-sm text-slate-900">{toTitleCase(profile.civil_status)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Nationality</p>
              <p className="mt-1 text-sm text-slate-900">{profile.nationality || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Birthdate</p>
              <p className="mt-1 text-sm text-slate-900">{profile.birthdate || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Region</p>
              <p className="mt-1 text-sm text-slate-900">{getRegionLabel(profile.region) || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Educational Attainment</p>
              <p className="mt-1 text-sm text-slate-900">{profile.educational_attainment || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Emergency Contact Person</p>
              <p className="mt-1 text-sm text-slate-900">{profile.emergency_contact_person || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Emergency Contact Number</p>
              <p className="mt-1 text-sm text-slate-900">{profile.emergency_contact_number || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
