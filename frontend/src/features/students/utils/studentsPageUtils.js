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

export function getEnrollmentLifecycleStatus(enrollment) {
  const normalizedState = String(enrollment?.enrollment_state || "").toLowerCase();
  if (normalizedState === "cancelled") {
    return "cancelled";
  }

  const normalizedStatus = String(enrollment?.status || "").toLowerCase();
  return normalizedStatus || "pending";
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function getEnrollmentPaymentSummary(enrollment) {
  const payments = Array.isArray(enrollment?.payments) ? enrollment.payments : [];
  const totalDue = toNumber(enrollment?.fee_amount);
  const totalPaid = payments.reduce((sum, payment) => sum + toNumber(payment?.amount), 0);
  const remainingBalance = Math.max(totalDue - totalPaid, 0);

  let paymentStatus = "not_set";
  if (totalDue > 0 || totalPaid > 0) {
    if (remainingBalance <= 0) {
      paymentStatus = "completed_payment";
    } else if (totalPaid > 0) {
      paymentStatus = "partial_payment";
    } else {
      paymentStatus = "with_balance";
    }
  }

  return {
    totalDue: Number(totalDue.toFixed(2)),
    totalPaid: Number(totalPaid.toFixed(2)),
    remainingBalance: Number(remainingBalance.toFixed(2)),
    paymentStatus,
  };
}

export function getPaymentCategoryLabel(enrollment) {
  return {
    promoOfferName: enrollment?.promoOffer?.name || enrollment?.promo_offer_name || "None",
    paymentTerms: enrollment?.payment_terms || "Full Payment",
  };
}

export function getLatestScheduleForEnrollment(enrollment) {
  if (!enrollment) return null;
  if (enrollment.Schedule) return enrollment.Schedule;
  if (Array.isArray(enrollment.scheduledSessions) && enrollment.scheduledSessions.length) {
    return enrollment.scheduledSessions[0];
  }
  return null;
}

export function getStudentScheduleRemarks(schedule) {
  return schedule?.student_remarks || schedule?.remarks || "-";
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
      student_permit_number: profile.student_permit_number || "",
      student_permit_date: profile.student_permit_date || "",
      student_permit_status: profile.student_permit_status || "",
      medical_certificate_provider: profile.medical_certificate_provider || "",
      medical_certificate_date: profile.medical_certificate_date || "",
    },
  };
}
