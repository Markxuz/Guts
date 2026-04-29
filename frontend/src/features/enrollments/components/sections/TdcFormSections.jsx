import { SectionTitle } from "../FormField";

export default function TdcFormSections() {
  return (
    <>
      <SectionTitle>DRIVING INFORMATION</SectionTitle>
      <p className="mt-3 rounded-xl border border-[#D4AF37]/30 bg-[#fff8e7] px-4 py-3 text-sm text-slate-700">
        TDC enrollments do not need extra driving-experience fields here. Promo selection is handled in Financial Details.
      </p>
    </>
  );
}
