import { SectionTitle, SelectField } from "../FormField";

const yesNoOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const transmissionOptions = [
  { value: "Manual", label: "Manual" },
  { value: "Automatic", label: "Automatic" },
];

const vehicleOptions = [
  { value: "Car", label: "Car" },
  { value: "Motorcycle", label: "Motorcycle" },
];

export default function TdcFormSections({ form, onFieldChange }) {
  const isDriver = form.enrollment.is_already_driver === true;
  const isMotorcycle = form.enrollment.target_vehicle === "Motorcycle";

  return (
    <>
      <SectionTitle>DRIVING INFORMATION</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField
          label="MARUNONG KA NA BANG MAGMANEHO?"
          name="is_already_driver"
          value={String(form.enrollment.is_already_driver)}
          onChange={(event) => onFieldChange("enrollment", "is_already_driver", event.target.value)}
          placeholder="Select Marunong ka na bang magmaneho?"
          options={yesNoOptions}
          inputClassName="text-slate-900"
        />
      </div>

      {isDriver ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <SelectField
            label="ANONG SASAKYAN ANG INAANYO?"
            name="target_vehicle"
            value={form.enrollment.target_vehicle}
            onChange={(event) => onFieldChange("enrollment", "target_vehicle", event.target.value)}
            placeholder="Select target vehicle"
            options={vehicleOptions}
            required
            inputClassName="text-slate-900"
          />
          <SelectField
            label="ANONG KLASE NG TRANSMISSION?"
            name="transmission_type"
            value={form.enrollment.transmission_type}
            onChange={(event) => onFieldChange("enrollment", "transmission_type", event.target.value)}
            placeholder="Select transmission type"
            options={transmissionOptions}
            required
            inputClassName="text-slate-900"
          />
          {isMotorcycle ? (
            <SelectField
              label="ANONG KLASE NG MOTOR?"
              name="motorcycle_type"
              value={form.enrollment.motorcycle_type}
              onChange={(event) => onFieldChange("enrollment", "motorcycle_type", event.target.value)}
              placeholder="Select motorcycle type"
              options={transmissionOptions}
              required
              inputClassName="text-slate-900"
              className="md:col-span-2"
            />
          ) : null}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-[#D4AF37]/30 bg-[#fff8e7] px-4 py-3 text-sm text-slate-700">
          Vehicle and transmission details are optional when the student is not yet driving.
        </p>
      )}
    </>
  );
}
