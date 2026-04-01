import { calculateAge } from "../../../../shared/utils/date";
import { FormField, SectionTitle, SelectField } from "../FormField";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const civilStatusOptions = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
];

import { useEffect } from "react";

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
      {type === "PDC" ? <SectionTitle>CLIENT INFORMATION</SectionTitle> : null}
      {type === "PDC" ? (
        <div className="grid gap-3 md:grid-cols-1">
          <FormField
            label="EMAIL ADDRESS"
            name="email"
            value={form.student.email}
            onChange={(event) => onFieldChange("student", "email", event.target.value)}
            placeholder="Email Address"
          />
        </div>
      ) : null}

      <SectionTitle>PERSONAL INFORMATION</SectionTitle>

      {type === "PROMO" ? (
        <div className="grid gap-3">
          <FormField
            label="EMAIL ADDRESS"
            name="email"
            value={form.student.email}
            onChange={(event) => onFieldChange("student", "email", event.target.value)}
            placeholder="Email Address"
          />
        </div>
      ) : null}

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
            label="BIRTHDATE"
            name="birthdate"
            type="date"
            value={form.profile.birthdate}
            onChange={(event) => onFieldChange("profile", "birthdate", event.target.value)}
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
            label="NATIONALITY"
            name="nationality"
            value={form.profile.nationality}
            onChange={(event) => onFieldChange("profile", "nationality", event.target.value)}
            placeholder="Nationality"
          />
          <SelectField
            label="GENDER"
            name="gender"
            value={form.profile.gender}
            onChange={(event) => onFieldChange("profile", "gender", event.target.value)}
            placeholder="Select Gender"
            options={genderOptions}
          />
        </div>
      ) : (
        <div className="mt-2 grid gap-3 md:grid-cols-3">
          <FormField
            label="BIRTHDATE"
            name="birthdate"
            type="date"
            value={form.profile.birthdate}
            onChange={(event) => onFieldChange("profile", "birthdate", event.target.value)}
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
            label="GENDER"
            name="gender"
            value={form.profile.gender}
            onChange={(event) => onFieldChange("profile", "gender", event.target.value)}
            placeholder="Select Gender"
            options={genderOptions}
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
          />
        </div>
      ) : null}

      {type === "PDC" ? (
        <>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <SelectField
              label="MARITAL STATUS"
              name="civil_status"
              value={form.profile.civil_status}
              onChange={(event) => onFieldChange("profile", "civil_status", event.target.value)}
              placeholder="Select Marital Status"
              options={civilStatusOptions}
            />
            <FormField
              label="CONTACT NUMBER"
              name="phone"
              value={form.student.phone}
              onChange={(event) => onFieldChange("student", "phone", event.target.value)}
              placeholder="Contact Number"
            />
          </div>

          <div className="mt-2 grid gap-3 md:grid-cols-1">
            <FormField
              label="FB ACCOUNT LINK"
              name="fb_link"
              value={form.profile.fb_link}
              onChange={(event) => onFieldChange("profile", "fb_link", event.target.value)}
              placeholder="FB Account Link"
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
        />
        <FormField
          label="STREET / PHASE / SUBDIVISION"
          name="street"
          value={form.profile.street}
          onChange={(event) => onFieldChange("profile", "street", event.target.value)}
          placeholder="Street / Phase / Subdivision"
        />
      </div>

      {type === "PDC" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <FormField
            label="REGION"
            name="region"
            value={form.extras.region}
            onChange={(event) => onFieldChange("extras", "region", event.target.value)}
            placeholder="Region"
          />
          <FormField
            label="PROVINCE"
            name="province"
            value={form.profile.province}
            onChange={(event) => onFieldChange("profile", "province", event.target.value)}
            placeholder="Province"
          />
        </div>
      ) : null}

      {type === "TDC" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <FormField
            label="PROVINCE"
            name="province"
            value={form.profile.province}
            onChange={(event) => onFieldChange("profile", "province", event.target.value)}
            placeholder="Province"
          />
          <FormField
            label="CITY / MUNICIPALITY"
            name="city"
            value={form.profile.city}
            onChange={(event) => onFieldChange("profile", "city", event.target.value)}
            placeholder="City / Municipality"
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
          />
          <FormField
            label="PROVINCE"
            name="province"
            value={form.profile.province}
            onChange={(event) => onFieldChange("profile", "province", event.target.value)}
            placeholder="Province"
          />
        </div>
      ) : null}

      {type === "PDC" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <FormField
            label="CITY / MUNICIPALITY"
            name="city"
            value={form.profile.city}
            onChange={(event) => onFieldChange("profile", "city", event.target.value)}
            placeholder="City / Municipality"
          />
          <FormField
            label="BARANGAY / DISTRICT"
            name="barangay"
            value={form.profile.barangay}
            onChange={(event) => onFieldChange("profile", "barangay", event.target.value)}
            placeholder="Barangay / District"
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
          />
          <FormField
            label="ZIP CODE"
            name="zip_code"
            value={form.profile.zip_code}
            onChange={(event) => onFieldChange("profile", "zip_code", event.target.value)}
            placeholder="Zip Code"
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
          />
        </div>
      ) : null}

      {type === "PDC" ? (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <FormField
            label="ZIP CODE"
            name="zip_code"
            value={form.profile.zip_code}
            onChange={(event) => onFieldChange("profile", "zip_code", event.target.value)}
            placeholder="Zip Code"
          />
        </div>
      ) : null}
    </>
  );
}
