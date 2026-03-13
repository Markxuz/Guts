export const ENROLLMENT_TYPE_OPTIONS = [
  { value: "TDC", label: "TDC Enrollment Form" },
  { value: "PDC", label: "PDC Enrollment Form" },
  { value: "PROMO", label: "TDC + PDC Promo Enrollment Form" },
];

export function getEnrollmentTypeLabel(type) {
  return ENROLLMENT_TYPE_OPTIONS.find((option) => option.value === type)?.label || "Enrollment Form";
}
