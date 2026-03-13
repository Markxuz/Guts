import { FormField, SectionTitle, SelectField } from "../FormField";
import PdcCategoryCards from "./PdcCategoryCards";

const educationalAttainmentOptions = [
  { value: "High School", label: "High School" },
  { value: "College", label: "College" },
];

export default function PdcFormSections({ form, onFieldChange }) {
  return (
    <>
      <SectionTitle>COURSE INFORMATION</SectionTitle>
      <PdcCategoryCards
        selectedValue={form.enrollment.pdc_category}
        onSelect={(value) => onFieldChange("enrollment", "pdc_category", value)}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-wide text-slate-500">ENROLLMENT TYPE</span>
          <div className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm font-semibold leading-10 text-slate-800">
            PDC
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-wide text-slate-500">TRAINING METHOD</span>
          <div className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm font-semibold leading-10 text-slate-800">
            On Site
          </div>
        </div>
      </div>
      <div className="mt-2 grid gap-3 md:grid-cols-1">
        <SelectField
          label="EDUCATIONAL ATTAINMENT"
          name="educational_attainment"
          value={form.extras.educational_attainment}
          onChange={(event) => onFieldChange("extras", "educational_attainment", event.target.value)}
          placeholder="Select Educational Attainment"
          options={educationalAttainmentOptions}
          inputClassName="text-slate-900"
        />
      </div>

      <SectionTitle>EMERGENCY & CREDENTIALS</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        <FormField
          label="EMERGENCY CONTACT PERSON"
          name="emergency_contact_person"
          value={form.extras.emergency_contact_person}
          onChange={(event) => onFieldChange("extras", "emergency_contact_person", event.target.value)}
          placeholder="Emergency Contact Person"
        />
        <FormField
          label="EMERGENCY CONTACT NUMBER"
          name="emergency_contact_number"
          value={form.extras.emergency_contact_number}
          onChange={(event) => onFieldChange("extras", "emergency_contact_number", event.target.value)}
          placeholder="Emergency Contact Number"
        />
      </div>
      <div className="mt-2 grid gap-3 md:grid-cols-1">
        <FormField
          label="LTO/LTMS PORTAL ACCOUNT"
          name="lto_portal_account"
          value={form.extras.lto_portal_account}
          onChange={(event) => onFieldChange("extras", "lto_portal_account", event.target.value)}
          placeholder="LTO/LTMS Portal Account"
        />
      </div>
    </>
  );
}
