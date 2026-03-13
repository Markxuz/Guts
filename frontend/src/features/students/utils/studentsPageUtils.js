export function toTitleCase(value) {
  if (!value) return "N/A";
  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getLatestEnrollment(student) {
  return student?.Enrollments?.[0] || null;
}

export function getCourseCode(student) {
  const latestEnrollment = getLatestEnrollment(student);
  const rawCode = latestEnrollment?.DLCode?.code || "";
  const normalizedCode = rawCode.toUpperCase();

  if (normalizedCode.includes("PROMO")) return "PROMO";
  if (normalizedCode.includes("PDC")) return "PDC";
  if (normalizedCode.includes("TDC")) return "TDC";
  return "N/A";
}

export function buildAddress(profile) {
  if (!profile) return "No address available";

  const parts = [
    profile.house_number,
    profile.street,
    profile.barangay,
    profile.city,
    profile.province,
    profile.zip_code,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "No address available";
}

export function mapStudentToEditForm(student) {
  const profile = student?.StudentProfile || {};

  return {
    student: {
      first_name: student?.first_name || "",
      middle_name: student?.middle_name || "",
      last_name: student?.last_name || "",
      email: student?.email || "",
      phone: student?.phone || "",
    },
    profile: {
      birthdate: profile.birthdate || "",
      age: profile.age || "",
      gender: profile.gender || "",
      civil_status: profile.civil_status || "",
      nationality: profile.nationality || "",
      fb_link: profile.fb_link || "",
      gmail_account: profile.gmail_account || "",
      house_number: profile.house_number || "",
      street: profile.street || "",
      barangay: profile.barangay || "",
      city: profile.city || "",
      province: profile.province || "",
      zip_code: profile.zip_code || "",
      region: profile.region || "",
      educational_attainment: profile.educational_attainment || "",
      emergency_contact_person: profile.emergency_contact_person || "",
      emergency_contact_number: profile.emergency_contact_number || "",
      lto_portal_account: profile.lto_portal_account || "",
    },
  };
}
