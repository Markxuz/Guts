const clientTypeOptions = [
  { value: "GUTS Walk-in Application", label: "GUTS Walk-in Application" },
  { value: "GUTS FB Page Application", label: "GUTS FB Page Application" },
  { value: "Carmona Estates Booking Office", label: "Carmona Estates Booking Office" },
];

const genderOptions = ["Male", "Female", "Prefer not to say"];
const civilStatusOptions = ["Single", "Married", "Separated", "Widowed"];
const nationalityOptions = ["Filipino", "Foreign", "Others"];
const educationalAttainmentOptions = ["College", "High School", "Elementary", "Post Graduate", "Vocational", "Informal Schooling", "Other"];
const enrollingForOptions = [
  "Theoretical Driving Course (TDC 15 hrs Lecture/Seminar) - FOR STUDENT PERMIT APPLICATION",
  "DEFENSIVE DRIVING SEMINAR (WITH NON PRO/ PRO LICENSE)",
];
const pdcClassificationOptions = ["Beginner", "Experience"];
const tdcSourceOptions = ["guts", "external"];
const trainingMethodOptions = [
  "Experienced (w/ experience in driving/Applicable para sa marunong na talaga magdrive)",
  "BEGINNER ( w/out Experience in Driving / Driving Enhancement/ Magpapaturo pa magdrive)",
  "ADD RC/DL Codes -EXPERIENCED ( Para sa mga magpapadagdag ng DL Codes na marunong na talaga magdrive)",
  "ADD RC/DL Codes -BEGINNER ( Para sa mga magpapadagdag ng DL Codes na Magpapaturo pa mag drive)",
  "DRIVING LESSON ( Para sa mga may lisensya na at may DLCodes na B/B1 na Magpapaturo pa magdrive)",
  "Other",
];
const yesNoOptions = ["true", "false"];
const tdcVehicleOptions = ["Car", "Motorcycle"];
const tdcTransmissionOptions = ["Manual", "Automatic"];
const pdcVehicleTypeOptions = [
  "DL Codes A - Motorcycle (2 wheels)",
  "DL Codes A1 - Tricycle (3 wheels)",
  "DL Codes B - Car/Sedan (4 wheels - 8 seaters below)",
  "DL Codes B1 - L300/Van (4 wheels - 9 seaters above)",
  "Other",
];
const pdcTransmissionTypeOptions = [
  "AUTOMATIC TRANSMISSION (A/T) not allowed to drive M/T",
  "MANUAL TRANSMISSION (M/T) allowed to drive A/T",
  "Other",
];
const promoPdcEnrollingForOptions = [
  "PDC Experienced",
  "PDC Beginner",
  "PDC Additional Restriction / DL Codes - Experienced",
  "PDC Additional Restriction / DL Codes- Beginner",
  "DRIVING LESSON ( w/ license already)",
  "Other",
];
const promoDrivingSchoolOptions = ["GUTS Driving School", "Other"];

function section(title, description, fields = []) {
  return { title, description, fields };
}

function textField(name, label, required = false, extra = {}) {
  return { name, label, type: "text", required, ...extra };
}

function selectField(name, label, options, required = false, extra = {}) {
  return { name, label, type: "select", required, options, ...extra };
}

function dateField(name, label, required = false, extra = {}) {
  return { name, label, type: "date", required, ...extra };
}

const templatesByType = {
  TDC: {
    enrollment_type: "TDC",
    name: "TDC Enrollment Form",
    description: "Technical Driving Course public enrollment form",
    sections: [
      section("CLIENT INFORMATION", "Tell us which intake and client category applies to this submission.", [
        selectField("enrollment.promo_offer_id", "PROMO OFFER", [], false),
        selectField("enrollment.client_type", "CLIENT TYPE", clientTypeOptions, true),
      ]),
      section("PERSONAL INFORMATION", "Fill out student details and submit the enrollment record.", [
        textField("student.first_name", "FIRST NAME", true),
        textField("student.middle_name", "MIDDLE NAME", false),
        textField("student.last_name", "LAST NAME", true),
        { name: "profile.birthdate", label: "BIRTHDATE", type: "date", required: true },
        textField("profile.age", "AGE", false, { readOnly: true }),
        selectField("profile.nationality", "NATIONALITY", nationalityOptions, true),
        textField("profile.nationality_other", "SPECIFY NATIONALITY", false),
        selectField("profile.gender", "GENDER", genderOptions, true),
        textField("student.phone", "CONTACT NUMBER", true),
        selectField("profile.civil_status", "MARITAL STATUS", civilStatusOptions, true),
        selectField("extras.educational_attainment", "Educational Attainment", educationalAttainmentOptions, true),
        textField("profile.birthplace", "BIRTHPLACE", true),
        textField("profile.fb_link", "FB ACCOUNT LINK", true),
        textField("profile.gmail_account", "GMAIL / YMAIL ACCOUNT", true),
      ]),
      section("EMERGENCY & CREDENTIALS", "Student contact and account details used during review.", [
        textField("extras.emergency_contact_person", "Emergency Contact Person", true),
        textField("extras.emergency_contact_number", "Emergency Contact Number", true),
        textField("extras.lto_portal_account", "LTO/LTMS Portal Account ( LTO Client Id No. )", true),
      ]),
      section("COURSE INFORMATION", "Select the enrollment purpose for this TDC intake.", [
        selectField("extras.enrolling_for", "ENROLLING FOR", enrollingForOptions, true),
      ]),
      section("ADDRESS", "Collect the address details needed for the student profile.", [
        textField("profile.house_number", "HOUSE NUMBER / BLDG NAME", true),
        textField("profile.street", "STREET / PHASE / SUBDIVISION", true),
        selectField("extras.region", "REGION", [], true),
        selectField("profile.province", "PROVINCE", [], true),
        selectField("profile.city", "CITY / MUNICIPALITY", [], true),
        selectField("profile.barangay", "BARANGAY / DISTRICT", [], true),
        textField("profile.zip_code", "ZIP CODE", false, { readOnly: true }),
      ]),
      section("DRIVING INFORMATION", "TDC enrollments do not need extra driving-experience fields here. Promo selection is handled in Financial Details."),
      section("Schedule Session", "Reserve the first session while saving the enrollment.", [
        dateField("schedule.schedule_date", "Start Date", true),
        selectField("schedule.care_of_instructor_id", "Care of", [], true),
        selectField("schedule.instructor_id", "Instructor", [], true),
        { type: "note", content: "Whole-day lecture session. Vehicle assignment is not required." }
      ])
    ],
  },
  PDC: {
    enrollment_type: "PDC",
    name: "PDC Enrollment Form",
    description: "Professional Driving Course public enrollment form",
    sections: [
      section("CLIENT INFORMATION", "Tell us which intake and client category applies to this submission.", [
        selectField("enrollment.promo_offer_id", "PROMO OFFER", [], false),
        selectField("enrollment.client_type", "CLIENT TYPE", clientTypeOptions, true),
      ]),
      section("PERSONAL INFORMATION", "Fill out student details and submit the enrollment record.", [
        textField("student.first_name", "FIRST NAME", true),
        textField("student.middle_name", "MIDDLE NAME", false),
        textField("student.last_name", "LAST NAME", true),
        { name: "profile.birthdate", label: "BIRTHDATE", type: "date", required: true },
        textField("profile.age", "AGE", false, { readOnly: true }),
        textField("profile.birthplace", "BIRTHPLACE", true),
        selectField("profile.nationality", "NATIONALITY", nationalityOptions, true),
        textField("profile.nationality_other", "SPECIFY NATIONALITY", false),
        selectField("profile.gender", "GENDER", genderOptions, true),
        textField("student.phone", "CONTACT NUMBER", true),
        selectField("profile.civil_status", "MARITAL STATUS", civilStatusOptions, true),
        textField("profile.gmail_account", "GMAIL / YMAIL ACCOUNT", true),
      ]),
      section("EMERGENCY & CREDENTIALS", "Student contact and account details used during review.", [
        textField("extras.emergency_contact_person", "Emergency Contact Person", true),
        textField("extras.emergency_contact_number", "Emergency Contact Number", true),
        textField("extras.lto_portal_account", "LTO/LTMS Portal Account ( LTO Client Id No. )", true),
      ]),
      section("COURSE INFORMATION", "Pick the PDC track and related training details.", [
        selectField("extras.enrolling_for", "ENROLLING FOR", promoPdcEnrollingForOptions, true),
        selectField("enrollment.pdc_category", "PDC CLASSIFICATION", pdcClassificationOptions, true),
        selectField("enrollment.tdc_source", "TDC SOURCE", tdcSourceOptions, true),
        selectField("enrollment.training_method", "MODE OF TRAINING", trainingMethodOptions, true),
        selectField("enrollment.is_already_driver", "MARUNONG KA NA BANG MAGMANEHO?", yesNoOptions, false),
        selectField("enrollment.target_vehicle", "ANONG SASAKYAN ANG IMAMANEHO?", pdcVehicleTypeOptions, false),
        selectField("enrollment.transmission_type", "ANONG KLASE NG TRANSMISSION?", pdcTransmissionTypeOptions, false),
        selectField("enrollment.motorcycle_type", "MOTORCYCLE TYPE", ["Automatic", "Manual"], false),
        selectField("extras.driving_school_tdc", "Driving School where you have taken your TDC", promoDrivingSchoolOptions, false),
        textField("extras.driving_school_tdc_other", "Name of Driving School", false),
        textField("extras.year_completed_tdc", "Year you completed your TDC", false),
      ]),
      section("ADDRESS", "Collect the address details needed for the student profile.", [
        textField("profile.house_number", "HOUSE NUMBER / BLDG NAME", true),
        textField("profile.street", "STREET / PHASE / SUBDIVISION", true),
        selectField("extras.region", "REGION", [], true),
        selectField("profile.province", "PROVINCE", [], true),
        selectField("profile.city", "CITY / MUNICIPALITY", [], true),
        selectField("profile.barangay", "BARANGAY / DISTRICT", [], true),
        textField("profile.zip_code", "ZIP CODE", false, { readOnly: true }),
      ]),
      section("DRIVING INFORMATION", "Driving assessment fields appear in the course section for Experience applicants."),
      section("Schedule Session", "Reserve the first session while saving the enrollment.", [
        dateField("schedule.schedule_date", "Start Date", true),
        selectField("schedule.care_of_instructor_id", "Care of", [], true),
        selectField("schedule.instructor_id", "Instructor", [], true),
        selectField("schedule.vehicle_id", "Vehicle", [], false),
      ])
    ],
  },
  PROMO: {
    enrollment_type: "PROMO",
    name: "TDC + PDC Promo Enrollment Form",
    description: "Combined Technical and Professional Driving Course enrollment",
    sections: [
      section("CLIENT INFORMATION", "Tell us which intake and client category applies to this submission.", [
        selectField("enrollment.promo_offer_id", "PROMO OFFER", [], false),
        selectField("enrollment.client_type", "CLIENT TYPE", clientTypeOptions, true),
      ]),
      section("PERSONAL INFORMATION", "Fill out student details and submit the enrollment record.", [
        textField("student.first_name", "FIRST NAME", true),
        textField("student.middle_name", "MIDDLE NAME", false),
        textField("student.last_name", "LAST NAME", true),
        { name: "profile.birthdate", label: "BIRTHDATE", type: "date", required: true },
        textField("profile.age", "AGE", false, { readOnly: true }),
        selectField("profile.nationality", "NATIONALITY", nationalityOptions, true),
        textField("profile.nationality_other", "SPECIFY NATIONALITY", false),
        selectField("profile.gender", "GENDER", genderOptions, true),
        textField("student.phone", "CONTACT NUMBER", true),
        selectField("profile.civil_status", "MARITAL STATUS", civilStatusOptions, true),
        textField("profile.birthplace", "BIRTHPLACE", true),
        textField("profile.fb_link", "FB ACCOUNT LINK", true),
        textField("profile.gmail_account", "GMAIL / YMAIL ACCOUNT", true),
      ]),
      section("EMERGENCY & CREDENTIALS", "Student contact and account details used during review.", [
        textField("extras.emergency_contact_person", "Emergency Contact Person", true),
        textField("extras.emergency_contact_number", "Emergency Contact Number", true),
        textField("extras.lto_portal_account", "LTO/LTMS Portal Account ( LTO Client Id No. )", true),
      ]),
      section("COURSE INFORMATION", "Pick the combined TDC and PDC enrollment details.", [
        selectField("extras.enrolling_for", "ENROLLING FOR", promoPdcEnrollingForOptions, true),
        selectField("enrollment.pdc_category", "PDC CLASSIFICATION", pdcClassificationOptions, true),
        selectField("enrollment.tdc_source", "TDC SOURCE", tdcSourceOptions, true),
        selectField("enrollment.training_method", "MODE OF TRAINING", trainingMethodOptions, true),
        selectField("enrollment.is_already_driver", "MARUNONG KA NA BANG MAGMANEHO?", yesNoOptions, false),
        selectField("enrollment.target_vehicle", "ANONG SASAKYAN ANG IMAMANEHO?", pdcVehicleTypeOptions, false),
        selectField("enrollment.transmission_type", "ANONG KLASE NG TRANSMISSION?", pdcTransmissionTypeOptions, false),
        selectField("enrollment.motorcycle_type", "MOTORCYCLE TYPE", ["Automatic", "Manual"], false),
        selectField("extras.driving_school_tdc", "Driving School where you have taken your TDC", promoDrivingSchoolOptions, false),
        textField("extras.driving_school_tdc_other", "Name of Driving School", false),
        textField("extras.year_completed_tdc", "Year you completed your TDC", false),
      ]),
      section("ADDRESS", "Collect the address details needed for the student profile.", [
        textField("profile.house_number", "HOUSE NUMBER / BLDG NAME", true),
        textField("profile.street", "STREET / PHASE / SUBDIVISION", true),
        selectField("extras.region", "REGION", [], true),
        selectField("profile.province", "PROVINCE", [], true),
        selectField("profile.city", "CITY / MUNICIPALITY", [], true),
        selectField("profile.barangay", "BARANGAY / DISTRICT", [], true),
        textField("profile.zip_code", "ZIP CODE", false, { readOnly: true }),
      ]),
      section("TDC Schedule Session", "Enter the date you want for the TDC leg. Encoder/staff will assign the instructor and final schedule details.", [
        dateField("promo_schedule_tdc.schedule_date", "Desired Date", true),
        { type: "note", content: "Encoder/staff will assign the instructor, time slot, and final schedule details after review." }
      ]),
      section("PDC Schedule Session", "Choose whether the PDC leg should be scheduled now or left for later review.", [
        selectField(
          "promo_schedule_pdc.enabled",
          "PDC Start Option",
          [
            { value: "true", label: "Schedule Now" },
            { value: "false", label: "Schedule Later" },
          ],
          true
        ),
        dateField("promo_schedule_pdc.schedule_date", "Desired Date", false),
        { type: "note", content: "If you choose Schedule Now, staff will use your preferred date and assign the instructor, vehicle, and final slot after review." }
      ])
    ],
  },
};

function cloneTemplate(template) {
  return JSON.parse(JSON.stringify(template));
}

function inferEnrollmentTypeFromName(name) {
  const normalized = String(name || "").toLowerCase();

  if (normalized.includes("promo")) {
    return "PROMO";
  }

  if (normalized.includes("pdc")) {
    return "PDC";
  }

  if (normalized.includes("tdc")) {
    return "TDC";
  }

  return null;
}

export const QR_ENROLLMENT_TEMPLATE = {
  name: "GUTS QR Enrollment",
  description: "Public enrollment form captured from a generated QR code.",
  sections: [
    section("Enrollment Type", "Tell us what kind of enrollment you want to submit.", [
      selectField("enrollment_type", "Enrollment Type", ["TDC", "PDC", "PROMO"], true),
      selectField("enrollment.client_type", "Client Type", clientTypeOptions.map((option) => option.value), true),
      selectField("enrollment.pdc_category", "PDC Category", ["Beginner", "Experience"], false),
    ]),
  ],
};

export function buildQrEnrollmentTemplate(enrollmentType) {
  const normalizedType = String(enrollmentType || "").trim().toUpperCase();
  const template = templatesByType[normalizedType] || templatesByType.TDC;
  return cloneTemplate(template);
}

export function resolveQrEnrollmentType(template) {
  if (!template || typeof template !== "object") {
    return null;
  }

  const explicitType = String(template.enrollment_type || "").trim().toUpperCase();
  if (explicitType === "TDC" || explicitType === "PDC" || explicitType === "PROMO") {
    return explicitType;
  }

  return inferEnrollmentTypeFromName(template.name);
}