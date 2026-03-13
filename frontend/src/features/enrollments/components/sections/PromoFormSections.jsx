import { SectionTitle, SelectField } from "../FormField";
import PdcCategoryCards from "./PdcCategoryCards";

const tdcTrainingModeOptions = [
  { value: "Onsite", label: "Onsite" },
  { value: "Online", label: "Online" },
];

const vehicleTypeOptions = [
  { value: "Motor", label: "Motor" },
  { value: "Car", label: "Car" },
];

export default function PromoFormSections({ form, onFieldChange }) {
  return (
    <>
      <SectionTitle>COURSE INFORMATION</SectionTitle>
      <PdcCategoryCards
        selectedValue={form.enrollment.pdc_category}
        onSelect={(value) => onFieldChange("enrollment", "pdc_category", value)}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField
          label="TDC MODE OF TRAINING"
          name="tdc_training_method"
          value={form.extras.tdc_training_method}
          onChange={(event) => onFieldChange("extras", "tdc_training_method", event.target.value)}
          placeholder="Select TDC Mode of Training"
          options={tdcTrainingModeOptions}
          inputClassName="text-slate-900"
        />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-wide text-slate-500">PDC MODE OF TRAINING</span>
          <div className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm font-semibold leading-10 text-slate-800">
            Onsite
          </div>
        </div>
      </div>
      <div className="mt-2 grid gap-3 md:grid-cols-1">
        <SelectField
          label="TYPE OF VEHICLE"
          name="target_vehicle"
          value={form.enrollment.target_vehicle}
          onChange={(event) => onFieldChange("enrollment", "target_vehicle", event.target.value)}
          placeholder="Select Type of Vehicle"
          options={vehicleTypeOptions}
          inputClassName="text-slate-900"
          required
        />
      </div>
    </>
  );
}
