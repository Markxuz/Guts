import { calculateAge } from "../../../../shared/utils/date";
import { FormField, SectionTitle, SelectField } from "../FormField";
import { useEffect } from "react";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const civilStatusOptions = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "widowed", label: "Widow" },
  { value: "divorced", label: "Divorced" },
  { value: "separated", label: "Separated" },
  { value: "other", label: "Other" },
];

const nationalityOptions = [
  { value: "Filipino", label: "Filipino" },
  { value: "Foreign", label: "Foreign" },
];

const clientTypeOptions = [
  { value: "GUTS Walk-in Application", label: "GUTS Walk-in Application" },
  { value: "GUTS FB Page Application", label: "GUTS FB Page Application" },
  { value: "Carmona Estates Booking Office", label: "Carmona Estates Booking Office" },
];

const regionOptions = [
  { value: "REGION IV-A", label: "REGION IV-A" },
  { value: "Other", label: "Other" },
];

const provinceOptions = [
  { value: "CAVITE", label: "CAVITE" },
  { value: "LAGUNA", label: "LAGUNA" },
  { value: "Other", label: "Other" },
];

const educationalAttainmentOptions = [
  { value: "College", label: "College" },
  { value: "High School", label: "High School" },
  { value: "Elementary", label: "Elementary" },
  { value: "Post Graduate", label: "Post Graduate" },
  { value: "Vocational", label: "Vocational" },
  { value: "Informal Schooling", label: "Informal Schooling" },
  { value: "Other", label: "Other" },
];

const enrollingForOptions = [
  {
    value: "Theoretical Driving Course (TDC 15 hrs Lecture/Seminar) - FOR STUDENT PERMIT APPLICATION",
    label: "Theoretical Driving Course (TDC 15 hrs Lecture/Seminar) - FOR STUDENT PERMIT APPLICATION",
  },
  {
    value: "DEFENSIVE DRIVING SEMINAR (WITH NON PRO/ PRO LICENSE)",
    label: "DEFENSIVE DRIVING SEMINAR (WITH NON PRO/ PRO LICENSE)",
  },
];

export function PersonalInfoSection({ type, form, onFieldChange }) {
  // Auto-calculate age when birthdate changes
  useEffect(() => {
    const birthdate = form.profile.birthdate;
    const age = calculateAge(birthdate);
    if (birthdate && age !== form.profile.age) {
      onFieldChange("profile", "age", age);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.profile.birthdate]);

  return (
    <>
      {type === "PDC" || type === "TDC" || type === "PROMO" ? <SectionTitle>CLIENT INFORMATION</SectionTitle> : null}
      {type === "PDC" || type === "TDC" || type === "PROMO" ? (
        <div className="grid gap-3 md:grid-cols-2">
          <FormField
            label="EMAIL ADDRESS"
            name="email"
            value={form.student.email}
            onChange={(event) => onFieldChange("student", "email", event.target.value)}
            placeholder="Email Address"
            required
          />
          {type === "TDC" || type === "PDC" || type === "PROMO" ? (
            <SelectField
              label="CLIENT TYPE"
              name="client_type"
              value={form.enrollment.client_type}
              onChange={(event) => onFieldChange("enrollment", "client_type", event.target.value)}
              placeholder="Select Client Type"
              options={clientTypeOptions}
              required
            />
          ) : null}
        </div>
      ) : null}

      <SectionTitle>PERSONAL INFORMATION</SectionTitle>

      <div className="mt-2 grid gap-3 md:grid-cols-3">
        <FormField
          label="FIRST NAME"
          name="first_name"
          value={form.student.first_name}
          onChange={(event) => onFieldChange("student", "first_name", event.target.value)}
          placeholder="First Name"
          required
        />
        <FormField
          label="MIDDLE NAME"
          name="middle_name"
          value={form.student.middle_name}
          onChange={(event) => onFieldChange("student", "middle_name", event.target.value)}
          placeholder="Middle Name"
          required={type === "TDC" || type === "PDC" || type === "PROMO"}
        />
        <FormField
          label="LAST NAME"
          name="last_name"
          value={form.student.last_name}
          onChange={(event) => onFieldChange("student", "last_name", event.target.value)}
          placeholder="Last Name"
          required
        />
      </div>

      {type === "PDC" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-4">
          <FormField
            label="BIRTHDAY"
            name="birthdate"
            type="date"
            value={form.profile.birthdate}
            onChange={(event) => onFieldChange("profile", "birthdate", event.target.value)}
            required
          />
          <FormField
            label="AGE"
            name="age"
            type="number"
            value={form.profile.age}
            placeholder="Age"
            inputClassName="bg-slate-100 cursor-not-allowed"
            readOnly
            tabIndex={-1}
          />
          <FormField
            label="GMAIL/YMAIL ACCOUNT"
            name="gmail_account"
            value={form.profile.gmail_account}
            onChange={(event) => onFieldChange("profile", "gmail_account", event.target.value)}
            placeholder="Gmail/Ymail Account"
            required
          />
          <SelectField
            label="GENDER"
            name="gender"
            value={form.profile.gender}
            onChange={(event) => onFieldChange("profile", "gender", event.target.value)}
            placeholder="Select Gender"
            options={genderOptions}
            required
          />
        </div>
      ) : (
        <div className="mt-2 grid gap-3 md:grid-cols-4">
          <FormField
            label="BIRTHDATE"
            name="birthdate"
            type="date"
            value={form.profile.birthdate}
            onChange={(event) => onFieldChange("profile", "birthdate", event.target.value)}
            required={type === "TDC"}
          />
          <FormField
            label="AGE"
            name="age"
            type="number"
            value={form.profile.age}
            placeholder="Age"
            inputClassName="bg-slate-100 cursor-not-allowed"
            readOnly
            tabIndex={-1}
          />
          <SelectField
            label="NATIONALITY"
            name="nationality"
            value={form.profile.nationality}
            onChange={(event) => onFieldChange("profile", "nationality", event.target.value)}
            placeholder="Select Nationality"
            options={nationalityOptions}
            required={type === "TDC"}
          />
          <SelectField
            label="GENDER"
            name="gender"
            value={form.profile.gender}
            onChange={(event) => onFieldChange("profile", "gender", event.target.value)}
            placeholder="Select Gender"
            options={genderOptions}
            required={type === "TDC"}
          />
        </div>
      )}

      {type === "TDC" || type === "PROMO" ? (
        <div className="mt-2 grid gap-3">
          <FormField
            label="CONTACT NUMBER"
            name="phone"
            value={form.student.phone}
            onChange={(event) => onFieldChange("student", "phone", event.target.value)}
            placeholder="Contact Number"
            required
          />
        </div>
      ) : null}

      {type === "PROMO" ? (
        <>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <FormField
              label="BIRTHPLACE"
              name="birthplace"
              value={form.profile.birthplace}
              onChange={(event) => onFieldChange("profile", "birthplace", event.target.value)}
              placeholder="Birthplace"
              required
            />
            <FormField
              label="ACTIVE GMAIL/YMAIL ACCOUNT"
              name="gmail_account"
              value={form.profile.gmail_account}
              onChange={(event) => onFieldChange("profile", "gmail_account", event.target.value)}
              placeholder="Gmail/Ymail Account"
              required
            />
          </div>

          <SectionTitle>EMERGENCY & CREDENTIALS</SectionTitle>
          <div className="grid gap-3 md:grid-cols-1">
            <FormField
              label="LTO/LTMS Portal Account ( LTO Client Id No. )"
              name="lto_portal_account"
              value={form.extras.lto_portal_account}
              onChange={(event) => onFieldChange("extras", "lto_portal_account", event.target.value)}
              placeholder="LTO/LTMS Portal Account"
              required
            />
          </div>
        </>
      ) : null}

      {type === "TDC" ? (
        <>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <SelectField
              label="MARITAL STATUS"
              name="civil_status"
              value={form.profile.civil_status}
              onChange={(event) => onFieldChange("profile", "civil_status", event.target.value)}
              placeholder="Select Marital Status"
              options={civilStatusOptions}
              required
            />
            <SelectField
              label="Educational Attainment"
              name="educational_attainment"
              value={form.extras.educational_attainment}
              onChange={(event) => onFieldChange("extras", "educational_attainment", event.target.value)}
              placeholder="Select Educational Attainment"
              options={educationalAttainmentOptions}
              required
            />
          </div>

          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <FormField
              label="FB ACCOUNT LINK"
              name="fb_link"
              value={form.profile.fb_link}
              onChange={(event) => onFieldChange("profile", "fb_link", event.target.value)}
              placeholder="FB Account Link"
              required
            />
            <FormField
              label="GMAIL / YMAIL ACCOUNT"
              name="gmail_account"
              value={form.profile.gmail_account}
              onChange={(event) => onFieldChange("profile", "gmail_account", event.target.value)}
              placeholder="Gmail / Ymail Account"
              required
            />
          </div>

          <SectionTitle>EMERGENCY & CREDENTIALS</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              label="Emergency Contact Person"
              name="emergency_contact_person"
              value={form.extras.emergency_contact_person}
              onChange={(event) => onFieldChange("extras", "emergency_contact_person", event.target.value)}
              placeholder="Emergency Contact Person"
              required
            />
            <FormField
              label="Emergency Contact Number"
              name="emergency_contact_number"
              value={form.extras.emergency_contact_number}
              onChange={(event) => onFieldChange("extras", "emergency_contact_number", event.target.value)}
              placeholder="Emergency Contact Number"
              required
            />
          </div>
          <div className="mt-2 grid gap-3 md:grid-cols-1">
            <FormField
              label="LTO/LTMS Portal Account ( LTO Client Id No. )"
              name="lto_portal_account"
              value={form.extras.lto_portal_account}
              onChange={(event) => onFieldChange("extras", "lto_portal_account", event.target.value)}
              placeholder="LTO/LTMS Portal Account"
              required
            />
          </div>

          <SectionTitle>COURSE INFORMATION</SectionTitle>
          <div className="grid gap-3 md:grid-cols-1">
            <SelectField
              label="ENROLLING FOR"
              name="enrolling_for"
              value={form.extras.enrolling_for}
              onChange={(event) => onFieldChange("extras", "enrolling_for", event.target.value)}
              placeholder="Select Enrollment Purpose"
              options={enrollingForOptions}
              required
            />
          </div>
        </>
      ) : null}

      {type === "PDC" ? (
        <>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <SelectField
              label="Civil Status"
              name="civil_status"
              value={form.profile.civil_status}
              onChange={(event) => onFieldChange("profile", "civil_status", event.target.value)}
              placeholder="Select Marital Status"
              options={civilStatusOptions}
              required
            />
            <FormField
              label="CONTACT NUMBER"
              name="phone"
              value={form.student.phone}
              onChange={(event) => onFieldChange("student", "phone", event.target.value)}
              placeholder="Contact Number"
              required
            />
          </div>
        </>
      ) : null}
    </>
  );
}

export function AddressSection({ type, form, onFieldChange }) {
  return (
    <>
      <SectionTitle>ADDRESS</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        <FormField
          label="HOUSE NUMBER / BLDG NAME"
          name="house_number"
          value={form.profile.house_number}
          onChange={(event) => onFieldChange("profile", "house_number", event.target.value)}
          placeholder="House Number / Bldg Name"
          required={type === "PDC" || type === "TDC" || type === "PROMO"}
        />
        <FormField
          label="STREET / PHASE / SUBDIVISION"
          name="street"
          value={form.profile.street}
          onChange={(event) => onFieldChange("profile", "street", event.target.value)}
          placeholder="Street / Phase / Subdivision"
          required={type === "PDC" || type === "TDC" || type === "PROMO"}
        />
      </div>

      {type === "PDC" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <FormField
            label="PROVINCE"
            name="province"
            value={form.profile.province}
            onChange={(event) => onFieldChange("profile", "province", event.target.value)}
            placeholder="Province"
            required
          />
          <FormField
            label="MUNICIPALITY"
            name="city"
            value={form.profile.city}
            onChange={(event) => onFieldChange("profile", "city", event.target.value)}
            placeholder="Municipality"
            required
          />
        </div>
      ) : null}

      {type === "TDC" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <SelectField
            label="REGION"
            name="region"
            value={form.extras.region}
            onChange={(event) => onFieldChange("extras", "region", event.target.value)}
            placeholder="Select Region"
            options={regionOptions}
            required
          />
          <SelectField
            label="PROVINCE"
            name="province"
            value={form.profile.province}
            onChange={(event) => onFieldChange("profile", "province", event.target.value)}
            placeholder="Select Province"
            options={provinceOptions}
            required
          />
        </div>
      ) : null}

      {type === "TDC" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <FormField
            label="CITY / MUNICIPALITY"
            name="city"
            value={form.profile.city}
            onChange={(event) => onFieldChange("profile", "city", event.target.value)}
            placeholder="City / Municipality"
            required
          />
        </div>
      ) : null}

      {type === "PROMO" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <FormField
            label="BARANGAY / DISTRICT"
            name="barangay"
            value={form.profile.barangay}
            onChange={(event) => onFieldChange("profile", "barangay", event.target.value)}
            placeholder="Barangay / District"
            required
          />
          <SelectField
            label="PROVINCE"
            name="province"
            value={form.profile.province}
            onChange={(event) => onFieldChange("profile", "province", event.target.value)}
            placeholder="Select Province"
            options={provinceOptions}
            required
          />
        </div>
      ) : null}

      {type === "PDC" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-1">
          <FormField
            label="BARANGAY / DISTRICT"
            name="barangay"
            value={form.profile.barangay}
            onChange={(event) => onFieldChange("profile", "barangay", event.target.value)}
            placeholder="Barangay / District"
            required
          />
        </div>
      ) : null}

      {type === "PROMO" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <FormField
            label="CITY / MUNICIPALITY"
            name="city"
            value={form.profile.city}
            onChange={(event) => onFieldChange("profile", "city", event.target.value)}
            placeholder="City / Municipality"
            required
          />
          <FormField
            label="ZIP CODE"
            name="zip_code"
            value={form.profile.zip_code}
            onChange={(event) => onFieldChange("profile", "zip_code", event.target.value)}
            placeholder="Zip Code"
            required
          />
        </div>
      ) : null}

      {type === "TDC" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <FormField
            label="BARANGAY / DISTRICT"
            name="barangay"
            value={form.profile.barangay}
            onChange={(event) => onFieldChange("profile", "barangay", event.target.value)}
            placeholder="Barangay / District"
            required
          />
          <FormField
            label="ZIP CODE"
            name="zip_code"
            value={form.profile.zip_code}
            onChange={(event) => onFieldChange("profile", "zip_code", event.target.value)}
            placeholder="Zip Code"
            required
          />
        </div>
      ) : null}

    </>
  );
}
