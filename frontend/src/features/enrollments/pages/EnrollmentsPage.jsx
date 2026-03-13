import { useEffect, useRef, useState } from "react";
import { ArrowLeft, GraduationCap, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EnrollmentTypeSwitcher from "../components/EnrollmentTypeSwitcher";
import { getEnrollmentTypeLabel } from "../components/enrollmentTypeOptions";
import { AddressSection, PersonalInfoSection } from "../components/sections/CommonSections";
import PdcFormSections from "../components/sections/PdcFormSections";
import PromoFormSections from "../components/sections/PromoFormSections";
import TdcFormSections from "../components/sections/TdcFormSections";
import { useCreateEnrollment } from "../hooks/useCreateEnrollment";
import ToastStack from "../../students/components/ToastStack";

const INITIAL_FORM = {
  student: {
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
  },
  profile: {
    birthdate: "",
    age: "",
    gender: "",
    civil_status: "",
    nationality: "",
    fb_link: "",
    house_number: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    zip_code: "",
  },
  enrollment: {
    client_type: "",
    is_already_driver: false,
    target_vehicle: "",
    transmission_type: "",
    motorcycle_type: "",
    training_method: "On Site",
    pdc_category: "",
  },
  extras: {
    region: "",
    enrolling_for: "PDC",
    educational_attainment: "",
    emergency_contact_person: "",
    emergency_contact_number: "",
    lto_portal_account: "",
    tdc_training_method: "Onsite",
    pdc_training_method: "Onsite",
  },
};

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildEnrollmentPayload(type, form) {
  const promoPdcTrainingMethod = "Onsite";
  const promoTrainingMethod = [
    form.extras.tdc_training_method ? `TDC: ${form.extras.tdc_training_method}` : null,
    `PDC: ${promoPdcTrainingMethod}`,
  ]
    .filter(Boolean)
    .join(" | ");

  return {
    enrollment_type: type,
    student: {
      first_name: form.student.first_name,
      middle_name: form.student.middle_name,
      last_name: form.student.last_name,
      email: form.student.email,
      phone: form.student.phone,
    },
    profile: {
      birthdate: form.profile.birthdate || null,
      age: toNullableNumber(form.profile.age),
      gender: form.profile.gender,
      civil_status: form.profile.civil_status,
      nationality: form.profile.nationality,
      fb_link: form.profile.fb_link,
      house_number: form.profile.house_number,
      street: form.profile.street,
      barangay: form.profile.barangay,
      city: form.profile.city,
      province: form.profile.province,
      zip_code: form.profile.zip_code,
    },
    extras: {
      region: form.extras.region,
      enrolling_for: type === "PDC" ? "PDC" : form.extras.enrolling_for,
      educational_attainment: form.extras.educational_attainment,
      emergency_contact_person: form.extras.emergency_contact_person,
      emergency_contact_number: form.extras.emergency_contact_number,
      lto_portal_account: form.extras.lto_portal_account,
      tdc_training_method: type === "PROMO" ? form.extras.tdc_training_method || "Onsite" : form.extras.tdc_training_method,
      pdc_training_method: type === "PROMO" ? promoPdcTrainingMethod : form.extras.pdc_training_method,
    },
    enrollment: {
      client_type:
        type === "PDC"
          ? "new"
          : type === "PROMO"
            ? "promo"
            : form.enrollment.client_type || "tdc",
      is_already_driver: type === "TDC" ? form.enrollment.is_already_driver === true : false,
      target_vehicle:
        type === "PROMO"
          ? form.enrollment.target_vehicle || null
          : type === "TDC" && form.enrollment.is_already_driver === true
          ? form.enrollment.target_vehicle || null
          : null,
      transmission_type:
        type === "TDC" && form.enrollment.is_already_driver === true
          ? form.enrollment.transmission_type || null
          : null,
      motorcycle_type:
        type === "TDC" && form.enrollment.is_already_driver === true && form.enrollment.target_vehicle === "Motorcycle"
          ? form.enrollment.motorcycle_type || null
          : null,
      training_method:
        type === "PDC"
          ? "On Site"
          : type === "PROMO"
            ? promoTrainingMethod
            : "",
      pdc_category: type === "PDC" || type === "PROMO" ? form.enrollment.pdc_category : null,
      status: "pending",
    },
  };
}

const ENROLLMENT_TYPE_CARDS = [
  { value: "TDC", label: "TDC", description: "Theoretical Driving Course" },
  { value: "PDC", label: "PDC", description: "Practical Driving Course" },
  { value: "PROMO", label: "TDC + PDC Promo", description: "Combined TDC & PDC Package" },
];

export default function EnrollmentsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const successRedirectTimeoutRef = useRef(null);
  const createEnrollmentMutation = useCreateEnrollment();

  useEffect(() => {
    return () => {
      if (successRedirectTimeoutRef.current) {
        window.clearTimeout(successRedirectTimeoutRef.current);
      }
    };
  }, []);

  function addToast(message, type = "error") {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }

  function handleFieldChange(section, field, value) {
    setForm((current) => {
      if (section !== "enrollment") {
        return {
          ...current,
          [section]: {
            ...current[section],
            [field]: value,
          },
        };
      }

      if (field === "is_already_driver") {
        const isDriver = value === true || value === "true";
        return {
          ...current,
          enrollment: {
            ...current.enrollment,
            is_already_driver: isDriver,
            target_vehicle: isDriver ? current.enrollment.target_vehicle : "",
            transmission_type: isDriver ? current.enrollment.transmission_type : "",
            motorcycle_type: isDriver ? current.enrollment.motorcycle_type : "",
          },
        };
      }

      if (field === "target_vehicle") {
        return {
          ...current,
          enrollment: {
            ...current.enrollment,
            target_vehicle: value,
            motorcycle_type: value === "Motorcycle" ? current.enrollment.motorcycle_type : "",
          },
        };
      }

      return {
        ...current,
        enrollment: {
          ...current.enrollment,
          [field]: value,
        },
      };
    });
  }

  function handleTypeChange(nextType) {
    setSelectedType(nextType);
    setIsTypeMenuOpen(false);
    setSuccessMessage("");

    if (nextType === "PDC") {
      setForm((current) => ({
        ...current,
        enrollment: {
          ...current.enrollment,
          client_type: "new",
          training_method: "On Site",
        },
        extras: {
          ...current.extras,
          enrolling_for: "PDC",
        },
      }));
      return;
    }

    if (nextType === "PROMO") {
      setForm((current) => ({
        ...current,
        enrollment: {
          ...current.enrollment,
          pdc_category: "",
        },
        extras: {
          ...current.extras,
          tdc_training_method: "Onsite",
          pdc_training_method: "Onsite",
        },
      }));
    }
  }

  function handleContinue() {
    if (selectedType) {
      setStep(1);
    }
  }

  function handleBackFromForm() {
    setStep(0);
    setIsTypeMenuOpen(false);
  }

  function resetEnrollmentFlow() {
    setForm(INITIAL_FORM);
    setSelectedType(null);
    setStep(0);
    setIsTypeMenuOpen(false);
    setSuccessMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSuccessMessage("");

    if (selectedType === "PDC" && !form.enrollment.pdc_category) {
      addToast("PDC classification is required. Please select Beginner or Experience.");
      return;
    }

    if (selectedType === "TDC" && form.enrollment.is_already_driver) {
      if (!form.enrollment.target_vehicle || !form.enrollment.transmission_type) {
        addToast("Please complete the required driving information fields.");
        return;
      }

      if (form.enrollment.target_vehicle === "Motorcycle" && !form.enrollment.motorcycle_type) {
        addToast("Please select the motorcycle type before submitting.");
        return;
      }
    }

    if (selectedType === "PROMO" && !form.enrollment.target_vehicle) {
      addToast("Please select the vehicle type for the promo enrollment.");
      return;
    }

    if (selectedType === "PROMO" && !form.enrollment.pdc_category) {
      addToast("PDC classification is required for promo enrollment.");
      return;
    }

    createEnrollmentMutation.mutate(buildEnrollmentPayload(selectedType, form), {
      onSuccess: () => {
        const nextSuccessMessage = `${getEnrollmentTypeLabel(selectedType)} submitted successfully.`;

        setSuccessMessage(nextSuccessMessage);
        setIsSuccessModalOpen(true);
        setToasts([]);

        if (successRedirectTimeoutRef.current) {
          window.clearTimeout(successRedirectTimeoutRef.current);
        }

        successRedirectTimeoutRef.current = window.setTimeout(() => {
          setIsSuccessModalOpen(false);
          resetEnrollmentFlow();
        }, 1800);
      },
    });
  }

  if (step === 0) {
    return (
      <>
        <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
        {isSuccessModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <GraduationCap size={20} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">Enrollment saved</h2>
              <p className="mt-2 text-sm text-slate-500">{successMessage}</p>
              <p className="mt-3 text-xs text-slate-400">Returning to enrollment type selection...</p>
            </div>
          </div>
        ) : null}

        <section className="w-full max-w-5xl">
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-md p-1 text-slate-700 hover:bg-slate-300"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[#800000]">
              <GraduationCap size={16} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">New Enrollment</h1>
              <p className="text-xs text-slate-500">Guardians Technical School</p>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-5 text-base font-semibold text-slate-900">Select Enrollment Type</h2>

            <div className="grid grid-cols-3 gap-4">
              {ENROLLMENT_TYPE_CARDS.map((card) => {
                const isSelected = selectedType === card.value;
                return (
                  <button
                    key={card.value}
                    type="button"
                    onClick={() => setSelectedType(card.value)}
                    className={`rounded-xl border-2 p-4 text-left transition-colors ${
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${isSelected ? "text-blue-700" : "text-slate-900"}`}>
                      {card.label}
                    </p>
                    <p className={`mt-0.5 text-xs ${isSelected ? "text-blue-500" : "text-slate-500"}`}>
                      {card.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleContinue}
                disabled={!selectedType}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue 
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      {isSuccessModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <GraduationCap size={20} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Enrollment saved</h2>
            <p className="mt-2 text-sm text-slate-500">{successMessage}</p>
            <p className="mt-3 text-xs text-slate-400">Returning to enrollment type selection...</p>
          </div>
        </div>
      ) : null}

      <section className="w-full max-w-5xl">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackFromForm}
            className="rounded-md p-1 text-slate-700 hover:bg-slate-300"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[#800000]">
            <GraduationCap size={16} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Enrollment</h1>
            <p className="text-xs text-slate-500">Guardians Technical School</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl bg-white shadow-md">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{getEnrollmentTypeLabel(selectedType)}</h2>
              <p className="mt-1 text-xs text-slate-500">Fill out the student details and submit the enrollment record.</p>
            </div>

            <EnrollmentTypeSwitcher
              isOpen={isTypeMenuOpen}
              selectedType={selectedType}
              onToggle={() => setIsTypeMenuOpen((current) => !current)}
              onSelect={handleTypeChange}
            />
          </div>

          <div className="thin-scrollbar max-h-[80vh] overflow-y-auto px-5 py-4">
            <PersonalInfoSection type={selectedType} form={form} onFieldChange={handleFieldChange} />
            <AddressSection type={selectedType} form={form} onFieldChange={handleFieldChange} />
            {selectedType === "TDC" ? <TdcFormSections form={form} onFieldChange={handleFieldChange} /> : null}
            {selectedType === "PDC" ? <PdcFormSections form={form} onFieldChange={handleFieldChange} /> : null}
            {selectedType === "PROMO" ? <PromoFormSections form={form} onFieldChange={handleFieldChange} /> : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
            <div>
              {createEnrollmentMutation.isError ? (
                <p className="text-sm text-red-600">{createEnrollmentMutation.error.message}</p>
              ) : null}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createEnrollmentMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-[#800000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#680000] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {createEnrollmentMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : null}
                {createEnrollmentMutation.isPending ? "Submitting..." : "Submit Enrollment"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </>
  );
}
