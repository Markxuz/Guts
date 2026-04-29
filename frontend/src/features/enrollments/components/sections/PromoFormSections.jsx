import { FormField, SectionTitle, SelectField } from "../FormField";

const yesNoOptions = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

const tdcVehicleOptions = [
  { value: "Car", label: "Car" },
  { value: "Motorcycle", label: "Motorcycle" },
];

const tdcTransmissionOptions = [
  { value: "Manual", label: "Manual" },
  { value: "Automatic", label: "Automatic" },
];

const pdcVehicleTypeOptions = [
  { value: "DL Codes A - Motorcycle (2 wheels)", label: "DL Codes A - Motorcycle (2 wheels)" },
  { value: "DL Codes A1 - Tricycle (3 wheels)", label: "DL Codes A1 - Tricycle (3 wheels)" },
  { value: "DL Codes B - Car/Sedan (4 wheels - 8 seaters below)", label: "DL Codes B - Car/Sedan (4 wheels - 8 seaters below)" },
  { value: "DL Codes B1 - L300/Van (4 wheels - 9 seaters above)", label: "DL Codes B1 - L300/Van (4 wheels - 9 seaters above)" },
  { value: "Other", label: "Other" },
];

const pdcTransmissionTypeOptions = [
  { value: "AUTOMATIC TRANSMISSION (A/T) not allowed to drive M/T", label: "AUTOMATIC TRANSMISSION (A/T) not allowed to drive M/T" },
  { value: "MANUAL TRANSMISSION (M/T) allowed to drive A/T", label: "MANUAL TRANSMISSION (M/T) allowed to drive A/T" },
  { value: "Other", label: "Other" },
];

const promoPdcEnrollingForOptions = [
  { value: "PDC Experienced", label: "PDC Experienced" },
  { value: "PDC Beginner", label: "PDC Beginner" },
  { value: "PDC Additional Restriction / DL Codes - Experienced", label: "PDC Additional Restriction / DL Codes - Experienced" },
  { value: "PDC Additional Restriction / DL Codes- Beginner", label: "PDC Additional Restriction / DL Codes- Beginner" },
  { value: "DRIVING LESSON ( w/ license already)", label: "DRIVING LESSON ( w/ license already)" },
  { value: "Other", label: "Other" },
];

const promoPdcModeOptions = [
  {
    value: "Experienced (w/ experience in driving/Applicable para sa marunong na talaga magdrive)",
    label: "Experienced (w/ experience in driving/Applicable para sa marunong na talaga magdrive)",
  },
  {
    value: "BEGINNER ( w/out Experience in Driving / Driving Enhancement/ Magpapaturo pa magdrive)",
    label: "BEGINNER ( w/out Experience in Driving / Driving Enhancement/ Magpapaturo pa magdrive)",
  },
  {
    value: "ADD RC/DL Codes -EXPERIENCED ( Para sa mga magpapadagdag ng DL Codes na marunong na talaga magdrive)",
    label: "ADD RC/DL Codes -EXPERIENCED ( Para sa mga magpapadagdag ng DL Codes na marunong na talaga magdrive)",
  },
  {
    value: "ADD RC/DL Codes -BEGINNER ( Para sa mga magpapadagdag ng DL Codes na Magpapaturo pa mag drive)",
    label: "ADD RC/DL Codes -BEGINNER ( Para sa mga magpapadagdag ng DL Codes na Magpapaturo pa mag drive)",
  },
  {
    value: "DRIVING LESSON ( Para sa mga may lisensya na at may DLCodes na B/B1 na Magpapaturo pa magdrive)",
    label: "DRIVING LESSON ( Para sa mga may lisensya na at may DLCodes na B/B1 na Magpapaturo pa magdrive)",
  },
  { value: "Other", label: "Other" },
];

const promoDrivingSchoolOptions = [
  { value: "GUTS Driving School", label: "GUTS Driving School" },
  { value: "Other", label: "Other" },
];

const pdcClassificationOptions = [
  { value: "Beginner", label: "Beginner" },
  { value: "Experience", label: "Experience" },
];

function inferPdcCategory(value) {
  const normalized = String(value || "").toLowerCase();

  if (normalized.includes("beginner")) {
    return "Beginner";
  }

  if (normalized.includes("experience") || normalized.includes("experienced") || normalized.includes("driving lesson")) {
    return "Experience";
  }

  return "";
}

export default function PromoFormSections({
  form,
  onFieldChange,
  onPromoPdcScheduleModeChange,
  promoTdcInstructorOptions,
  promoPdcInstructorOptions,
  promoVehicleOptions,
  promoTdcSelectedSlot,
  promoPdcSelectedSlot,
  promoPdcSlots,
  promoPdcWholeDay,
  promoPdcCourseLabel,
  loadingScheduleResources,
  loadingPromoTdcAvailability,
  loadingPromoPdcAvailability,
}) {
  const isPromoDriver = form.enrollment.is_already_driver === true;
  const isExperienceCategory = String(form.enrollment.pdc_category || "").toLowerCase() === "experience";
  const schedulePdcNow = form.promo_schedule_pdc.enabled === true;

  const handlePdcSelectionChange = (field, value) => {
    const inferredCategory = inferPdcCategory(value);
    onFieldChange("extras", field, value);

    if (inferredCategory) {
      onFieldChange("enrollment", "pdc_category", inferredCategory);
    }
  };

  return (
    <>
      <div className="rounded-lg border-l-4 border-l-[#800000] bg-[#fff9ef] px-4 py-3 mb-8 mt-12">
        <h3 className="text-sm font-bold tracking-wide text-[#800000]">TDC</h3>
      </div>

      {isExperienceCategory ? (
        <>
          <SectionTitle>PDC EXPERIENCE DRIVING ASSESSMENT</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            <SelectField
              label="MARUNONG KA NA BANG MAGMANEHO?"
              name="is_already_driver"
              value={String(form.enrollment.is_already_driver)}
              onChange={(event) => onFieldChange("enrollment", "is_already_driver", event.target.value)}
              placeholder="Select Marunong ka na bang magmaneho?"
              options={yesNoOptions}
              inputClassName="text-slate-900"
              required
            />
          </div>

          {!isPromoDriver ? (
            <p className="mt-3 rounded-xl border border-[#D4AF37]/30 bg-[#fff8e7] px-4 py-3 text-sm text-slate-700">
              PDC Experience requires a driver with selected vehicle and transmission details.
            </p>
          ) : (
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              <SelectField
                label="ANONG SASAKYAN ANG INAANYO?"
                name="target_vehicle"
                value={form.enrollment.target_vehicle}
                onChange={(event) => onFieldChange("enrollment", "target_vehicle", event.target.value)}
                placeholder="Select target vehicle"
                options={tdcVehicleOptions}
                inputClassName="text-slate-900"
                required
              />
              <SelectField
                label="ANONG KLASE NG TRANSMISSION?"
                name="transmission_type"
                value={form.enrollment.transmission_type}
                onChange={(event) => onFieldChange("enrollment", "transmission_type", event.target.value)}
                placeholder="Select transmission type"
                options={tdcTransmissionOptions}
                inputClassName="text-slate-900"
                required
              />
            </div>
          )}
        </>
      ) : (
        <p className="mt-3 rounded-xl border border-[#D4AF37]/30 bg-[#fff8e7] px-4 py-3 text-sm text-slate-700">
          Driving assessment, vehicle, and transmission fields are required only for PDC category: Experience.
        </p>
      )}

      <section className="mt-4 rounded-2xl border border-[#d9c9a0] bg-[#fff9ef] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">TDC Schedule Session</h3>
            <p className="mt-1 text-sm text-slate-500">Set the TDC schedule for promo enrollment.</p>
          </div>
          <span className="rounded-full bg-[#D4AF37]/20 px-3 py-1 text-xs font-semibold text-[#800000]">TDC</span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Start Date</span>
            <input
              type="date"
              value={form.promo_schedule_tdc.schedule_date}
              onChange={(event) => onFieldChange("promo_schedule_tdc", "schedule_date", event.target.value)}
              className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#800000]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Care of</span>
            <select
              value={form.promo_schedule_tdc.care_of_instructor_id}
              onChange={(event) => onFieldChange("promo_schedule_tdc", "care_of_instructor_id", event.target.value)}
              disabled={loadingScheduleResources}
              className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#800000] disabled:bg-slate-100"
            >
              <option value="">Select care of instructor</option>
              {promoTdcInstructorOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Instructor</span>
            <select
              value={form.promo_schedule_tdc.instructor_id}
              onChange={(event) => onFieldChange("promo_schedule_tdc", "instructor_id", event.target.value)}
              disabled={loadingScheduleResources}
              className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#800000] disabled:bg-slate-100"
            >
              <option value="">Select instructor</option>
              {promoTdcInstructorOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <div className="rounded-xl border border-[#d9c9a0] bg-white px-4 py-3 text-sm text-slate-600">
            Whole-day lecture session. Vehicle assignment is not required.
          </div>
        </div>

        <div className="mt-4 rounded-2xl border px-4 py-4 border-[#d9c9a0] bg-white text-slate-800">
          <p className="text-sm font-semibold">Whole Day (08:00 AM - 05:00 PM)</p>
          <p className={`mt-1 text-xs ${promoTdcSelectedSlot?.full ? "text-red-600" : "text-slate-500"}`}>
            {promoTdcSelectedSlot?.full ? (promoTdcSelectedSlot.fullLabel || "Fully Booked") : "Reserved as whole-day TDC session"}
          </p>
        </div>

        {loadingPromoTdcAvailability ? (
          <p className="mt-3 text-sm text-slate-500">Checking TDC schedule availability...</p>
        ) : null}
      </section>

        <section className="mt-6 rounded-2xl border border-[#d9c9a0] bg-[#fff9ef] p-4">
          <p className="text-sm font-semibold text-slate-900">PDC Start Option</p>
          <p className="mt-1 text-xs text-slate-600">Choose if the client wants to schedule PDC now or later.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onPromoPdcScheduleModeChange("now")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                schedulePdcNow
                  ? "bg-[#800000] text-white"
                  : "border border-[#d9c9a0] bg-white text-slate-700"
              }`}
            >
              Schedule PDC Now
            </button>
            <button
              type="button"
              onClick={() => onPromoPdcScheduleModeChange("later")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                !schedulePdcNow
                  ? "bg-[#800000] text-white"
                  : "border border-[#d9c9a0] bg-white text-slate-700"
              }`}
            >
              Schedule PDC Later
            </button>
          </div>
        </section>

      {schedulePdcNow ? (
      <>
      <div className="rounded-lg border-l-4 border-l-[#800000] bg-[#fff9ef] px-4 py-3 mb-8 mt-8">
        <h3 className="text-sm font-bold tracking-wide text-[#800000]">PDC</h3>
      </div>

      <SectionTitle>COURSE INFORMATION</SectionTitle>
      <div className="grid gap-3 md:grid-cols-1">
        <SelectField
          label="ENROLLING FOR"
          name="enrolling_for"
          value={form.extras.enrolling_for}
          onChange={(event) => handlePdcSelectionChange("enrolling_for", event.target.value)}
          placeholder="Select enrollment purpose"
          options={promoPdcEnrollingForOptions}
          required
        />
      </div>

      <div className="mt-2 grid gap-3 md:grid-cols-1">
        <SelectField
          label="PDC CLASSIFICATION"
          name="pdc_category"
          value={form.enrollment.pdc_category}
          onChange={(event) => onFieldChange("enrollment", "pdc_category", event.target.value)}
          placeholder="Select Beginner or Experience"
          options={pdcClassificationOptions}
          inputClassName="text-slate-900"
          required
        />
      </div>

      <div className="mt-2 grid gap-3 md:grid-cols-1">
        <SelectField
          label="MODE OF TRAINING"
          name="training_method"
          value={form.enrollment.training_method}
          onChange={(event) => {
            onFieldChange("enrollment", "training_method", event.target.value);
            const inferredCategory = inferPdcCategory(event.target.value);
            if (inferredCategory) {
              onFieldChange("enrollment", "pdc_category", inferredCategory);
            }
          }}
          placeholder="Select mode of training"
          options={promoPdcModeOptions}
          required
        />
      </div>

      <p className="mt-3 rounded-xl border border-[#D4AF37]/30 bg-[#fff8e7] px-4 py-3 text-sm text-slate-700">
        IMPORTANT REMINDERS FOR PDC STUDENTS: PER DL CODES PO ANG ATING PDC. EVERY DL CODES MAGKAKAIBA ANG RATES AND SCHEDULE.
      </p>

      <div className="mt-2 grid gap-3 md:grid-cols-2">
        <SelectField
          label="ANONG SASAKYAN ANG IMAMANEHO?"
          name="target_vehicle"
          value={form.enrollment.target_vehicle}
          onChange={(event) => onFieldChange("enrollment", "target_vehicle", event.target.value)}
          placeholder="Select vehicle"
          options={pdcVehicleTypeOptions}
          inputClassName="text-slate-900"
          required
        />
        <SelectField
          label="ANONG KLASE NG TRANSMISSION?"
          name="transmission_type"
          value={form.enrollment.transmission_type}
          onChange={(event) => onFieldChange("enrollment", "transmission_type", event.target.value)}
          placeholder="Select transmission"
          options={pdcTransmissionTypeOptions}
          inputClassName="text-slate-900"
          required
        />
      </div>

      <div className="mt-2 grid gap-3 md:grid-cols-2">
        <SelectField
          label="Driving School where you have taken your TDC"
          name="driving_school_tdc"
          value={form.extras.driving_school_tdc}
          onChange={(event) => onFieldChange("extras", "driving_school_tdc", event.target.value)}
          placeholder="Select driving school"
          options={promoDrivingSchoolOptions}
          required
        />
        <FormField
          label="Year you completed your TDC"
          name="year_completed_tdc"
          value={form.extras.year_completed_tdc}
          onChange={(event) => onFieldChange("extras", "year_completed_tdc", event.target.value)}
          placeholder="Enter year completed"
          required
        />
      </div>

      {form.extras.driving_school_tdc === "Other" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-1">
          <FormField
            label="Name of Driving School"
            name="driving_school_tdc_other"
            value={form.extras.driving_school_tdc_other || ""}
            onChange={(event) => onFieldChange("extras", "driving_school_tdc_other", event.target.value)}
            placeholder="Enter driving school name"
            required
          />
        </div>
      ) : null}

      <section className="mt-8 rounded-2xl border border-[#d9c9a0] bg-[#fff9ef] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">PDC Schedule Session</h3>
            <p className="mt-1 text-sm text-slate-500">Set the PDC schedule for promo enrollment.</p>
          </div>
          <span className="rounded-full bg-[#D4AF37]/20 px-3 py-1 text-xs font-semibold text-[#800000]">
            {promoPdcCourseLabel}
          </span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Start Date</span>
            <input
              type="date"
              value={form.promo_schedule_pdc.schedule_date}
              onChange={(event) => onFieldChange("promo_schedule_pdc", "schedule_date", event.target.value)}
              className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#800000]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Care of</span>
            <select
              value={form.promo_schedule_pdc.care_of_instructor_id}
              onChange={(event) => onFieldChange("promo_schedule_pdc", "care_of_instructor_id", event.target.value)}
              disabled={loadingScheduleResources}
              className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#800000] disabled:bg-slate-100"
            >
              <option value="">Select care of instructor</option>
              {promoPdcInstructorOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Instructor</span>
            <select
              value={form.promo_schedule_pdc.instructor_id}
              onChange={(event) => onFieldChange("promo_schedule_pdc", "instructor_id", event.target.value)}
              disabled={loadingScheduleResources}
              className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#800000] disabled:bg-slate-100"
            >
              <option value="">Select instructor</option>
              {promoPdcInstructorOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Vehicle</span>
            <select
              value={form.promo_schedule_pdc.vehicle_id}
              onChange={(event) => onFieldChange("promo_schedule_pdc", "vehicle_id", event.target.value)}
              disabled={loadingScheduleResources}
              className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#800000] disabled:bg-slate-100"
            >
              <option value="">Select vehicle</option>
              {promoVehicleOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            {!loadingScheduleResources && promoVehicleOptions.length === 0 ? (
              <span className="text-xs text-red-600">No vehicles found for the selected vehicle type.</span>
            ) : null}
          </label>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">
              {promoPdcWholeDay ? "Session Type" : "Time Slot"}
            </p>
            <p className="text-[11px] text-slate-500">
              {promoPdcWholeDay
                ? promoPdcSelectedSlot?.full
                  ? "Fully booked for the day"
                  : "Whole-day reservation"
                : promoPdcSelectedSlot
                ? promoPdcSelectedSlot.full
                  ? "Fully booked"
                  : `${promoPdcSelectedSlot.available} slot${promoPdcSelectedSlot.available === 1 ? "" : "s"} left`
                : "Select a date to view availability"}
            </p>
          </div>

          {promoPdcWholeDay ? (
            <div className={`mt-2 rounded-2xl border px-4 py-4 ${promoPdcSelectedSlot?.full ? "border-red-300 bg-red-50 text-red-700" : "border-[#d9c9a0] bg-white text-slate-800"}`}>
              <p className="text-sm font-semibold">Whole Day (08:00 AM - 05:00 PM)</p>
              <p className={`mt-1 text-xs ${promoPdcSelectedSlot?.full ? "text-red-600" : "text-slate-500"}`}>
                {promoPdcSelectedSlot?.full ? (promoPdcSelectedSlot.fullLabel || "Fully Booked") : "Reserved as whole-day motorcycle session"}
              </p>
            </div>
          ) : (
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {[
                { slot: "morning", slotLabel: "08:00 AM - 12:00 PM", full: false, available: 0 },
                { slot: "afternoon", slotLabel: "01:00 PM - 05:00 PM", full: false, available: 0 },
              ].map((fallback) => {
                const item = promoPdcSlots.find((slot) => slot.slot === fallback.slot) || fallback;
                const selected = form.promo_schedule_pdc.slot === item.slot;
                return (
                  <button
                    key={item.slot}
                    type="button"
                    disabled={Boolean(item.full)}
                    onClick={() => onFieldChange("promo_schedule_pdc", "slot", item.slot)}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      item.full
                        ? "border-red-300 bg-red-50 text-red-700"
                        : selected
                          ? "border-[#800000] bg-[#800000] text-white shadow-lg"
                          : "border-[#d9c9a0] bg-white text-slate-800 hover:border-[#800000]"
                    }`}
                  >
                    <p className="text-sm font-semibold">{item.slotLabel}</p>
                    <p className={`mt-1 text-xs ${item.full ? "text-red-600" : selected ? "text-white/80" : "text-slate-500"}`}>
                      {item.full ? (item.fullLabel || "Fully Booked") : `${item.available} slot${item.available === 1 ? "" : "s"} left`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {loadingPromoPdcAvailability ? (
            <p className="mt-3 text-sm text-slate-500">Checking PDC schedule availability...</p>
          ) : null}
        </div>
      </section>
      </>
      ) : (
      <section className="mt-8 rounded-2xl border border-dashed border-[#d9c9a0] bg-[#fff9ef] p-5">
        <h3 className="text-base font-semibold text-slate-900">PDC Details</h3>
        <p className="mt-2 text-sm text-slate-600">
          PDC is set to Schedule Later. PDC course information and schedule fields are hidden for now and can be filled once Schedule PDC Now is selected.
        </p>
      </section>
      )}
    </>
  );
}
