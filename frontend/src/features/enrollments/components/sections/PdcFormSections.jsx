import { FormField, SectionTitle, SelectField } from "../FormField";
import PdcCategoryCards from "./PdcCategoryCards";

const vehicleTypeOptions = [
  { value: "Car", label: "Car" },
  { value: "Motorcycle", label: "Motorcycle" },
];

const transmissionTypeOptions = [
  { value: "Automatic", label: "Automatic Transmission" },
  { value: "Manual", label: "Manual Transmission" },
];

export default function PdcFormSections({ form, onFieldChange }) {
  return (
    <>
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

      <div className="mt-2 grid gap-3 md:grid-cols-2">
        <SelectField
          label="TYPE OF VEHICLE"
          name="target_vehicle"
          value={form.enrollment.target_vehicle}
          onChange={(event) => onFieldChange("enrollment", "target_vehicle", event.target.value)}
          placeholder="Select Type of Vehicle"
          options={vehicleTypeOptions}
          inputClassName="text-slate-900"
        />
        <SelectField
          label="TYPE OF TRANSMISSION"
          name="transmission_type"
          value={form.enrollment.transmission_type}
          onChange={(event) => onFieldChange("enrollment", "transmission_type", event.target.value)}
          placeholder="Select Type of Transmission"
          options={transmissionTypeOptions}
          inputClassName="text-slate-900"
        />
      </div>
    </>
  );
}
